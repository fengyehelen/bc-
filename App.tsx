import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Language, Platform, User, UserTask, SortOption, Activity, Admin } from './types';
import { LANGUAGES, TRANSLATIONS, MOCK_PLATFORMS, MOCK_ACTIVITIES } from './constants';
import { MockDb } from './services/mockDb';
import Layout from './components/Layout';
import AdminApp from './components/AdminApp';
import { 
  HomeView, TaskDetailView, MyTasksView, ProfileView, ReferralView, 
  ActivityDetailView, UserLogin 
} from './components/UserApp';

// Main App Controller
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Shared Data State (Single Source of Truth)
  const [users, setUsers] = useState<User[]>([]); 
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [lang, setLang] = useState<Language>('en');
  const [sort, setSort] = useState<SortOption>(SortOption.NEWEST);

  // Load initial data from DB
  useEffect(() => {
    setUsers(MockDb.getUsers());
    setPlatforms(MockDb.getPlatforms());
    setActivities(MockDb.getActivities());
    setAdmins(MockDb.getAdmins());

    const l = navigator.language.split('-')[0];
    if (l in TRANSLATIONS) setLang(l as Language);
  }, []);

  // Save data on change to sync between tabs/reloads
  useEffect(() => { if(users.length > 0) MockDb.saveUsers(users); }, [users]);
  useEffect(() => { if(platforms.length > 0) MockDb.savePlatforms(platforms); }, [platforms]);
  useEffect(() => { if(activities.length > 0) MockDb.saveActivities(activities); }, [activities]);
  useEffect(() => { if(admins.length > 0) MockDb.saveAdmins(admins); }, [admins]);

  const t = TRANSLATIONS[lang];

  // --- ACTIONS (Passed down to components) ---

  // Enhanced Login Logic: Returns error string if failed, null if success
  const handleUserAuth = (phone: string, password: string, isRegister: boolean): string | null => {
    const existingUser = users.find(u => u.phone === phone);

    if (isRegister) {
        if (existingUser) {
            return "Account already exists. Please login.";
        }
        // Create new user
        const mockTasks: UserTask[] = [
          { id: 't1', platformId: '1', platformName: 'RoyalWin Indonesia', logoUrl: MOCK_PLATFORMS[0].logoUrl, rewardAmount: 15000, status: 'ongoing', startTime: new Date().toISOString() },
        ];
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 8),
          phone: phone, 
          password: password,
          balance: 50, totalEarnings: 50, referralCode: 'U'+Math.floor(Math.random()*9999), invitedCount: 0, 
          myTasks: mockTasks, registrationDate: new Date().toISOString(), role: 'user', notifications: 2
        };
        setUsers([...users, newUser]);
        setUser(newUser);
        return null;
    } else {
        // Login
        if (!existingUser) {
            return "Account does not exist.";
        }
        // Check password (simple string comparison for mock)
        if (existingUser.password && existingUser.password !== password) {
            return "Incorrect password.";
        }
        // Fallback for old mock users without password
        if (!existingUser.password && password !== '123456') {
             return "Please use default password '123456'";
        }
        
        setUser(existingUser);
        return null;
    }
  };

  const handleStartTask = (p: Platform) => {
    if (!user) return;
    if (user.myTasks.some(t => t.platformId === p.id)) return; // Already joined
    const newTask: UserTask = {
       id: Date.now().toString(),
       platformId: p.id, platformName: p.name, logoUrl: p.logoUrl, rewardAmount: p.rewardAmount,
       status: 'ongoing', startTime: new Date().toISOString()
    };
    const updatedUser = { ...user, myTasks: [newTask, ...user.myTasks] };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const handleSubmitProof = (taskId: string, imgUrl: string) => {
     if (!user) return;
     const updatedTasks = user.myTasks.map(task => 
        task.id === taskId ? { ...task, status: 'reviewing', proofImageUrl: imgUrl, submissionTime: new Date().toISOString() } as UserTask : task
     );
     const updatedUser = { ...user, myTasks: updatedTasks };
     setUser(updatedUser);
     setUsers(users.map(u => u.id === user.id ? updatedUser : u));
     alert("Proof Submitted! Waiting for audit.");
  };

  const updateTaskStatus = (userId: string, taskId: string, status: 'completed' | 'rejected') => {
     const targetUser = users.find(u => u.id === userId);
     if (!targetUser) return;
     const task = targetUser.myTasks.find(t => t.id === taskId);
     const reward = task?.rewardAmount || 0;
     const updatedUser: User = {
        ...targetUser,
        balance: status === 'completed' ? targetUser.balance + reward : targetUser.balance,
        totalEarnings: status === 'completed' ? targetUser.totalEarnings + reward : targetUser.totalEarnings,
        myTasks: targetUser.myTasks.map(t => t.id === taskId ? { ...t, status } : t)
     };
     setUsers(users.map(u => u.id === userId ? updatedUser : u));
     if (user?.id === userId) setUser(updatedUser);
  };

  const updateUserPassword = (userId: string, newPass: string) => {
      setUsers(users.map(u => u.id === userId ? { ...u, password: newPass } : u));
  };

  const handleBindCard = (bank: string, name: string, no: string) => {
    if (!user) return;
    const updatedUser: User = { ...user, bankInfo: `${bank} - ${name} - ${no}` };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  return (
    <Router>
      <Routes>
        {/* =========================================
            BACKEND: OPERATIONS PORTAL (/admin)
            Access via: /#/admin
           ========================================= */}
        <Route path="/admin/*" element={
            <AdminApp 
              users={users} 
              tasks={platforms} 
              activities={activities}
              admins={admins}
              updateTaskStatus={updateTaskStatus}
              updateUserPassword={updateUserPassword} 
              addActivity={(a) => {
                  setActivities(prev => [...prev, a]);
              }}
              addTask={(task) => setPlatforms([...platforms, task])}
              addAdmin={(a) => setAdmins([...admins, a])}
              lang={lang}
            />
        } />
        
        {/* =========================================
            FRONTEND: USER PRODUCT (/)
            Access via: /#/
           ========================================= */}
           
        {/* Login Route (Standalone, no Layout) */}
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <UserLogin onAuth={handleUserAuth} t={t} lang={lang} />
        } />

        {/* Protected Routes (With Layout) */}
        {user ? (
          <Route path="/" element={<Layout lang={lang} setLang={setLang}><Outlet /></Layout>}>
            <Route index element={<HomeView platforms={platforms} activities={activities} t={t} setSort={setSort} sort={sort} lang={lang} />} />
            <Route path="referral" element={<ReferralView user={user} t={t} lang={lang} />} />
            <Route path="tasks" element={<MyTasksView user={user} onSubmitProof={handleSubmitProof} t={t} lang={lang} />} />
            <Route path="profile" element={<ProfileView user={user} t={t} logout={() => setUser(null)} lang={lang} onBindCard={handleBindCard} />} />
            <Route path="task-detail/:id" element={<TaskDetailView platforms={platforms} onStartTask={handleStartTask} t={t} lang={lang} />} />
            <Route path="activity/:id" element={<ActivityDetailView activities={activities} t={t} />} />
            {/* Catch-all inside authenticated layout */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          // If not logged in and trying to access anything other than /admin or /login, redirect to /login
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
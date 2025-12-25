import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Language, Platform, User, UserTask, SortOption, Activity, Admin, SystemConfig, Message, Transaction, BankAccount } from './types';
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
  
  // Shared Data State
  const [users, setUsers] = useState<User[]>([]); 
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [config, setConfig] = useState<SystemConfig>(MockDb.getConfig());

  const [lang, setLang] = useState<Language>('en');
  const [sort, setSort] = useState<SortOption>(SortOption.NEWEST);

  // Load initial data from DB
  useEffect(() => {
    setUsers(MockDb.getUsers());
    setPlatforms(MockDb.getPlatforms());
    setActivities(MockDb.getActivities());
    setAdmins(MockDb.getAdmins());
    setConfig(MockDb.getConfig());

    const l = navigator.language.split('-')[0];
    if (l in TRANSLATIONS) setLang(l as Language);
  }, []);

  // Save data on change
  useEffect(() => { if(users.length > 0) MockDb.saveUsers(users); }, [users]);
  useEffect(() => { if(platforms.length > 0) MockDb.savePlatforms(platforms); }, [platforms]);
  useEffect(() => { if(activities.length > 0) MockDb.saveActivities(activities); }, [activities]);
  useEffect(() => { if(admins.length > 0) MockDb.saveAdmins(admins); }, [admins]);
  useEffect(() => { MockDb.saveConfig(config); }, [config]);

  const t = TRANSLATIONS[lang];

  // --- ACTIONS ---

  const handleUserAuth = (phone: string, password: string, isRegister: boolean, inviteCode?: string): string | null => {
    const existingUser = users.find(u => u.phone === phone);

    if (isRegister) {
        if (existingUser) return "Account already exists.";
        
        // Handle Referral
        let referrerId = undefined;
        if (inviteCode) {
           const upline = users.find(u => u.referralCode === inviteCode);
           if (upline) {
               referrerId = upline.id;
               // Update upline count
               const updatedUplines = users.map(u => {
                  if (u.id === upline.id) return { ...u, invitedCount: u.invitedCount + 1 };
                  return u;
               });
               setUsers(updatedUplines); // Temporary update
           }
        }

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 8),
          phone: phone, 
          password: password,
          balance: config.initialBalance, 
          totalEarnings: config.initialBalance, 
          referralCode: 'U'+Math.floor(Math.random()*99999), 
          referrerId: referrerId,
          invitedCount: 0, 
          myTasks: [], 
          registrationDate: new Date().toISOString(), 
          role: 'user', 
          bankAccounts: [], // Initial empty array
          messages: [{
            id: 'm1', title: 'Welcome', content: 'Welcome to BetBounty! Start earning today.', date: new Date().toISOString(), read: false
          }],
          transactions: config.initialBalance > 0 ? [{
            id: 'tx_init', type: 'system_bonus', amount: config.initialBalance, date: new Date().toISOString(), description: 'Registration Bonus', status: 'success'
          }] : []
        };
        
        // Merge upline updates if any
        setUsers(prev => {
            if (referrerId) {
                return [...prev.map(u => u.id === referrerId ? { ...u, invitedCount: u.invitedCount + 1 } : u), newUser];
            }
            return [...prev, newUser];
        });
        setUser(newUser);
        return null;
    } else {
        if (!existingUser) return "Account does not exist.";
        if (existingUser.password && existingUser.password !== password) return "Incorrect password.";
        // Simple fallback
        if (!existingUser.password && password !== '123456') return "Incorrect password.";
        
        // Migrate legacy users with single bankInfo to bankAccounts array if needed
        // @ts-ignore
        if (existingUser.bankInfo && (!existingUser.bankAccounts || existingUser.bankAccounts.length === 0)) {
            // @ts-ignore
            existingUser.bankAccounts = [{ id: 'legacy', ...existingUser.bankInfo }];
        }
        
        setUser(existingUser);
        return null;
    }
  };

  const handleStartTask = (p: Platform) => {
    if (!user) return;
    if (user.myTasks.some(t => t.platformId === p.id)) return; 
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

  // RECURSIVE COMMISSION FUNCTION
  const distributeCommissions = (allUsers: User[], currentUserId: string, amount: number, level: number = 1): User[] => {
     if (level > 3) return allUsers;
     const currentUser = allUsers.find(u => u.id === currentUserId);
     if (!currentUser || !currentUser.referrerId) return allUsers;

     const uplineId = currentUser.referrerId;
     const rate = level === 1 ? 0.20 : level === 2 ? 0.10 : 0.05;
     const commAmount = amount * rate;
     
     if (commAmount <= 0) return allUsers;

     // Update Upline
     const updatedUsers = allUsers.map(u => {
         if (u.id === uplineId) {
             const tx: Transaction = {
                 id: `comm_${Date.now()}_${level}`,
                 type: 'referral_bonus',
                 amount: commAmount,
                 date: new Date().toISOString(),
                 description: `Level ${level} Commission from user ${currentUser.phone}`,
                 status: 'success'
             };
             return {
                 ...u,
                 balance: u.balance + commAmount,
                 totalEarnings: u.totalEarnings + commAmount,
                 transactions: [tx, ...u.transactions]
             };
         }
         return u;
     });

     // Recurse to next level upline
     return distributeCommissions(updatedUsers, uplineId, amount, level + 1);
  };

  const updateTaskStatus = (userId: string, taskId: string, status: 'completed' | 'rejected') => {
     // 1. Find User and Task
     let currentUsers = [...users];
     const targetUserIndex = currentUsers.findIndex(u => u.id === userId);
     if (targetUserIndex === -1) return;
     const targetUser = currentUsers[targetUserIndex];
     const task = targetUser.myTasks.find(t => t.id === taskId);
     if (!task) return;

     const reward = task.rewardAmount;

     // 2. Update User Task Status & Balance (if completed)
     const newTaskStatus = status;
     let updatedUser = {
        ...targetUser,
        myTasks: targetUser.myTasks.map(t => t.id === taskId ? { ...t, status: newTaskStatus } : t)
     };

     if (status === 'completed') {
         const tx: Transaction = {
             id: `rew_${taskId}`, type: 'task_reward', amount: reward, date: new Date().toISOString(), description: `Task Reward: ${task.platformName}`, status: 'success'
         };
         updatedUser.balance += reward;
         updatedUser.totalEarnings += reward;
         updatedUser.transactions = [tx, ...updatedUser.transactions];
     }
     
     // Update local user array
     currentUsers[targetUserIndex] = updatedUser;

     // 3. Handle Commissions (if completed)
     if (status === 'completed') {
         currentUsers = distributeCommissions(currentUsers, userId, reward);
     }

     setUsers(currentUsers);
     if (user?.id === userId) setUser(currentUsers.find(u => u.id === userId) || null);
  };

  const updateUserPassword = (userId: string, newPass: string) => {
      setUsers(users.map(u => u.id === userId ? { ...u, password: newPass } : u));
  };

  const handleBindCard = (bankName: string, accountName: string, accountNumber: string, type: 'bank'|'ewallet') => {
    if (!user) return;
    const newAccount: BankAccount = { 
        id: 'acc_' + Date.now(),
        bankName, accountName, accountNumber, type 
    };
    // Append to existing accounts
    const updatedAccounts = [...(user.bankAccounts || []), newAccount];
    const updatedUser: User = { ...user, bankAccounts: updatedAccounts };
    
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const handleWithdraw = (amount: number, accountId: string) => {
      if (!user) return;
      if (amount < config.minWithdrawAmount) return alert(`${t.minWithdrawErr} ${config.minWithdrawAmount}`);
      if (user.balance < amount) return alert(t.insufficient);
      
      const account = user.bankAccounts.find(a => a.id === accountId);
      if (!account) return alert("Invalid account");

      const tx: Transaction = {
          id: `wd_${Date.now()}`, type: 'withdraw', amount: -amount, date: new Date().toISOString(), description: `Withdraw to ${account.bankName} (${account.accountNumber})`, status: 'pending'
      };
      
      const updatedUser: User = {
          ...user,
          balance: user.balance - amount,
          transactions: [tx, ...user.transactions]
      };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      alert("Withdrawal submitted!");
  };

  const handleAdminMessage = (userId: string | 'all', title: string, content: string) => {
      const msg: Message = {
          id: `msg_${Date.now()}`, title, content, date: new Date().toISOString(), read: false
      };
      
      if (userId === 'all') {
          setUsers(users.map(u => ({ ...u, messages: [msg, ...u.messages] })));
      } else {
          setUsers(users.map(u => u.id === userId ? { ...u, messages: [msg, ...u.messages] } : u));
      }
      alert("Message Sent!");
  };

  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={
            <AdminApp 
              users={users} 
              tasks={platforms} 
              activities={activities}
              admins={admins}
              config={config}
              updateTaskStatus={updateTaskStatus}
              updateUserPassword={updateUserPassword}
              updateConfig={setConfig}
              sendMessage={handleAdminMessage}
              addActivity={(a) => setActivities([...activities, a])}
              addTask={(task) => setPlatforms([...platforms, task])}
              addAdmin={(a) => setAdmins([...admins, a])}
              lang={lang}
            />
        } />
        
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <UserLogin onAuth={handleUserAuth} t={t} lang={lang} />
        } />

        {user ? (
          <Route path="/" element={<Layout lang={lang} setLang={setLang} telegramLink={config.telegramLinks[lang] || config.telegramLinks['en']}><Outlet /></Layout>}>
            <Route index element={<HomeView platforms={platforms} activities={activities} t={t} setSort={setSort} sort={sort} lang={lang} />} />
            <Route path="referral" element={<ReferralView user={user} users={users} t={t} lang={lang} />} />
            <Route path="tasks" element={<MyTasksView user={user} onSubmitProof={handleSubmitProof} t={t} lang={lang} />} />
            <Route path="profile" element={<ProfileView user={user} t={t} logout={() => setUser(null)} lang={lang} onBindCard={handleBindCard} onWithdraw={handleWithdraw} />} />
            <Route path="task-detail/:id" element={<TaskDetailView platforms={platforms} onStartTask={handleStartTask} t={t} lang={lang} />} />
            <Route path="activity/:id" element={<ActivityDetailView activities={activities} t={t} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
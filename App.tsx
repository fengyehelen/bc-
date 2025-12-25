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

  // Load initial data from DB and SANITIZE IT
  useEffect(() => {
    // 1. Sanitize Users
    const rawUsers = MockDb.getUsers();
    const sanitizedUsers = Array.isArray(rawUsers) ? rawUsers.map(u => {
        let safeAccounts = u.bankAccounts || [];
        // @ts-ignore - Handle legacy bankInfo
        if (!u.bankAccounts && u.bankInfo && Object.keys(u.bankInfo).length > 0) {
            // @ts-ignore
             safeAccounts = [{id:'legacy', ...u.bankInfo}];
        }
        safeAccounts = safeAccounts.filter(acc => acc.bankName && acc.accountNumber);

        return {
            ...u,
            transactions: u.transactions || [],
            messages: u.messages || [],
            myTasks: u.myTasks || [],
            bankAccounts: safeAccounts,
            currency: u.currency || LANGUAGES['en'].currency
        };
    }) : [];
    setUsers(sanitizedUsers);

    // 2. Sanitize Platforms (Tasks)
    const rawPlatforms = MockDb.getPlatforms();
    const sanitizedPlatforms = Array.isArray(rawPlatforms) ? rawPlatforms.map(p => ({
        ...p,
        targetCountries: (Array.isArray(p.targetCountries) ? p.targetCountries : ['id']) as Language[], // Ensure array
        steps: Array.isArray(p.steps) ? p.steps : [],
        status: p.status || 'online',
        rewardAmount: p.rewardAmount || 0
    })) : MOCK_PLATFORMS;
    setPlatforms(sanitizedPlatforms);

    // 3. Sanitize Activities
    const rawActivities = MockDb.getActivities();
    const sanitizedActivities = Array.isArray(rawActivities) ? rawActivities.map(a => ({
        ...a,
        targetCountries: (Array.isArray(a.targetCountries) ? a.targetCountries : ['id']) as Language[], // Ensure array
        active: a.active !== undefined ? a.active : true
    })) : MOCK_ACTIVITIES;
    setActivities(sanitizedActivities);

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
        
        let referrerId = undefined;
        if (inviteCode) {
           const upline = users.find(u => u.referralCode === inviteCode);
           if (upline) {
               referrerId = upline.id;
               const updatedUplines = users.map(u => {
                  if (u.id === upline.id) return { ...u, invitedCount: u.invitedCount + 1 };
                  return u;
               });
               setUsers(updatedUplines);
           }
        }

        const userCountry = lang; 
        const currencySymbol = LANGUAGES[userCountry].currency;
        const startBalance = config.initialBalance[userCountry] || 0;

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 8),
          phone: phone, 
          password: password,
          balance: startBalance,
          currency: currencySymbol,
          totalEarnings: startBalance, 
          referralCode: 'U'+Math.floor(Math.random()*99999), 
          referrerId: referrerId,
          invitedCount: 0, 
          myTasks: [], 
          registrationDate: new Date().toISOString(), 
          role: 'user', 
          bankAccounts: [], 
          messages: [{
            id: 'm1', title: 'Welcome', content: 'Welcome to OddsHub! Start earning today.', date: new Date().toISOString(), read: false
          }],
          transactions: startBalance > 0 ? [{
            id: 'tx_init', type: 'system_bonus', amount: startBalance, date: new Date().toISOString(), description: 'Registration Bonus', status: 'success'
          }] : []
        };
        
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
        if (!existingUser.password && password !== '123456') return "Incorrect password.";
        
        const safeUser = {
            ...existingUser,
            transactions: existingUser.transactions || [],
            bankAccounts: (existingUser.bankAccounts || []).filter(acc => acc.bankName && acc.accountNumber),
            currency: existingUser.currency || LANGUAGES['en'].currency
        };
        
        setUser(safeUser);
        return null;
    }
  };

  const handleStartTask = (p: Platform) => {
    if (!user) return;
    if (user.myTasks.some(t => t.platformId === p.id)) return; 
    
    const newTask: UserTask = {
       id: Date.now().toString(),
       platformId: p.id, 
       platformName: p.name, 
       logoUrl: p.logoUrl, 
       rewardAmount: p.rewardAmount,
       status: 'ongoing', 
       startTime: new Date().toISOString()
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

  const distributeCommissions = (allUsers: User[], currentUserId: string, amount: number, level: number = 1): User[] => {
     if (level > 3) return allUsers;
     const currentUser = allUsers.find(u => u.id === currentUserId);
     if (!currentUser || !currentUser.referrerId) return allUsers;

     const uplineId = currentUser.referrerId;
     const rate = level === 1 ? 0.20 : level === 2 ? 0.10 : 0.05;
     const commAmount = amount * rate;
     
     if (commAmount <= 0) return allUsers;

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
                 transactions: [tx, ...(u.transactions || [])]
             };
         }
         return u;
     });

     return distributeCommissions(updatedUsers, uplineId, amount, level + 1);
  };

  const updateTaskStatus = (userId: string, taskId: string, status: 'completed' | 'rejected') => {
     setUsers(prevUsers => {
         let currentUsers = [...prevUsers];
         const targetUserIndex = currentUsers.findIndex(u => u.id === userId);
         
         if (targetUserIndex === -1) return prevUsers;
         
         const targetUser = currentUsers[targetUserIndex];
         const task = targetUser.myTasks.find(t => t.id === taskId);
         
         if (!task) return prevUsers;

         const reward = task.rewardAmount;
         let updatedUser = {
            ...targetUser,
            myTasks: targetUser.myTasks.map(t => t.id === taskId ? { ...t, status: status } : t)
         };

         if (status === 'completed') {
             const tx: Transaction = {
                 id: `rew_${taskId}`, type: 'task_reward', amount: reward, date: new Date().toISOString(), description: `Task Reward: ${task.platformName}`, status: 'success'
             };
             updatedUser.balance += reward;
             updatedUser.totalEarnings += reward;
             updatedUser.transactions = [tx, ...(updatedUser.transactions || [])];
         }
         
         currentUsers[targetUserIndex] = updatedUser;
         if (status === 'completed') {
             currentUsers = distributeCommissions(currentUsers, userId, reward);
         }

         if (user && user.id === userId) {
            setUser(currentUsers.find(u => u.id === userId) || null);
         }

         return currentUsers;
     });
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
    const updatedAccounts = [...(user.bankAccounts || []), newAccount];
    const updatedUser: User = { ...user, bankAccounts: updatedAccounts };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const handleWithdraw = (amount: number, accountId: string) => {
      if (!user) return;
      const userCountryEntry = Object.entries(LANGUAGES).find(([k, v]) => v.currency === user.currency);
      const countryCode = userCountryEntry ? userCountryEntry[0] : 'en';
      const minWithdraw = config.minWithdrawAmount[countryCode] || 100;

      if (amount < minWithdraw) return alert(`${t.minWithdrawErr} ${minWithdraw}`);
      if (user.balance < amount) return alert(t.insufficient);
      
      const account = user.bankAccounts.find(a => a.id === accountId);
      if (!account) return alert("Invalid account");

      const tx: Transaction = {
          id: `wd_${Date.now()}`, type: 'withdraw', amount: -amount, date: new Date().toISOString(), description: `Withdraw to ${account.bankName} (${account.accountNumber})`, status: 'pending'
      };
      
      const updatedUser: User = {
          ...user,
          balance: user.balance - amount,
          transactions: [tx, ...(user.transactions || [])]
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

  const handleManageContent = (type: 'task'|'activity', id: string, action: 'delete'|'toggle') => {
      if (type === 'task') {
          if (action === 'delete') {
              setPlatforms(platforms.filter(p => p.id !== id));
          } else {
              setPlatforms(platforms.map(p => p.id === id ? { ...p, status: p.status === 'online' ? 'offline' : 'online' } : p));
          }
      } else {
          if (action === 'delete') {
              setActivities(activities.filter(a => a.id !== id));
          } else {
              setActivities(activities.map(a => a.id === id ? { ...a, active: !a.active } : a));
          }
      }
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
              // STRICT SANITIZATION WRAPPER
              addActivity={(a) => {
                 const safeActivity: Activity = {
                    ...a,
                    // FORCE ARRAY RECONSTRUCTION
                    targetCountries: Array.isArray(a.targetCountries) ? a.targetCountries : ['id']
                 };
                 setActivities([...activities, safeActivity]);
              }}
              // STRICT SANITIZATION WRAPPER
              addTask={(task) => {
                 const safeTask: Platform = {
                    ...task,
                    // FORCE ARRAY RECONSTRUCTION
                    targetCountries: Array.isArray(task.targetCountries) ? task.targetCountries : ['id'],
                    steps: Array.isArray(task.steps) ? task.steps : ['Download', 'Register', 'Deposit']
                 };
                 setPlatforms([...platforms, safeTask]);
              }}
              addAdmin={(a) => setAdmins([...admins, a])}
              manageContent={handleManageContent}
              lang={lang}
            />
        } />
        
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <UserLogin onAuth={handleUserAuth} t={t} lang={lang} />
        } />

        {user ? (
          <Route path="/" element={<Layout lang={lang} setLang={setLang} telegramLink={config.telegramLinks[lang] || config.telegramLinks['en']}><Outlet /></Layout>}>
            <Route index element={<HomeView platforms={platforms} activities={activities} t={t} setSort={setSort} sort={sort} lang={lang} user={user} />} />
            <Route path="referral" element={<ReferralView user={user} users={users} t={t} lang={lang} />} />
            <Route path="tasks" element={<MyTasksView user={user} onSubmitProof={handleSubmitProof} t={t} lang={lang} />} />
            <Route path="profile" element={<ProfileView user={user} t={t} logout={() => setUser(null)} lang={lang} onBindCard={handleBindCard} onWithdraw={handleWithdraw} />} />
            <Route path="task-detail/:id" element={<TaskDetailView platforms={platforms} onStartTask={handleStartTask} t={t} lang={lang} user={user} />} />
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
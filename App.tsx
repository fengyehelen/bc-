import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Language, Platform, User, UserTask, SortOption, Activity, Admin, SystemConfig, Message, Transaction, BankAccount } from './types';
import { LANGUAGES, TRANSLATIONS, MOCK_PLATFORMS, MOCK_ACTIVITIES } from './constants';
import { MockDb } from './services/mockDb';
import Layout from './components/Layout';
import AdminApp from './components/AdminApp';
import { 
  HomeView, TaskDetailView, MyTasksView, ProfileView, ReferralView, 
  ActivityDetailView, UserLogin, MailboxView, StaticPageView, TransactionHistoryView
} from './components/UserApp';
import { Coins } from 'lucide-react';

// REWARD POPUP COMPONENT
const RewardPopup: React.FC<{ amount: number; currency: string; title?: string; onClose: () => void }> = ({ amount, currency, title, onClose }) => {
    const playCoinSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.5, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
                setTimeout(() => {
                     const osc2 = ctx.createOscillator();
                     const gain2 = ctx.createGain();
                     osc2.frequency.setValueAtTime(1500, ctx.currentTime);
                     gain2.gain.setValueAtTime(0.3, ctx.currentTime);
                     gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                     osc2.connect(gain2);
                     gain2.connect(ctx.destination);
                     osc2.start();
                     osc2.stop(ctx.currentTime + 0.2);
                }, 100);
            }
        } catch (e) { console.error("Audio error", e); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-entry">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-1 rounded-2xl shadow-2xl animate-bounce-in w-64">
                <div className="bg-slate-900 rounded-xl p-6 text-center border border-white/20">
                    <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                        <Coins size={40} className="text-white animate-pulse" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-1">{title || 'Congratulations!'}</h3>
                    <p className="text-slate-300 text-xs mb-4">You received</p>
                    <div className="text-3xl font-bold text-yellow-400 mb-6 drop-shadow-md">
                        +{currency} {amount}
                    </div>
                    <button onClick={() => { playCoinSound(); onClose(); }} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); 
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [config, setConfig] = useState<SystemConfig>(MockDb.getConfig());
  const [lang, setLang] = useState<Language>('en');
  const [sort, setSort] = useState<SortOption>(SortOption.NEWEST);
  const [popupData, setPopupData] = useState<{ amount: number; title?: string } | null>(null);
  const prevTxCountRef = useRef(0);

  // Initialize
  useEffect(() => {
    const rawUsers = MockDb.getUsers();
    const sanitizedUsers = Array.isArray(rawUsers) ? rawUsers.map(u => {
        let safeAccounts = u.bankAccounts || [];
        // @ts-ignore
        if (!u.bankAccounts && u.bankInfo && Object.keys(u.bankInfo).length > 0) safeAccounts = [{id:'legacy', ...u.bankInfo}];
        safeAccounts = safeAccounts.filter(acc => acc.bankName && acc.accountNumber);
        return {
            ...u,
            transactions: u.transactions || [],
            messages: u.messages || [],
            myTasks: u.myTasks || [],
            bankAccounts: safeAccounts,
            currency: u.currency || LANGUAGES['en'].currency,
            theme: u.theme || 'dark',
            vipLevel: u.vipLevel || 1,
            likedTaskIds: u.likedTaskIds || []
        };
    }) : [];
    setUsers(sanitizedUsers);

    const rawPlatforms = MockDb.getPlatforms();
    const sanitizedPlatforms = Array.isArray(rawPlatforms) ? rawPlatforms.map(p => ({
        ...p,
        targetCountries: (Array.isArray(p.targetCountries) ? p.targetCountries : ['id']) as Language[], 
        steps: Array.isArray(p.steps) ? p.steps : [],
        status: p.status || 'online',
        rewardAmount: p.rewardAmount || 0,
        likes: p.likes || Math.floor(Math.random() * 100),
        remainingQty: p.remainingQty !== undefined ? p.remainingQty : 100,
        totalQty: p.totalQty !== undefined ? p.totalQty : 100
    })) : MOCK_PLATFORMS;
    setPlatforms(sanitizedPlatforms);

    const rawActivities = MockDb.getActivities();
    const sanitizedActivities = Array.isArray(rawActivities) ? rawActivities.map(a => ({
        ...a,
        targetCountries: (Array.isArray(a.targetCountries) ? a.targetCountries : ['id']) as Language[], 
        active: a.active !== undefined ? a.active : true,
        showPopup: a.showPopup !== undefined ? a.showPopup : false
    })) : MOCK_ACTIVITIES;
    setActivities(sanitizedActivities);

    setAdmins(MockDb.getAdmins());
    setConfig(MockDb.getConfig());

    const l = navigator.language.split('-')[0];
    if (l in TRANSLATIONS) setLang(l as Language);
  }, []);

  // Save changes
  useEffect(() => { if(users.length > 0) MockDb.saveUsers(users); }, [users]);
  useEffect(() => { if(platforms.length > 0) MockDb.savePlatforms(platforms); }, [platforms]);
  useEffect(() => { if(activities.length > 0) MockDb.saveActivities(activities); }, [activities]);
  useEffect(() => { if(admins.length > 0) MockDb.saveAdmins(admins); }, [admins]);
  useEffect(() => { MockDb.saveConfig(config); }, [config]);

  // VIP CHECKER & POPUP
  useEffect(() => {
    if (!user) return;
    
    // Check for popup transactions
    const txs = user.transactions || [];
    if (txs.length > prevTxCountRef.current) {
        const newTx = txs[0]; 
        if (newTx && newTx.amount > 0 && ['task_reward','admin_gift','referral_bonus','system_bonus','vip_bonus'].includes(newTx.type)) {
            setPopupData({ amount: newTx.amount, title: newTx.type === 'vip_bonus' ? 'VIP UPGRADE!' : undefined });
        }
        prevTxCountRef.current = txs.length;
    }

    // Check VIP Upgrade
    if (config.vipConfig && config.vipConfig.length > 0) {
        const currentLevel = user.vipLevel || 1;
        const earnings = user.totalEarnings;
        let nextLevel = currentLevel;
        let rewardAcc = 0;

        // Find max eligible level
        for (let i = currentLevel + 1; i <= 20; i++) {
            const tier = config.vipConfig.find(v => v.level === i);
            if (tier && earnings >= tier.threshold) {
                nextLevel = i;
                rewardAcc += tier.reward;
            } else {
                break;
            }
        }

        if (nextLevel > currentLevel) {
            const tx: Transaction = {
                id: `vip_${Date.now()}`, type: 'vip_bonus', amount: rewardAcc, date: new Date().toISOString(), description: `VIP Level ${nextLevel} Upgrade Bonus`, status: 'success'
            };
            const updatedUser = { 
                ...user, 
                vipLevel: nextLevel, 
                balance: user.balance + rewardAcc,
                totalEarnings: user.totalEarnings + rewardAcc,
                transactions: [tx, ...user.transactions]
            };
            setUser(updatedUser);
            setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        }
    }
  }, [user, config.vipConfig]);

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
          }] : [],
          theme: 'dark',
          vipLevel: 1,
          likedTaskIds: []
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
        if (existingUser.isBanned) return "This account has been banned.";
        
        const safeUser = {
            ...existingUser,
            transactions: existingUser.transactions || [],
            bankAccounts: (existingUser.bankAccounts || []).filter(acc => acc.bankName && acc.accountNumber),
            currency: existingUser.currency || LANGUAGES['en'].currency,
            theme: existingUser.theme || 'dark',
            vipLevel: existingUser.vipLevel || 1,
            likedTaskIds: existingUser.likedTaskIds || []
        };
        
        setUser(safeUser);
        return null;
    }
  };

  const handleStartTask = (p: Platform) => {
    if (!user) return;
    if (user.myTasks.some(t => t.platformId === p.id)) return;
    if (p.remainingQty <= 0) return alert("Task Sold Out!");
    
    const newTask: UserTask = {
       id: Date.now().toString(),
       platformId: p.id, 
       platformName: p.name, 
       logoUrl: p.logoUrl, 
       rewardAmount: p.rewardAmount,
       status: 'ongoing', 
       startTime: new Date().toISOString()
    };
    
    const updatedPlatforms = platforms.map(plat => plat.id === p.id ? { ...plat, remainingQty: plat.remainingQty - 1 } : plat);
    setPlatforms(updatedPlatforms);

    const updatedUser = { ...user, myTasks: [newTask, ...user.myTasks] };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    
    // Auto-open link
    window.open(p.downloadLink, '_blank');
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
         if (user && user.id === userId) setUser(updatedUser);
         return currentUsers;
     });
  };

  const handleAdminMessage = (userId: string | 'all', title: string, content: string, amount: number = 0) => {
      const msg: Message = { id: `msg_${Date.now()}`, title, content, date: new Date().toISOString(), read: false, rewardAmount: amount };
      const tx: Transaction = { id: `gift_${Date.now()}`, type: 'admin_gift', amount: amount, date: new Date().toISOString(), description: `Admin Gift: ${title}`, status: 'success' };

      const updateUserWithMsg = (u: User) => {
          const newMessages = [msg, ...u.messages];
          let newBalance = u.balance;
          let newTransactions = u.transactions;
          let newEarnings = u.totalEarnings;
          if (amount > 0) {
              newBalance += amount;
              newEarnings += amount;
              newTransactions = [tx, ...u.transactions];
          }
          return { ...u, messages: newMessages, balance: newBalance, transactions: newTransactions, totalEarnings: newEarnings };
      };

      if (userId === 'all') setUsers(prev => prev.map(u => updateUserWithMsg(u)));
      else setUsers(prev => prev.map(u => u.id === userId ? updateUserWithMsg(u) : u));

      if (user && (userId === 'all' || userId === user.id)) setUser(prev => prev ? updateUserWithMsg(prev) : null);
      alert("Message Sent!");
  };

  const handleManageContent = (type: 'task'|'activity'|'user', id: string, action: 'delete'|'toggle'|'pin'|'popup'|'ban') => {
      if (type === 'task') {
          if (action === 'delete') setPlatforms(platforms.filter(p => p.id !== id));
          else if (action === 'toggle') setPlatforms(platforms.map(p => p.id === id ? { ...p, status: p.status === 'online' ? 'offline' : 'online' } : p));
          else if (action === 'pin') setPlatforms(platforms.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
      } else if (type === 'activity') {
          if (action === 'delete') setActivities(activities.filter(a => a.id !== id));
          else if (action === 'toggle') setActivities(activities.map(a => a.id === id ? { ...a, active: !a.active } : a));
          else if (action === 'popup') setActivities(activities.map(a => a.id === id ? { ...a, showPopup: !a.showPopup } : a));
      } else if (type === 'user') {
          if (action === 'ban') setUsers(users.map(u => u.id === id ? { ...u, isBanned: !u.isBanned } : u));
      }
  };

  const handleLikeTask = (id: string) => {
      if (!user) return;
      if (user.likedTaskIds.includes(id)) return; // Already liked

      // Update Platform
      setPlatforms(prev => prev.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p));
      
      // Update User
      const updatedUser = { ...user, likedTaskIds: [...user.likedTaskIds, id] };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const t = TRANSLATIONS[lang];
  const clearUnreadTx = () => { if (!user) return; const updatedTxs = user.transactions.map(t => ({ ...t, read: true })); setUser({ ...user, transactions: updatedTxs } as any); }; // Simplified for now

  return (
    <Router>
      {popupData && user && (
          <RewardPopup amount={popupData.amount} currency={user.currency} title={popupData.title} onClose={() => setPopupData(null)} />
      )}
      
      <Routes>
        <Route path="/admin/*" element={
            <AdminApp 
              users={users} tasks={platforms} activities={activities} admins={admins} config={config}
              updateTaskStatus={updateTaskStatus} updateUserPassword={(uid, p) => setUsers(users.map(u => u.id === uid ? { ...u, password: p } : u))}
              updateConfig={setConfig} sendMessage={handleAdminMessage}
              addActivity={(a) => setActivities([...activities, a])}
              addTask={(task) => setPlatforms([...platforms, task])}
              addAdmin={(a) => setAdmins([...admins, a])}
              manageContent={handleManageContent} lang={lang}
            />
        } />
        
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <UserLogin onAuth={handleUserAuth} t={t} lang={lang} />} />

        {user ? (
          <Route path="/" element={<Layout lang={lang} setLang={setLang} telegramLink={config.telegramLinks[lang] || config.telegramLinks['en']} theme={user.theme} hasUnreadMsg={user.messages.some(m => !m.read)} hasUnreadTx={false}><Outlet /></Layout>}>
            <Route index element={<HomeView platforms={platforms} activities={activities} t={t} setSort={setSort} sort={sort} lang={lang} user={user} config={config} onLikeTask={handleLikeTask} onQuickJoin={handleStartTask} />} />
            <Route path="referral" element={<ReferralView user={user} users={users} t={t} lang={lang} config={config} />} />
            <Route path="tasks" element={<MyTasksView user={user} onSubmitProof={handleSubmitProof} t={t} lang={lang} />} />
            <Route path="profile" element={<ProfileView user={user} t={t} logout={() => setUser(null)} lang={lang} onBindCard={(b,n,no,type) => { const u = {...user, bankAccounts: [...user.bankAccounts, {id:'a'+Date.now(), bankName:b, accountName:n, accountNumber:no, type}]}; setUser(u); setUsers(users.map(us=>us.id===u.id?u:us)); }} onWithdraw={(a, id) => { /* simplified withdraw */ }} toggleTheme={() => setUser({...user, theme: user.theme==='gold'?'dark':'gold'})} minWithdraw={100} clearUnreadTx={clearUnreadTx} />} />
            <Route path="mailbox" element={<MailboxView user={user} t={t} markAllRead={() => { const u = {...user, messages: user.messages.map(m=>({...m, read:true}))}; setUser(u); setUsers(users.map(us=>us.id===u.id?u:us)); }} />} />
            <Route path="task-detail/:id" element={<TaskDetailView platforms={platforms} onStartTask={handleStartTask} t={t} lang={lang} user={user} />} />
            <Route path="activity/:id" element={<ActivityDetailView activities={activities} t={t} />} />
            <Route path="help" element={<StaticPageView title="Help Center" content={config.helpContent} />} />
            <Route path="about" element={<StaticPageView title="About Us" content={config.aboutContent} />} />
            <Route path="transactions" element={<TransactionHistoryView user={user} t={t} />} />
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
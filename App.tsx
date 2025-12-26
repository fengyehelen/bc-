import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Language, Platform, User, UserTask, SortOption, Activity, Admin, SystemConfig, Message, Transaction, BankAccount } from './types';
import { LANGUAGES, TRANSLATIONS, MOCK_PLATFORMS, MOCK_ACTIVITIES } from './constants';
import { MockDb } from './services/mockDb';
import Layout from './components/Layout';
import AdminApp from './components/AdminApp';
import { 
  HomeView, TaskDetailView, MyTasksView, ProfileView, ReferralView, 
  ActivityDetailView, UserLogin, MailboxView, StaticPageView, TransactionHistoryView, TasksView
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
  
  // Track last notified transaction to prevent duplicates on refresh
  const [lastNotifiedTxId, setLastNotifiedTxId] = useState<string>(() => localStorage.getItem('betbounty_last_tx') || '');

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

    // Session Restore
    const savedUserId = localStorage.getItem('betbounty_session');
    if (savedUserId) {
        const foundUser = sanitizedUsers.find(u => u.id === savedUserId);
        if (foundUser) setUser(foundUser);
    }

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
    if (txs.length > 0) {
        const newTx = txs[0]; 
        // Only show if it's a new ID we haven't shown before
        if (newTx.id !== lastNotifiedTxId && newTx.amount > 0 && ['task_reward','admin_gift','referral_bonus','system_bonus','vip_bonus'].includes(newTx.type)) {
            setPopupData({ amount: newTx.amount, title: newTx.type === 'vip_bonus' ? 'VIP UPGRADE!' : undefined });
            setLastNotifiedTxId(newTx.id);
            localStorage.setItem('betbounty_last_tx', newTx.id);
        }
    }

    // Check VIP Upgrade - Country Specific
    // Determine user country from currency logic or assume 'en' fallback
    const userCountryEntry = Object.entries(LANGUAGES).find(([k, v]) => v.currency === user.currency);
    const userCountry = userCountryEntry ? userCountryEntry[0] : 'en';
    const vipConfigForCountry = config.vipConfig?.[userCountry] || config.vipConfig?.['en'] || [];

    if (vipConfigForCountry.length > 0) {
        const currentLevel = user.vipLevel || 1;
        const earnings = user.totalEarnings;
        let nextLevel = currentLevel;
        let rewardAcc = 0;

        // Find max eligible level
        for (let i = currentLevel + 1; i <= 20; i++) {
            const tier = vipConfigForCountry.find(v => v.level === i);
            if (tier && earnings >= tier.threshold) {
                nextLevel = i;
                rewardAcc += tier.reward;
            } else {
                break;
            }
        }
        
        if (nextLevel > currentLevel) {
            const newUser = { ...user, vipLevel: nextLevel, balance: user.balance + rewardAcc };
            
            // Add transaction
            const tx: Transaction = {
                id: 'tx_vip_' + Date.now(),
                type: 'vip_bonus',
                amount: rewardAcc,
                date: new Date().toISOString(),
                description: `VIP Upgrade Level ${currentLevel} -> ${nextLevel}`,
                status: 'success'
            };
            newUser.transactions = [tx, ...newUser.transactions];
            
            setUser(newUser);
            setPopupData({ amount: rewardAcc, title: 'VIP UPGRADE!' });
            
            // Update users list
             setUsers(prev => prev.map(u => u.id === user.id ? newUser : u));
        }
    }
  }, [user, config.vipConfig, users, lastNotifiedTxId]);

  // Auth Handlers
  const handleAuth = (phone: string, pass: string, isReg: boolean, invite?: string): string | null => {
      if (isReg) {
          if (users.find(u => u.phone === phone)) return "User already exists";
          const newUser: User = {
              id: 'u_' + Date.now(),
              phone,
              password: pass,
              balance: config.initialBalance[lang] || 0,
              currency: LANGUAGES[lang].currency,
              totalEarnings: 0,
              vipLevel: 1,
              referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
              invitedCount: 0,
              myTasks: [],
              likedTaskIds: [],
              registrationDate: new Date().toISOString(),
              bankAccounts: [],
              role: 'user',
              messages: [{ id: 'm1', title: 'Welcome!', content: 'Welcome to OddsHub.', date: new Date().toISOString(), read: false }],
              transactions: config.initialBalance[lang] ? [{ id: 'tx_init', type: 'system_bonus', amount: config.initialBalance[lang], date: new Date().toISOString(), description: 'Welcome Bonus', status: 'success' }] : []
          };
          if (invite) {
              const referrer = users.find(u => u.referralCode === invite);
              if (referrer) {
                  newUser.referrerId = referrer.id;
                  // Update referrer logic (increment invite count)
                  setUsers(prev => prev.map(u => u.id === referrer.id ? { ...u, invitedCount: u.invitedCount + 1 } : u));
              }
          }
          setUsers(prev => [...prev, newUser]);
          setUser(newUser);
          localStorage.setItem('betbounty_session', newUser.id);
          return null;
      } else {
          const found = users.find(u => u.phone === phone && u.password === pass);
          if (!found) return "Invalid credentials";
          if (found.isBanned) return "Account Banned";
          setUser(found);
          localStorage.setItem('betbounty_session', found.id);
          return null;
      }
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('betbounty_session');
  };

  // User Actions
  const handleStartTask = (platform: Platform) => {
    if (!user) return; 
    if (user.myTasks.find(t => t.platformId === platform.id)) { alert("Task already started."); return; }
    
    if (platform.remainingQty <= 0) { alert("Task sold out."); return; }

    const newTask: UserTask = {
        id: 'ut_' + Date.now(),
        platformId: platform.id,
        platformName: platform.name,
        logoUrl: platform.logoUrl,
        rewardAmount: platform.rewardAmount,
        status: 'ongoing',
        startTime: new Date().toISOString()
    };
    
    const updatedUser = { ...user, myTasks: [newTask, ...user.myTasks] };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    
    const updatedPlatform = { ...platform, remainingQty: platform.remainingQty - 1 };
    setPlatforms(platforms.map(p => p.id === platform.id ? updatedPlatform : p));

    window.open(platform.downloadLink, '_blank');
  };

  const handleLikeTask = (id: string) => {
      if(!user) return;
      if(user.likedTaskIds?.includes(id)) return;
      const updatedUser = { ...user, likedTaskIds: [...(user.likedTaskIds || []), id] };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      
      const p = platforms.find(pl => pl.id === id);
      if(p) {
          const updatedPlatform = { ...p, likes: (p.likes || 0) + 1 };
          setPlatforms(platforms.map(pl => pl.id === id ? updatedPlatform : pl));
      }
  };
  
  const handleSubmitProof = (taskId: string, img: string) => {
      if(!user) return;
      const updatedTasks = user.myTasks.map(t => t.id === taskId ? { ...t, status: 'reviewing', proofImageUrl: img, submissionTime: new Date().toISOString() } as UserTask : t);
      const updatedUser = { ...user, myTasks: updatedTasks };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const handleBindCard = (bankName: string, accountName: string, accountNumber: string, type: 'bank'|'ewallet'|'crypto') => {
      if (!user) return;
      const newAcc: BankAccount = { id: 'ba_' + Date.now(), bankName, accountName, accountNumber, type };
      const updatedUser = { ...user, bankAccounts: [...(user.bankAccounts || []), newAcc] };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const handleWithdraw = (amount: number, accId: string) => {
      if(!user) return;
      if(amount > user.balance) return alert(TRANSLATIONS[lang].insufficient);
      const min = config.minWithdrawAmount[lang] || 10;
      if(amount < min) return alert(`${TRANSLATIONS[lang].minWithdrawErr} ${min}`);

      const acc = user.bankAccounts.find(a => a.id === accId);
      const tx: Transaction = {
          id: 'tx_wd_' + Date.now(),
          type: 'withdraw',
          amount: -amount,
          date: new Date().toISOString(),
          description: `Withdraw to ${acc?.bankName} (${acc?.accountNumber})`,
          status: 'pending'
      };
      const updatedUser = { ...user, balance: user.balance - amount, transactions: [tx, ...user.transactions] };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      alert("Withdrawal submitted!");
  };

  const clearUnreadTx = () => {
      // In a real app, we would mark transactions as read. 
      // For now, we rely on prevTxCountRef to detect new ones for popup only.
  };
  
  const markMessagesRead = () => {
      if(!user) return;
      const updatedUser = { ...user, messages: user.messages.map(m => ({ ...m, read: true })) };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  // Admin Actions
  const handleUpdateTaskStatus = (uid: string, tid: string, status: 'completed'|'rejected') => {
      const targetUser = users.find(u => u.id === uid);
      if(!targetUser) return;
      
      const task = targetUser.myTasks.find(t => t.id === tid);
      if(!task) return;

      let balanceUpdate = 0;
      let totalEarningsUpdate = 0;
      let newTxs = [...targetUser.transactions];

      if (status === 'completed' && task.status !== 'completed') {
          balanceUpdate = task.rewardAmount;
          totalEarningsUpdate = task.rewardAmount;
          newTxs.unshift({
              id: 'tx_rew_' + Date.now(),
              type: 'task_reward',
              amount: task.rewardAmount,
              date: new Date().toISOString(),
              description: `Task Reward: ${task.platformName}`,
              status: 'success'
          });
          
          // Referral Logic
          if(targetUser.referrerId) {
             const refUser = users.find(u => u.id === targetUser.referrerId);
             if(refUser) {
                 const bonus = Math.floor(task.rewardAmount * 0.2); // Level 1 20%
                 // Simplified update for referrer directly in users array
                 // In real app, we should use a consistent method to update state
                 setUsers(prev => prev.map(u => {
                     if (u.id === refUser.id) {
                         return {
                             ...u,
                             balance: u.balance + bonus,
                             totalEarnings: u.totalEarnings + bonus,
                             transactions: [{
                                 id: 'tx_ref_' + Date.now(),
                                 type: 'referral_bonus',
                                 amount: bonus,
                                 date: new Date().toISOString(),
                                 description: `Comms from user ${targetUser.phone}`,
                                 status: 'success'
                             }, ...u.transactions]
                         };
                     }
                     return u;
                 }));
             }
          }
      }

      const updatedTasks = targetUser.myTasks.map(t => t.id === tid ? { ...t, status } as UserTask : t);
      const updatedUser = { 
          ...targetUser, 
          myTasks: updatedTasks, 
          balance: targetUser.balance + balanceUpdate,
          totalEarnings: targetUser.totalEarnings + totalEarningsUpdate,
          transactions: newTxs
      };
      
      setUsers(prev => prev.map(u => u.id === uid ? updatedUser : u));
      if(user && user.id === uid) setUser(updatedUser);
  };

  const adminManageContent = (type: 'task'|'activity'|'user', id: string, action: 'delete'|'toggle'|'pin'|'popup'|'ban') => {
      if(type === 'task') {
          if(action === 'delete') setPlatforms(p => p.filter(x => x.id !== id));
          if(action === 'toggle') setPlatforms(p => p.map(x => x.id === id ? { ...x, status: x.status === 'online' ? 'offline' : 'online' } : x));
          if(action === 'pin') setPlatforms(p => p.map(x => x.id === id ? { ...x, isPinned: !x.isPinned } : x));
      } else if (type === 'activity') {
          if(action === 'delete') setActivities(a => a.filter(x => x.id !== id));
          if(action === 'toggle') setActivities(a => a.map(x => x.id === id ? { ...x, active: !x.active } : x));
          if(action === 'popup') setActivities(a => a.map(x => ({ ...x, showPopup: x.id === id ? !x.showPopup : false }))); // Only one popup
      } else if (type === 'user') {
          if(action === 'ban') setUsers(u => u.map(x => x.id === id ? { ...x, isBanned: !x.isBanned } : x));
      }
  };

  const adminSendMessage = (uid: string, title: string, content: string, amount = 0) => {
      const msgId = 'msg_' + Date.now();
      const newMsg: Message = { id: msgId, title, content, date: new Date().toISOString(), read: false, rewardAmount: amount };
      
      setUsers(prev => prev.map(u => {
          if (uid === 'all' || u.id === uid) {
              const txs = [...u.transactions];
              let bal = u.balance;
              if(amount > 0) {
                  bal += amount;
                  txs.unshift({
                      id: 'tx_gift_' + Date.now() + Math.random(),
                      type: 'admin_gift',
                      amount,
                      date: new Date().toISOString(),
                      description: `Gift: ${title}`,
                      status: 'success'
                  });
              }
              return { ...u, messages: [newMsg, ...u.messages], balance: bal, transactions: txs };
          }
          return u;
      }));
      if (user && (uid === 'all' || user.id === uid)) {
          // Force update local user state if logged in and target
          setUser(prev => {
                 if(!prev) return null;
                 const txs = [...prev.transactions];
                 let bal = prev.balance;
                 if(amount > 0) {
                     bal += amount;
                     txs.unshift({ id: 'tx_gift_' + Date.now(), type: 'admin_gift', amount, date: new Date().toISOString(), description: `Gift: ${title}`, status: 'success' });
                 }
                 return { ...prev, messages: [newMsg, ...prev.messages], balance: bal, transactions: txs };
          });
      }
      alert("Message sent!");
  };

  const hasUnreadMsg = user?.messages.some(m => !m.read);
  // Simple check for unread transactions (based on last view) - here we just assume false or implement more complex logic
  const hasUnreadTx = false; 

  return (
    <Router>
        {popupData && user && <RewardPopup amount={popupData.amount} currency={user.currency} title={popupData.title} onClose={() => setPopupData(null)} />}
        
        <Routes>
            <Route path="/admin" element={
                <AdminApp 
                    users={users} tasks={platforms} activities={activities} admins={admins} config={config} lang={lang}
                    updateTaskStatus={handleUpdateTaskStatus}
                    updateUserPassword={(uid, pass) => setUsers(prev => prev.map(u => u.id === uid ? { ...u, password: pass } : u))}
                    updateConfig={setConfig}
                    sendMessage={adminSendMessage}
                    addActivity={(act) => setActivities([...activities, act])}
                    addTask={(t) => setPlatforms([...platforms, t])}
                    addAdmin={(a) => setAdmins([...admins, a])}
                    manageContent={adminManageContent}
                />
            } />
            <Route path="/merchant" element={<Navigate to="/admin" />} />

            <Route element={
                user ? (
                    <Layout 
                        lang={lang} setLang={setLang} telegramLink={config.telegramLinks[lang]} 
                        theme={user.theme} hasUnreadMsg={hasUnreadMsg} hasUnreadTx={hasUnreadTx}
                    >
                        <Outlet />
                    </Layout>
                ) : <Navigate to="/login" />
            }>
                <Route path="/" element={
                    <HomeView 
                        platforms={platforms} t={TRANSLATIONS[lang]} 
                        setSort={setSort} sort={sort} lang={lang} 
                        activities={activities} user={user!} config={config}
                        onLikeTask={handleLikeTask}
                        onQuickJoin={handleStartTask}
                    />
                } />
                <Route path="/tasks" element={
                    <TasksView 
                        platforms={platforms} t={TRANSLATIONS[lang]} 
                        setSort={setSort} sort={sort} lang={lang} 
                        user={user!} config={config}
                        onLikeTask={handleLikeTask}
                        onQuickJoin={handleStartTask}
                    />
                } />
                <Route path="/my-tasks" element={<MyTasksView user={user!} t={TRANSLATIONS[lang]} onSubmitProof={handleSubmitProof} lang={lang} />} />
                <Route path="/task-detail/:id" element={<TaskDetailView platforms={platforms} onStartTask={handleStartTask} t={TRANSLATIONS[lang]} lang={lang} user={user!} />} />
                <Route path="/activity/:id" element={<ActivityDetailView activities={activities} t={TRANSLATIONS[lang]} />} />
                <Route path="/profile" element={
                    <ProfileView 
                        user={user!} t={TRANSLATIONS[lang]} logout={handleLogout} 
                        lang={lang} onBindCard={handleBindCard} onWithdraw={handleWithdraw} 
                        toggleTheme={() => {
                            const newTheme = user!.theme === 'gold' ? 'dark' : 'gold';
                            const u = { ...user!, theme: newTheme as 'dark' | 'gold' };
                            setUser(u); setUsers(users.map(x => x.id === u.id ? u : x));
                        }}
                        minWithdraw={config.minWithdrawAmount[lang] || 10}
                        clearUnreadTx={clearUnreadTx}
                        config={config}
                    />
                } />
                <Route path="/referral" element={<ReferralView user={user!} users={users} t={TRANSLATIONS[lang]} config={config} lang={lang} />} />
                <Route path="/mailbox" element={<MailboxView user={user!} t={TRANSLATIONS[lang]} markAllRead={markMessagesRead} />} />
                <Route path="/transactions" element={<TransactionHistoryView user={user!} t={TRANSLATIONS[lang]} />} />
                <Route path="/help" element={<StaticPageView title="Help Center" content={config.helpContent} />} />
                <Route path="/about" element={<StaticPageView title="About Us" content={config.aboutContent} />} />
            </Route>

            <Route path="/login" element={
                !user ? <UserLogin onAuth={handleAuth} t={TRANSLATIONS[lang]} lang={lang} /> : <Navigate to="/" />
            } />
        </Routes>
    </Router>
  );
};

export default App;
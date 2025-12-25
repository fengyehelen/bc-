import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, Platform, Activity, Language, SortOption, UserTask, Transaction } from '../types';
import { TRANSLATIONS, LANGUAGES, BANK_OPTIONS } from '../constants';
import { 
  ArrowLeft, ChevronRight, Copy, Upload, Clock, XCircle, User as UserIcon, 
  List, CheckCircle, Smartphone, Lock, MessageSquare, LogOut, QrCode, 
  CreditCard, Eye, EyeOff, ArrowDown, Sparkles, Plus, ShieldCheck, Wallet, History,
  Share2, Facebook, Twitter, Link as LinkIcon, Send, MessageCircle, Dices
} from 'lucide-react';
import Layout from './Layout';

// Format using User's Currency, not language setting
const formatMoney = (amount: number, currencySymbol: string) => {
  return `${currencySymbol} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

// --- USER LOGIN ---
export const UserLogin: React.FC<{ onAuth: (p: string, pw: string, isReg: boolean, invite?: string) => string | null; t: any; lang: Language }> = ({ onAuth, t, lang }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
     setTimer(60);
     const i = setInterval(() => setTimer(prev => {
        if(prev <= 1) clearInterval(i);
        return prev - 1;
     }), 1000);
  };

  const handleAuth = () => {
      if(!phone || !password) return alert("Please fill in phone and password");
      const error = onAuth(phone, password, isRegister, inviteCode);
      if(error) alert(error.replace(password, '***')); 
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[linear-gradient(45deg,#0f172a,#1e293b,#0f172a)] animate-gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
       <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none"></div>

       <div className="w-full max-w-sm backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl animate-entry">
         <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 animate-float">
                <Dices size={48} className="text-white drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">{t.appName}</h1>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest opacity-80">Premium Gaming Hub</p>
         </div>
         
         <div className="space-y-4">
           <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 flex items-center space-x-3 focus-within:border-yellow-500/50 focus-within:bg-slate-900/80 transition-all animate-entry delay-100">
               <Smartphone className="text-slate-400" size={20} />
               <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t.phone} className="bg-transparent text-white w-full focus:outline-none placeholder:text-slate-600" />
           </div>
           <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 flex items-center space-x-3 focus-within:border-yellow-500/50 focus-within:bg-slate-900/80 transition-all animate-entry delay-100">
               <Lock className="text-slate-400" size={20} />
               <input type={showPwd ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={t.password} className="bg-transparent text-white w-full focus:outline-none placeholder:text-slate-600" />
               <button onClick={() => setShowPwd(!showPwd)} className="text-slate-500 hover:text-white transition-colors">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
           </div>
           {isRegister && (
               <>
                   <div className="flex space-x-2 animate-entry delay-200">
                       <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 flex items-center space-x-3 flex-1 focus-within:border-yellow-500/50 transition-all">
                           <MessageSquare className="text-slate-400" size={20} />
                           <input type="text" value={code} onChange={e=>setCode(e.target.value)} placeholder={t.verifyCode} className="bg-transparent text-white w-full focus:outline-none placeholder:text-slate-600" />
                       </div>
                       <button disabled={timer > 0} onClick={startTimer} className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 rounded-xl text-xs font-bold disabled:opacity-50 w-24 border border-slate-600 hover:border-slate-500 transition-all">
                           {timer > 0 ? `${timer}s` : t.getCode}
                       </button>
                   </div>
                   <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 flex items-center space-x-3 animate-entry delay-200 focus-within:border-yellow-500/50 transition-all">
                       <QrCode className="text-slate-400" size={20} />
                       <input type="text" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} placeholder={t.inviteCode} className="bg-transparent text-white w-full focus:outline-none placeholder:text-slate-600" />
                   </div>
               </>
           )}
           <button onClick={handleAuth} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20 mt-6 hover:brightness-110 active:scale-95 transition-all uppercase tracking-wide animate-entry delay-300">
               {isRegister ? t.register : t.login}
           </button>
         </div>

         <div className="flex justify-center text-xs text-slate-400 mt-6 px-1 animate-entry delay-300">
            <span className="mr-2 opacity-70">{isRegister ? "Already have an account?" : "Don't have an account?"}</span>
            <button onClick={() => setIsRegister(!isRegister)} className="text-yellow-500 hover:text-yellow-400 font-bold hover:underline transition-all">
                {isRegister ? t.login : t.register}
            </button>
         </div>

         <div className="mt-8 pt-6 border-t border-white/10 flex justify-center animate-entry delay-300">
            <a href="#/admin" className="text-slate-500 text-[10px] flex items-center gap-2 hover:text-slate-300 transition-colors uppercase tracking-widest">
                <ShieldCheck size={12} />
                <span>{t.merchantLogin}</span>
            </a>
         </div>
       </div>
    </div>
  );
};

// --- HOME VIEW ---
export const HomeView: React.FC<{ platforms: Platform[]; t: any; setSort: (s: SortOption) => void; sort: SortOption; lang: Language; activities: Activity[]; user: User; }> = ({ platforms, t, setSort, sort, lang, activities, user }) => {
  const navigate = useNavigate();
  // Filter only online platforms and target countries
  const filteredPlatforms = React.useMemo(() => platforms.filter(p => p.status === 'online' && p.targetCountries.includes(lang)), [platforms, lang]);
  
  return (
    <div className="p-4 space-y-4">
      {/* Banner */}
      {activities.filter(a => a.active && a.targetCountries.includes(lang)).length > 0 && (
         <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-lg mb-6 cursor-pointer" onClick={() => navigate(`/activity/${activities[0].id}`)}>
           <img src={activities[0].imageUrl} className="w-full h-full object-cover" />
           <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white font-bold">{activities[0].title}</div>
         </div>
      )}

      <div className="flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur pt-2 pb-2 z-10">
         <span className="text-slate-400 text-xs font-medium">{t.sort}:</span>
         <div className="flex space-x-2">
           {[ { id: SortOption.NEWEST, label: t.sortNew }, { id: SortOption.HIGHEST_REWARD, label: t.sortReward } ].map((opt) => (
             <button key={opt.id} onClick={() => setSort(opt.id)} className={`px-3 py-1 rounded-full text-[10px] border ${sort === opt.id ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{opt.label}</button>
           ))}
         </div>
      </div>
      <div className="space-y-4 pb-12">
        {filteredPlatforms.map((p) => (
            <div key={p.id} onClick={() => navigate(`/task-detail/${p.id}`)} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-md flex space-x-4 cursor-pointer">
              <img src={p.logoUrl} className="w-20 h-20 rounded-xl bg-slate-700 object-cover" />
              <div className="flex-1">
                 <h3 className="font-bold text-white leading-tight">{p.name}</h3>
                 <span className="text-yellow-400 font-bold text-lg">{formatMoney(p.rewardAmount, user.currency)}</span>
                 <div className="flex justify-end mt-2"><button className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">{t.startTask}</button></div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export const TaskDetailView: React.FC<{ platforms: Platform[]; onStartTask: (p: Platform) => void; t: any; lang: Language; user: User; }> = ({ platforms, onStartTask, t, lang, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = platforms.find(p => p.id === id);
  if (!platform) return null;

  return (
    <div className="bg-slate-900 min-h-screen pb-32">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-20 border-b border-slate-800 p-4 flex items-center space-x-3"><button onClick={() => navigate(-1)} className="text-slate-300"><ArrowLeft size={24} /></button><h1 className="text-white font-bold text-lg flex-1 truncate">{platform.name}</h1></div>
      <div className="p-4 space-y-6">
        <div className="flex items-center space-x-4"><img src={platform.logoUrl} className="w-20 h-20 rounded-xl bg-slate-800" /><div><h2 className="text-2xl font-bold text-yellow-400">{formatMoney(platform.rewardAmount, user.currency)}</h2><p className="text-slate-400 text-sm">{platform.description}</p></div></div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700"><h3 className="text-white font-bold mb-4 flex items-center gap-2"><List size={18}/> {t.steps}</h3>{platform.steps.map((s,i) => <div key={i} className="text-slate-300 text-sm mb-2">{i+1}. {s}</div>)}</div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur z-50 max-w-md mx-auto">
        <button onClick={() => { onStartTask(platform); window.open(platform.downloadLink, '_blank'); }} className="w-full bg-yellow-500 text-slate-900 font-bold py-3.5 rounded-xl">{t.startTask}</button>
      </div>
    </div>
  );
};

export const ActivityDetailView: React.FC<{ activities: Activity[]; t: any }> = ({ activities, t }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const activity = activities.find(a => a.id === id);
  if(!activity) return null;
  return (
    <div className="bg-slate-900 min-h-screen">
      <div className="p-4 flex items-center gap-2"><button onClick={() => navigate(-1)} className="text-white"><ArrowLeft/></button><span className="text-white font-bold">{t.activityTitle}</span></div>
      <img src={activity.imageUrl} className="w-full h-64 object-cover"/>
      <div className="p-6 text-slate-300 whitespace-pre-line">{activity.content}</div>
    </div>
  );
};

export const ProfileView: React.FC<{ user: User; t: any; logout: () => void; lang: Language; onBindCard: (b: string, n: string, no: string, type: 'bank'|'ewallet') => void; onWithdraw: (amount: number, accId: string) => void }> = ({ user, t, logout, lang, onBindCard, onWithdraw }) => {
  const [modal, setModal] = useState<'bind' | 'withdraw' | null>(null);
  const [bindData, setBindData] = useState({ bank: '', name: '', no: '', type: 'bank' as 'bank'|'ewallet' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccId, setSelectedAccId] = useState('');

  const banks = BANK_OPTIONS[lang] || BANK_OPTIONS['en'];
  // Ensure we filter out bad data in frontend just in case
  const accounts = (user.bankAccounts || []).filter(acc => acc.bankName && acc.accountNumber);
  const hasAccounts = accounts.length > 0;
  const transactions = user.transactions || [];

  useEffect(() => {
      if (hasAccounts && !selectedAccId) {
          setSelectedAccId(accounts[0].id);
      }
  }, [hasAccounts, accounts, selectedAccId]);

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
       {modal === 'bind' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-700 animate-entry">
            <h3 className="text-xl font-bold text-white mb-4">{t.addAccount}</h3>
            <div className="space-y-4">
              <div>
                  <label className="text-slate-400 text-xs uppercase block mb-1">{t.bankName}</label>
                  <select value={bindData.bank} onChange={e => {
                      const sel = banks.find(b => b.name === e.target.value);
                      setBindData({...bindData, bank: e.target.value, type: sel?.type || 'bank'});
                  }} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">
                      <option value="">Select...</option>
                      {banks.map(b => <option key={b.name} value={b.name}>{b.name} ({b.type})</option>)}
                  </select>
              </div>
              <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.accHolder}</label><input type="text" value={bindData.name} onChange={e => setBindData({...bindData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
              <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.accNumber}</label><input type="tel" value={bindData.no} onChange={e => setBindData({...bindData, no: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
              <div className="flex space-x-3 mt-6"><button onClick={() => setModal(null)} className="flex-1 bg-slate-700 text-white py-3 rounded-xl">{t.cancel}</button><button onClick={() => { onBindCard(bindData.bank, bindData.name, bindData.no, bindData.type); setModal(null); }} className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl">{t.save}</button></div>
            </div>
          </div>
        </div>
       )}

       {modal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-700 animate-entry">
            <h3 className="text-xl font-bold text-white mb-4">{t.confirmWithdraw}</h3>
            {hasAccounts ? (
                <div className="space-y-4">
                    <div>
                        <label className="text-slate-400 text-xs uppercase block mb-1">{t.selectAccount}</label>
                        <select value={selectedAccId} onChange={e => setSelectedAccId(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                            ))}
                        </select>
                    </div>
                    <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.amount}</label><input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" /></div>
                    <div className="flex space-x-3 mt-6"><button onClick={() => setModal(null)} className="flex-1 bg-slate-700 text-white py-3 rounded-xl">{t.cancel}</button><button onClick={() => { onWithdraw(Number(withdrawAmount), selectedAccId); setModal(null); }} className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl">{t.submit}</button></div>
                </div>
            ) : <div className="text-center text-slate-400 py-4">Please add account first. <button onClick={() => setModal('bind')} className="text-yellow-500 underline">Add</button></div>}
          </div>
        </div>
       )}

      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-b-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center space-x-3"><div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white"><UserIcon /></div><div><p className="text-white font-bold text-lg">{user.phone}</p><p className="text-slate-400 text-xs">ID: {user.id}</p></div></div>
           <button onClick={logout} className="text-slate-400 hover:text-white"><LogOut size={20} /></button>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
           <div className="flex justify-between mb-4">
             <div><p className="text-indigo-200 text-xs uppercase mb-1">{t.balance}</p><h2 className="text-3xl font-bold text-white">{formatMoney(user.balance, user.currency)}</h2></div>
             <div className="text-right"><p className="text-slate-400 text-xs uppercase mb-1">{t.totalEarnings}</p><h2 className="text-xl font-bold text-yellow-400">{formatMoney(user.totalEarnings, user.currency)}</h2></div>
           </div>
           <div className="flex space-x-3">
             <button onClick={() => setModal('withdraw')} className="flex-1 bg-yellow-500 text-slate-900 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-400 shadow-lg">{t.withdraw}</button>
             <button onClick={() => setModal('bind')} className="flex-1 bg-slate-700 text-white py-2.5 rounded-lg font-bold text-sm border border-slate-600 hover:bg-slate-600">{t.bindCard}</button>
           </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
         {/* Bank Card Display - Horizontal Scroll */}
         <h3 className="text-sm font-bold text-slate-400 uppercase">My Accounts</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                {hasAccounts ? accounts.map(acc => (
                     <div key={acc.id} className={`flex-shrink-0 w-64 rounded-xl p-6 shadow-lg text-white relative overflow-hidden h-36 flex flex-col justify-between ${acc.type === 'ewallet' ? 'bg-gradient-to-r from-green-600 to-teal-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
                        <div className="relative z-10 flex justify-between items-start"><span className="font-bold text-lg">{acc.bankName}</span><span className="text-xs bg-white/20 px-2 py-1 rounded uppercase">{acc.type}</span></div>
                        <div className="relative z-10 font-mono text-lg tracking-wider">{acc.accountNumber}</div>
                        <div className="relative z-10 text-sm opacity-80">{acc.accountName}</div>
                     </div>
                )) : null}
                 <div onClick={() => setModal('bind')} className="flex-shrink-0 w-16 h-36 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-800"><Plus size={24} /></div>
            </div>

         {/* Transactions */}
         <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 font-bold text-white flex items-center gap-2"><History size={16} /> {t.transactions}</div>
            <div className="max-h-60 overflow-y-auto">
                {transactions.length === 0 && <div className="p-4 text-center text-slate-500 text-xs">No transactions</div>}
                {transactions.map(tx => (
                    <div key={tx.id} className="p-3 border-b border-slate-700 last:border-0 flex justify-between items-center">
                        <div><div className="text-white text-sm">{tx.description}</div><div className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString()}</div></div>
                        <div className={`font-mono text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, user.currency)}</div>
                    </div>
                ))}
            </div>
         </div>
      </div>
  </div>
  );
};

export const MyTasksView: React.FC<{ user: User; onSubmitProof: (taskId: string, img: string) => void; t: any; lang: Language }> = ({ user, onSubmitProof, t, lang }) => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'reviewing' | 'completed'>('ongoing');
  // Safe access to myTasks and strict checking
  const myTasks = user.myTasks || [];
  
  const tasks = myTasks.filter(task => {
    // Ensure task object exists and has status property
    if (!task || !task.status) return false;

    if (activeTab === 'ongoing') return task.status === 'ongoing';
    if (activeTab === 'reviewing') return task.status === 'reviewing';
    return task.status === 'completed' || task.status === 'rejected';
  });

  return (
    <div className="p-4 min-h-screen">
      <h2 className="text-xl font-bold text-white mb-4">{t.myTasksTitle}</h2>
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-4">
        {['ongoing', 'reviewing', 'completed'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === tab ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>{t.status[tab]}</button>
        ))}
      </div>
      {tasks.length === 0 ? <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">{t.noTasks}</div> :
        <div className="space-y-4">
           {tasks.map(task => (
             <div key={task.id} className={`bg-slate-800 rounded-xl p-4 border shadow-md ${task.status === 'ongoing' ? 'border-indigo-500/50' : 'border-slate-700'}`}>
               <div className="flex space-x-3 mb-3">
                 <img src={task.logoUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg bg-slate-700" />
                 <div><h3 className="font-bold text-white">{task.platformName}</h3><span className="text-yellow-400 text-sm font-bold">{t.reward}: {formatMoney(task.rewardAmount, user.currency)}</span></div>
               </div>
               {task.status === 'ongoing' && (
                 <div className="mt-2 pt-3 border-t border-slate-700">
                   <p className="text-slate-400 text-xs mb-3">Please upload a screenshot of your recharge/registration to verify.</p>
                   <button onClick={() => onSubmitProof(task.id, 'https://picsum.photos/200/300?random=' + Date.now())} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 flex items-center justify-center space-x-2">
                     <Upload size={14} /><span>{t.uploadScreenshot}</span>
                   </button>
                 </div>
               )}
               {task.status === 'reviewing' && <div className="mt-2 pt-2 border-t border-slate-700 flex items-center space-x-2 text-orange-400 text-sm font-medium"><Clock size={16} /><span>Wait for admin audit...</span></div>}
               {task.status === 'completed' && <div className="mt-2 pt-2 border-t border-slate-700 flex items-center space-x-2 text-green-400 text-sm font-bold"><CheckCircle size={16} /><span>Reward Received!</span></div>}
             </div>
           ))}
        </div>
      }
    </div>
  );
};

export const ReferralView: React.FC<{ user: User; users: User[]; t: any; lang: Language }> = ({ user, users, t, lang }) => {
    const referralLink = `https://betbounty.app/reg?c=${user.referralCode}`;
    const copyToClipboard = () => { navigator.clipboard.writeText(referralLink); alert(t.copied); };
    
    // Calculate Team Stats - Safe access
    const level1 = users.filter(u => u.referrerId === user.id);
    const level1Ids = level1.map(u => u.id);
    const level2 = users.filter(u => u.referrerId && level1Ids.includes(u.referrerId));
    const level2Ids = level2.map(u => u.id);
    const level3 = users.filter(u => u.referrerId && level2Ids.includes(u.referrerId));

    const transactions = user.transactions || [];
    const todayComms = transactions
        .filter(tx => tx.type === 'referral_bonus' && new Date(tx.date).toDateString() === new Date().toDateString())
        .reduce((sum, tx) => sum + tx.amount, 0);

    const share = (platform: string) => {
        const text = `Join BetBounty and earn money! Use my code: ${user.referralCode}`;
        let url = '';
        if(platform === 'fb') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        if(platform === 'tw') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
        if(platform === 'wa') url = `https://wa.me/?text=${encodeURIComponent(text + " " + referralLink)}`;
        if(platform === 'tg') url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
     <div className="p-4 pt-8 pb-24 space-y-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl text-center">
           <h2 className="text-2xl font-bold text-white mb-2">{t.referralRules}</h2>
           <p className="text-slate-300 text-sm mb-6">{t.referralDesc}</p>
           
           <div className="bg-slate-900/50 p-4 rounded-xl mb-4">
               <div className="grid grid-cols-2 gap-4 text-left">
                   <div><p className="text-xs text-slate-400">{t.todayStats}</p><p className="text-xl font-bold text-yellow-400">{formatMoney(todayComms, user.currency)}</p></div>
                   <div><p className="text-xs text-slate-400">{t.totalInvited}</p><p className="text-xl font-bold text-white">{level1.length + level2.length + level3.length}</p></div>
               </div>
           </div>
           <div className="flex justify-between text-xs text-slate-400 px-2">
               <div><span className="block font-bold text-white text-lg">{level1.length}</span>{t.level1}</div>
               <div><span className="block font-bold text-white text-lg">{level2.length}</span>{t.level2}</div>
               <div><span className="block font-bold text-white text-lg">{level3.length}</span>{t.level3}</div>
           </div>
        </div>

        {/* Share Section */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Share2 size={16}/> {t.shareVia}</h3>
            <div className="flex justify-around mb-4">
                <button onClick={() => share('fb')} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white"><Facebook size={20}/></button>
                <button onClick={() => share('tw')} className="w-10 h-10 rounded-full bg-sky-400 flex items-center justify-center text-white"><Twitter size={20}/></button>
                <button onClick={() => share('wa')} className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"><MessageCircle size={20}/></button>
                <button onClick={() => share('tg')} className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white"><Send size={20}/></button>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between border border-slate-600">
              <div className="truncate text-xs text-slate-400 mr-2 flex-1">{referralLink}</div>
              <button onClick={copyToClipboard} className="text-white bg-slate-700 hover:bg-slate-600 p-2 rounded-lg flex-shrink-0"><LinkIcon size={16} /></button>
            </div>
        </div>

        {/* Tree Explanation */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-bold mb-4">{t.howItWorks}</h3>
            <div className="relative pl-4 space-y-6">
                <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-indigo-500/30"></div>
                
                {/* Level 1 */}
                <div className="relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 text-slate-900 font-bold flex items-center justify-center z-10 border-4 border-slate-800">You</div>
                        <div className="text-sm">
                            <p className="text-white font-bold">{t.refStoryA}</p>
                            <p className="text-yellow-400 text-xs font-bold">{t.refStoryEarn} 20%</p>
                        </div>
                    </div>
                </div>

                {/* Level 2 */}
                <div className="relative ml-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center z-10 border-2 border-slate-800">A</div>
                        <div className="text-sm">
                            <p className="text-white font-bold">{t.refStoryB}</p>
                            <p className="text-yellow-400 text-xs font-bold">{t.refStoryEarn} 10%</p>
                        </div>
                    </div>
                </div>

                {/* Level 3 */}
                <div className="relative ml-8">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-600 text-white font-bold flex items-center justify-center z-10 border-2 border-slate-800">B</div>
                        <div className="text-sm">
                            <p className="text-white font-bold">{t.refStoryC}</p>
                            <p className="text-yellow-400 text-xs font-bold">{t.refStoryEarn} 5%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-slate-900/50 p-4 rounded-lg text-xs text-slate-400">
                <p className="font-bold text-slate-300 mb-1">{t.refExample}:</p>
                <ul className="space-y-1">
                    <li>• Level 1 User (A): You get <span className="text-green-400 font-bold">$20</span></li>
                    <li>• Level 2 User (B): You get <span className="text-green-400 font-bold">$10</span></li>
                    <li>• Level 3 User (C): You get <span className="text-green-400 font-bold">$5</span></li>
                </ul>
            </div>
        </div>

        <div className="text-center">
             <div className="bg-white p-3 rounded-xl inline-block shadow-lg"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${referralLink}`} className="w-32 h-32" /></div>
             <p className="text-slate-500 text-xs mt-2">{t.scanQr}</p>
        </div>
     </div>
    );
};
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, Platform, Activity, Language, SortOption, UserTask } from '../types';
import { TRANSLATIONS, LANGUAGES } from '../constants';
import { 
  ArrowLeft, ChevronRight, Copy, Upload, Clock, XCircle, User as UserIcon, 
  List, CheckCircle, Smartphone, Lock, MessageSquare, LogOut, QrCode, 
  Facebook, Twitter, CreditCard, Eye, EyeOff, ArrowDown, Sparkles, Share2, Plus,
  ShieldCheck
} from 'lucide-react';
import Layout from './Layout';

// Helper: Format Money
const formatMoney = (amount: number, lang: Language) => {
  const config = LANGUAGES[lang];
  return `${config.currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

// --- USER LOGIN COMPONENT ---
export const UserLogin: React.FC<{ onAuth: (p: string, pw: string, isReg: boolean) => string | null; t: any; lang: Language }> = ({ onAuth, t, lang }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
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
      const error = onAuth(phone, password, isRegister);
      if(error) {
          alert(error);
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
       <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-xl shadow-yellow-500/20 mb-6">
        <Sparkles size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-8">{t.appName}</h1>
      
      <div className="w-full max-w-xs space-y-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center space-x-3">
            <Smartphone className="text-slate-500" size={20} />
            {lang === 'zh' && <span className="text-slate-300 font-bold pr-2 border-r border-slate-600">+86</span>}
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t.phone} className="bg-transparent text-white w-full focus:outline-none" />
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center space-x-3">
            <Lock className="text-slate-500" size={20} />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t.password} className="bg-transparent text-white w-full focus:outline-none" />
        </div>

        {isRegister && (
            <>
            <div className="flex space-x-2">
                <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center space-x-3 flex-1">
                    <MessageSquare className="text-slate-500" size={20} />
                    <input type="text" value={code} onChange={e=>setCode(e.target.value)} placeholder={t.verifyCode} className="bg-transparent text-white w-full focus:outline-none" />
                </div>
                <button disabled={timer > 0} onClick={startTimer} className="bg-slate-700 text-white px-4 rounded-xl text-xs font-bold disabled:opacity-50 w-24">
                    {timer > 0 ? `${timer}s` : t.getCode}
                </button>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center space-x-3">
                <QrCode className="text-slate-500" size={20} />
                <input type="text" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} placeholder={t.inviteCode} className="bg-transparent text-white w-full focus:outline-none" />
            </div>
            </>
        )}

        <button onClick={handleAuth} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg mt-4 hover:brightness-110 active:scale-95 transition-all">
            {isRegister ? t.register : t.login}
        </button>

        <div className="flex justify-center text-xs text-slate-400 mt-4 px-1">
            <button onClick={() => setIsRegister(!isRegister)} className="hover:text-white">
                {isRegister ? t.login : t.register}
            </button>
        </div>

        {/* --- ADMIN LINK --- */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex justify-center">
            <a href="#/admin" className="text-slate-600 text-xs flex items-center gap-2 hover:text-yellow-500 transition-colors">
                <ShieldCheck size={14} />
                <span>{t.merchantLogin}</span>
            </a>
        </div>

      </div>
    </div>
  );
};

// Banner Carousel
const BannerCarousel: React.FC<{ activities: Activity[]; lang: Language }> = ({ activities, lang }) => {
  const navigate = useNavigate();
  const filteredActivities = activities.filter(a => a.targetCountries === 'all' || a.targetCountries.includes(lang));
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (filteredActivities.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % filteredActivities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [filteredActivities.length]);

  if (filteredActivities.length === 0) return null;

  return (
    <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg mb-6 group cursor-pointer" onClick={() => navigate(`/activity/${filteredActivities[current].id}`)}>
       {filteredActivities.map((act, index) => (
         <div key={act.id} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}>
           <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
             <h3 className="text-white font-bold text-lg">{act.title}</h3>
           </div>
         </div>
       ))}
    </div>
  );
};

export const HomeView: React.FC<{ platforms: Platform[]; t: any; setSort: (s: SortOption) => void; sort: SortOption; lang: Language; activities: Activity[]; }> = ({ platforms, t, setSort, sort, lang, activities }) => {
  const navigate = useNavigate();
  const filteredPlatforms = React.useMemo(() => platforms.filter(p => p.targetCountries === 'all' || p.targetCountries.includes(lang)), [platforms, lang]);
  const sortedPlatforms = React.useMemo(() => {
    return [...filteredPlatforms].sort((a, b) => {
      if (sort === SortOption.HIGHEST_REWARD) return b.rewardAmount - a.rewardAmount;
      if (sort === SortOption.LOWEST_DEPOSIT) return a.firstDepositAmount - b.firstDepositAmount;
      return new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime();
    });
  }, [filteredPlatforms, sort]);

  return (
    <div className="p-4 space-y-4">
      <BannerCarousel activities={activities} lang={lang} />
      <div className="flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur pt-2 pb-2 z-10">
         <span className="text-slate-400 text-xs font-medium">{t.sort}:</span>
         <div className="flex space-x-2">
           {[ { id: SortOption.NEWEST, label: t.sortNew }, { id: SortOption.HIGHEST_REWARD, label: t.sortReward }, { id: SortOption.LOWEST_DEPOSIT, label: t.sortDeposit } ].map((opt) => (
             <button key={opt.id} onClick={() => setSort(opt.id)} className={`px-3 py-1 rounded-full text-[10px] border transition-colors ${sort === opt.id ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{opt.label}</button>
           ))}
         </div>
      </div>
      <div className="space-y-4 pb-12">
        {sortedPlatforms.length === 0 ? <div className="text-center py-10 text-slate-500">No tasks available for this region yet.</div> :
          sortedPlatforms.map((p) => (
            <div key={p.id} onClick={() => navigate(`/task-detail/${p.id}`)} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-md flex space-x-4 cursor-pointer hover:border-yellow-500/50 transition-colors">
              <div className="flex-shrink-0 relative">
                <img src={p.logoUrl} alt={p.name} className="w-20 h-20 rounded-xl object-cover bg-slate-700" />
                {p.isHot && <span className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{t.hot}</span>}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                     <h3 className="font-bold text-white text-base leading-tight">{p.name}</h3>
                     <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{t.remaining}: {p.remainingQty}/{p.totalQty}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-1">{p.description}</p>
                </div>
                <div className="flex justify-between items-end mt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">{t.reward}</span>
                    <span className="text-yellow-400 font-bold text-lg">{formatMoney(p.rewardAmount, lang)}</span>
                  </div>
                  <div className="bg-slate-700 p-1.5 rounded-full"><ChevronRight size={16} className="text-slate-300" /></div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export const TaskDetailView: React.FC<{ platforms: Platform[]; onStartTask: (p: Platform) => void; t: any; lang: Language; }> = ({ platforms, onStartTask, t, lang }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = platforms.find(p => p.id === id);
  if (!platform) return <div className="p-4 text-white">Not found</div>;

  return (
    <div className="bg-slate-900 min-h-screen pb-32">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-20 border-b border-slate-800 p-4 flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="text-slate-300"><ArrowLeft size={24} /></button>
        <h1 className="text-white font-bold text-lg flex-1 truncate">{platform.name}</h1>
      </div>
      <div className="p-4 space-y-6">
        <div className="flex items-center space-x-4">
           <img src={platform.logoUrl} className="w-20 h-20 rounded-xl bg-slate-800" />
           <div>
             <h2 className="text-2xl font-bold text-yellow-400">{formatMoney(platform.rewardAmount, lang)}</h2>
             <p className="text-slate-400 text-sm">{platform.description}</p>
           </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-white font-bold mb-4 flex items-center space-x-2"><List size={18} className="text-yellow-500" /><span>{t.steps}</span></h3>
          <div className="space-y-6 relative pl-2">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-700"></div>
            {platform.steps.map((step, idx) => (
              <div key={idx} className="relative flex items-start space-x-4">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-slate-900 font-bold text-xs flex items-center justify-center z-10 shrink-0">{idx + 1}</div>
                <p className="text-slate-300 text-sm pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
           <h3 className="text-white font-bold mb-4 flex items-center space-x-2"><Clock size={18} className="text-red-500" /><span>{t.rules}</span></h3>
           <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{platform.rules}</p>
        </div>
      </div>
      {/* Floating Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800 z-50 max-w-md mx-auto">
        <button 
            onClick={() => { 
                // 1. Join task internally
                onStartTask(platform); 
                // 2. Open External Link
                window.open(platform.downloadLink, '_blank');
            }} 
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg transition-all text-lg hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
        >
          {t.startTask} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export const ActivityDetailView: React.FC<{ activities: Activity[]; t: any }> = ({ activities, t }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const activity = activities.find(a => a.id === id);
  if (!activity) return <div className="p-8 text-white text-center">Activity not found</div>;

  return (
    <div className="bg-slate-900 min-h-screen">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-20 border-b border-slate-800 p-4 flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="text-slate-300"><ArrowLeft size={24} /></button>
        <h1 className="text-white font-bold text-lg flex-1 truncate">{t.activityTitle}</h1>
      </div>
      <img src={activity.imageUrl} className="w-full h-64 object-cover" />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">{activity.title}</h1>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-300 whitespace-pre-line leading-relaxed">{activity.content}</p>
        </div>
      </div>
    </div>
  );
};

export const ProfileView: React.FC<{ user: User; t: any; logout: () => void; lang: Language; onBindCard: (b: string, n: string, no: string) => void; }> = ({ user, t, logout, lang, onBindCard }) => {
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [showCardNo, setShowCardNo] = useState(false);
  const [bank, setBank] = useState('');
  const [name, setName] = useState('');
  const [no, setNo] = useState('');

  return (
    <div className="min-h-screen bg-slate-900">
       {isBindModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="text-yellow-500" />{t.bindCard}</h3>
            <div className="space-y-4">
              <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.bankName}</label><input type="text" value={bank} onChange={e => setBank(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500" /></div>
              <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.accHolder}</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500" /></div>
              <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.accNumber}</label><input type="tel" value={no} onChange={e => setNo(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500" /></div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setIsBindModalOpen(false)} className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-600">{t.cancel}</button>
                <button onClick={() => { if(bank && name && no) { onBindCard(bank, name, no); setIsBindModalOpen(false); } }} className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-yellow-400">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
       )}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-b-3xl shadow-2xl border-b border-indigo-500/30">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center space-x-3">
             <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white"><UserIcon /></div>
             <div><p className="text-white font-bold text-lg">{user.phone}</p><p className="text-slate-400 text-xs">ID: {user.id}</p></div>
           </div>
           <button onClick={logout} className="text-slate-400 hover:text-white"><LogOut size={20} /></button>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
           <div className="flex justify-between mb-4">
             <div><p className="text-indigo-200 text-xs uppercase mb-1">{t.balance}</p><h2 className="text-3xl font-bold text-white">{formatMoney(user.balance, lang)}</h2></div>
             <div className="text-right"><p className="text-slate-400 text-xs uppercase mb-1">{t.totalEarnings}</p><h2 className="text-xl font-bold text-yellow-400">{formatMoney(user.totalEarnings, lang)}</h2></div>
           </div>
           <div className="flex space-x-3">
             <button className="flex-1 bg-yellow-500 text-slate-900 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-400 shadow-lg">{t.withdraw}</button>
             <button onClick={() => setIsBindModalOpen(true)} className="flex-1 bg-slate-700 text-white py-2.5 rounded-lg font-bold text-sm border border-slate-600 hover:bg-slate-600">{t.bindCard}</button>
           </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
         {user.bankInfo ? (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-lg text-white relative overflow-hidden h-48 flex flex-col justify-between">
               <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={100} /></div>
               <div className="relative z-10 flex justify-between items-start">
                  <span className="font-bold text-lg tracking-widest">{user.bankInfo.split(' - ')[0]}</span>
                  <span className="text-xs opacity-70 bg-white/20 px-2 py-1 rounded">Debit</span>
               </div>
               <div className="relative z-10 mt-2">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-mono text-xl tracking-wider">{showCardNo ? user.bankInfo.split(' - ')[2] : `**** **** **** ${user.bankInfo.split(' - ')[2].slice(-4)}`}</span>
                    <button onClick={() => setShowCardNo(!showCardNo)} className="text-white/70 hover:text-white">{showCardNo ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
               </div>
               <div className="relative z-10 flex justify-between items-end">
                  <div><p className="text-[10px] opacity-70 uppercase mb-0.5">{t.accHolder}</p><p className="font-medium">{user.bankInfo.split(' - ')[1]}</p></div>
               </div>
            </div>
         ) : (
            <div onClick={() => setIsBindModalOpen(true)} className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800 hover:border-slate-600 cursor-pointer transition-colors">
               <Plus size={32} className="mb-2" />
               <span className="text-sm font-bold">{t.bindCard}</span>
            </div>
         )}
         <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700">
            <span className="text-white">Account Status</span><span className="text-green-400 text-sm font-bold flex items-center"><CheckCircle size={14} className="mr-1"/> Verified</span>
         </div>
      </div>
  </div>
  );
};

export const MyTasksView: React.FC<{ user: User; onSubmitProof: (taskId: string, img: string) => void; t: any; lang: Language }> = ({ user, onSubmitProof, t, lang }) => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'reviewing' | 'completed'>('ongoing');
  const tasks = user.myTasks.filter(task => {
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
             <div key={task.id} className={`bg-slate-800 rounded-xl p-4 border shadow-md ${task.status === 'ongoing' ? 'border-indigo-500/50' : task.status === 'reviewing' ? 'border-orange-500/50' : task.status === 'completed' ? 'border-green-500/50' : 'border-red-500/50'}`}>
               <div className="flex space-x-3 mb-3">
                 <img src={task.logoUrl} className="w-12 h-12 rounded-lg bg-slate-700" />
                 <div><h3 className="font-bold text-white">{task.platformName}</h3><span className="text-yellow-400 text-sm font-bold">{t.reward}: {formatMoney(task.rewardAmount, lang)}</span></div>
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
               {task.status === 'rejected' && <div className="mt-2 pt-2 border-t border-slate-700 text-red-400 text-sm"><p className="flex items-center space-x-2 font-bold"><XCircle size={16} /> <span>Rejected</span></p><p className="text-xs mt-1 text-slate-500">{task.rejectReason || 'Document invalid or unclear.'}</p></div>}
             </div>
           ))}
        </div>
      }
    </div>
  );
};

export const ReferralView: React.FC<{ user: User; t: any; lang: Language }> = ({ user, t, lang }) => {
    // ... Copy ReferralView logic from previous App.tsx ...
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://betbounty.app/ref/${user.referralCode}`;
    const copyToClipboard = () => { navigator.clipboard.writeText(user.referralCode); alert(t.copied); };
    return (
     <div className="p-4 pt-8 text-center space-y-6 pb-24">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-[60px] opacity-10"></div>
           <h2 className="text-2xl font-bold text-white mb-2">{t.referralRules}</h2>
           <p className="text-slate-300 text-sm mb-6">{t.referralDesc}</p>
           <div className="flex flex-col items-center space-y-2 mb-6 text-sm">
              <div className="bg-yellow-500 text-slate-900 font-bold px-4 py-1.5 rounded-full shadow-lg z-10 w-32 border-2 border-yellow-300">{t.refExampleA}</div>
              <ArrowDown size={20} className="text-slate-500" />
              <div className="bg-slate-700 text-white px-4 py-1.5 rounded-full border border-slate-600 w-32 relative">{t.refExampleB}</div>
              <ArrowDown size={20} className="text-slate-500" />
              <div className="bg-slate-700 text-white px-4 py-1.5 rounded-full border border-slate-600 w-32 relative">{t.refExampleC}</div>
           </div>
        </div>
        <div className="space-y-4">
           <div className="bg-white p-3 rounded-xl inline-block shadow-lg"><img src={qrUrl} alt="QR Code" className="w-32 h-32" /></div>
           <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between border border-slate-700 max-w-xs mx-auto">
              <div className="text-left"><p className="text-[10px] text-slate-500 uppercase">{t.shareCode}</p><p className="text-yellow-400 font-bold text-lg tracking-wider">{user.referralCode}</p></div>
              <button onClick={copyToClipboard} className="text-white bg-slate-700 hover:bg-slate-600 p-2 rounded-lg"><Copy size={18} /></button>
           </div>
        </div>
     </div>
    );
};
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { User, Platform, Activity, Language, SortOption, UserTask, Transaction, Message, SystemConfig } from '../types';
import { TRANSLATIONS, LANGUAGES, BANK_OPTIONS } from '../constants';
import { 
  ArrowLeft, ChevronRight, Copy, Upload, Clock, XCircle, User as UserIcon, 
  List, CheckCircle, Smartphone, Lock, MessageSquare, LogOut, QrCode, 
  CreditCard, Eye, EyeOff, ArrowDown, Sparkles, Plus, ShieldCheck, Wallet, History,
  Share2, Facebook, Twitter, Link as LinkIcon, Send, MessageCircle, Dices, Palette, Mail, Volume2, Heart, HelpCircle, Info, Filter, X, Crown
} from 'lucide-react';
import Layout from './Layout';

// Format using User's Currency, not language setting
const formatMoney = (amount: number, currencySymbol: string) => {
  return `${currencySymbol} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

// --- REUSABLE COMPONENTS ---

// Enhanced Vertical Marquee
const WinningMarquee: React.FC<{ type: 'task' | 'invite'; lang: Language; hypeLevel: number }> = ({ type, lang, hypeLevel }) => {
    const currency = LANGUAGES[lang].currency;
    const [messages, setMessages] = useState<string[]>([]);
    
    useEffect(() => {
        const generate = () => {
            const arr = [];
            const count = 5 + (hypeLevel * 2);
            for(let i=0; i<count; i++) {
                const user = Math.floor(Math.random() * 8999 + 1000); 
                const amt = type === 'task' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 200) + 20;
                const action = type === 'task' ? (lang === 'zh' ? '领取了任务奖励' : 'claimed task reward') : (lang === 'zh' ? '邀请好友获得了' : 'invited friend & earned');
                arr.push(`User ***${user} ${action} ${currency}${amt}`);
            }
            setMessages(arr.sort(() => Math.random() - 0.5));
        };
        generate();
        const interval = setInterval(generate, 15000);
        return () => clearInterval(interval);
    }, [type, lang, currency, hypeLevel]);

    return (
        <div className="bg-slate-900/80 backdrop-blur border-y border-white/10 relative z-20 h-10 overflow-hidden flex flex-col justify-center my-2">
            <div className="flex items-center animate-scroll-vertical w-full flex-col">
                {[...messages, ...messages].map((m, i) => (
                    <div key={i} className="w-full text-center h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-slate-300 tracking-wide flex items-center gap-2">
                           <Volume2 size={12} className="text-yellow-400"/> {m}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- NEW PAGES ---

export const StaticPageView: React.FC<{ title: string; content: string; }> = ({ title, content }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center gap-3 z-20">
                <button onClick={() => navigate(-1)}><ArrowLeft className="text-slate-600" size={24}/></button>
                <h1 className="font-bold text-lg text-slate-800">{title}</h1>
            </div>
            <div className="p-6 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                {content || "No content available."}
            </div>
        </div>
    );
};

export const TransactionHistoryView: React.FC<{ user: User; t: any }> = ({ user, t }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all'|'income'|'expense'>('all');
    
    const filtered = (user.transactions || []).filter(tx => {
        if(filter === 'all') return true;
        if(filter === 'income') return tx.amount > 0;
        return tx.amount < 0;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)}><ArrowLeft className="text-slate-600" size={24}/></button>
                    <h1 className="font-bold text-lg text-slate-800">{t.transactions}</h1>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    {['all', 'income', 'expense'].map(f => (
                        <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1 text-xs rounded-md capitalize ${filter === f ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-500'}`}>{f}</button>
                    ))}
                </div>
            </div>
            <div className="p-4 space-y-3">
                {filtered.map(tx => (
                    <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">{tx.description}</div>
                            <div className="text-xs text-slate-400 mt-1">{new Date(tx.date).toLocaleString()}</div>
                        </div>
                        <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, user.currency)}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div className="text-center py-10 text-slate-400">No records</div>}
            </div>
        </div>
    );
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
      
      if (isRegister) {
          if (!code) return alert("Please enter verification code");
          if (code !== '9527') return alert("Verification code incorrect. Please try again.");
      }

      const error = onAuth(phone, password, isRegister, inviteCode);
      if(error) alert(error.replace(password, '***')); 
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[linear-gradient(45deg,#0f172a,#1e293b,#0f172a)] animate-gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
export const HomeView: React.FC<{ 
    platforms: Platform[]; 
    t: any; 
    setSort: (s: SortOption) => void; 
    sort: SortOption; 
    lang: Language; 
    activities: Activity[]; 
    user: User;
    config: SystemConfig;
    onLikeTask: (id: string) => void;
    onQuickJoin: (p: Platform) => void; 
}> = ({ platforms, t, setSort, sort, lang, activities, user, config, onLikeTask, onQuickJoin }) => {
  const navigate = useNavigate();
  const isGold = user.theme === 'gold';
  const [showPopup, setShowPopup] = useState(false);
  const popupActivity = activities.find(a => a.showPopup && a.active);

  useEffect(() => {
      if (popupActivity) setShowPopup(true);
  }, [popupActivity]);
  
  const filteredPlatforms = React.useMemo(() => {
      let data = platforms.filter(p => p.status === 'online' && (p.targetCountries || []).includes(lang));
      
      // Pin Logic
      data.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

      if (sort === SortOption.NEWEST) {
          data.sort((a, b) => (b.isPinned === a.isPinned) ? new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime() : 0);
      } else if (sort === SortOption.HIGHEST_REWARD) {
          data.sort((a, b) => (b.isPinned === a.isPinned) ? b.rewardAmount - a.rewardAmount : 0);
      } else if (sort === SortOption.POPULAR) {
          data.sort((a, b) => (b.isPinned === a.isPinned) ? (b.totalQty - b.remainingQty) - (a.totalQty - a.remainingQty) : 0);
      }
      return data;
  }, [platforms, lang, sort]);

  return (
    <div className="min-h-screen relative">
      
      {/* Activity Popup */}
      {showPopup && popupActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 animate-entry">
              <div className="relative w-full max-w-sm">
                  <button onClick={() => setShowPopup(false)} className="absolute -top-10 right-0 text-white"><XCircle size={32}/></button>
                  <img 
                    src={popupActivity.imageUrl} 
                    className="w-full rounded-2xl shadow-2xl cursor-pointer" 
                    onClick={() => { setShowPopup(false); navigate(`/activity/${popupActivity.id}`); }}
                  />
                  <div className="mt-4 text-center">
                      <button onClick={() => setShowPopup(false)} className="text-slate-400 text-sm border border-slate-600 rounded-full px-4 py-1">Close</button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating TG Button */}
      {config.telegramLinks[lang] && (
          <a href={config.telegramLinks[lang]} target="_blank" className="fixed bottom-24 right-4 z-40 bg-blue-500 text-white p-3 rounded-full shadow-xl shadow-blue-500/40 animate-bounce">
              <Send size={24} />
          </a>
      )}

      <div className="pb-12">
        {/* Banner Section */}
        <div className="p-4 pb-0">
            {activities.filter(a => a.active && (a.targetCountries || []).includes(lang)).length > 0 && (
            <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer" onClick={() => navigate(`/activity/${activities[0].id}`)}>
                <img src={activities[0].imageUrl} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white font-bold">{activities[0].title}</div>
            </div>
            )}
        </div>

        {/* Marquee - BETWEEN BANNER AND TASKS */}
        <WinningMarquee type="task" lang={lang} hypeLevel={config.hypeLevel || 5} />

        {/* Filter Bar & Task Cards */}
        <div className="px-4 space-y-4">
            <div className={`flex items-center justify-between sticky top-0 backdrop-blur pt-2 pb-2 z-10 ${isGold ? 'bg-slate-50/90' : 'bg-slate-900/90'}`}>
            <span className={`text-xs font-medium ${isGold ? 'text-slate-600' : 'text-slate-400'}`}>{t.sort}:</span>
            <div className="flex space-x-2">
                {[ { id: SortOption.NEWEST, label: t.sortNew }, { id: SortOption.HIGHEST_REWARD, label: t.sortReward }, { id: SortOption.POPULAR, label: 'Popular' } ].map((opt) => (
                <button key={opt.id} onClick={() => setSort(opt.id)} className={`px-3 py-1 rounded-full text-[10px] border transition-colors ${
                    sort === opt.id 
                    ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600' 
                    : isGold ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>{opt.label}</button>
                ))}
            </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-4">
            {filteredPlatforms.map((p) => {
                const claimed = p.totalQty - p.remainingQty;
                const percent = Math.min(100, Math.round((claimed / p.totalQty) * 100));
                const isSoldOut = p.remainingQty <= 0;
                const totalLikes = 200 + (p.likes || 0); // Base likes + real
                const isLiked = (user.likedTaskIds || []).includes(p.id);

                return (
                <div key={p.id} className="rounded-xl overflow-hidden shadow-lg relative group h-36 transform transition-all hover:scale-[1.01]">
                    <img src={p.logoUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent"></div>

                    <div className="absolute inset-0 p-4 flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                        {p.isPinned && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">TOP</span>}
                    </div>
                    
                    <div>
                        <div className="mb-1">
                            <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 drop-shadow-md">{p.name}</h3>
                            <p className="text-xs text-slate-300 line-clamp-1">{p.description}</p>
                        </div>

                        <div className="mb-2">
                            <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                                <span>Claimed: {claimed}/{p.totalQty}</span>
                                <span>{percent}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                                <span className="bg-yellow-500 text-slate-900 font-bold text-lg px-2 rounded shadow-lg shadow-yellow-500/20">{formatMoney(p.rewardAmount, user.currency)}</span>
                                <button onClick={(e) => { e.stopPropagation(); onLikeTask(p.id); }} className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`} disabled={isLiked}>
                                    <Heart size={16} className={isLiked ? "fill-red-500" : ""} />
                                    <span className="text-xs font-bold text-white shadow-black drop-shadow">{totalLikes}</span>
                                </button>
                            </div>

                            {isSoldOut ? (
                                <button disabled className="bg-slate-600 text-slate-300 text-xs font-bold px-5 py-2 rounded-full cursor-not-allowed">
                                    Sold Out
                                </button>
                            ) : (
                                <button onClick={() => onQuickJoin(p)} className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg active:scale-95 transition-transform">
                                    {t.startTask}
                                </button>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

export const MailboxView: React.FC<{ user: User; t: any; markAllRead: () => void }> = ({ user, t, markAllRead }) => {
    const navigate = useNavigate();
    const isGold = user.theme === 'gold';
    
    useEffect(() => {
        markAllRead();
    }, []);

    return (
        <div className={`min-h-screen ${isGold ? 'bg-slate-50' : 'bg-slate-900'}`}>
             <div className={`sticky top-0 backdrop-blur z-20 border-b p-4 flex items-center space-x-3 ${isGold ? 'bg-slate-50/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'}`}>
                <button onClick={() => navigate(-1)} className={isGold ? 'text-slate-600' : 'text-slate-300'}><ArrowLeft size={24} /></button>
                <h1 className={`font-bold text-lg flex-1 ${isGold ? 'text-slate-800' : 'text-white'}`}>{t.messages}</h1>
            </div>
            <div className="p-4 space-y-3">
                {user.messages.length === 0 && <div className="text-center text-slate-500 mt-10">No messages</div>}
                {user.messages.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-xl border ${isGold ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
                         <div className="flex justify-between items-start mb-2">
                             <h4 className={`font-bold ${isGold ? 'text-slate-800' : 'text-white'}`}>{msg.title}</h4>
                             <span className="text-[10px] text-slate-500">{new Date(msg.date).toLocaleDateString()}</span>
                         </div>
                         <p className={`text-sm whitespace-pre-line ${isGold ? 'text-slate-600' : 'text-slate-300'}`}>{msg.content}</p>
                         {msg.rewardAmount && msg.rewardAmount > 0 && (
                             <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-lg flex items-center gap-2">
                                 <Wallet size={16} className="text-yellow-500"/>
                                 <span className="text-yellow-500 font-bold text-xs">Attached Gift: {formatMoney(msg.rewardAmount, user.currency)}</span>
                             </div>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TaskDetailView: React.FC<{ platforms: Platform[]; onStartTask: (p: Platform) => void; t: any; lang: Language; user: User; }> = ({ platforms, onStartTask, t, lang, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = platforms.find(p => p.id === id);
  const isGold = user.theme === 'gold';
  
  if (!platform) return null;

  return (
    <div className={`min-h-screen pb-32 ${isGold ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <div className={`sticky top-0 backdrop-blur z-20 border-b p-4 flex items-center space-x-3 ${isGold ? 'bg-slate-50/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'}`}>
          <button onClick={() => navigate(-1)} className={isGold ? 'text-slate-600' : 'text-slate-300'}><ArrowLeft size={24} /></button>
          <h1 className={`font-bold text-lg flex-1 truncate ${isGold ? 'text-slate-800' : 'text-white'}`}>{platform.name}</h1>
      </div>
      <div className="p-4 space-y-6">
        <div className="flex items-center space-x-4">
            <img src={platform.logoUrl} className={`w-20 h-20 rounded-xl ${isGold ? 'bg-slate-200' : 'bg-slate-800'} object-cover`} />
            <div>
                <h2 className="text-2xl font-bold text-yellow-500">{formatMoney(platform.rewardAmount, user.currency)}</h2>
                <p className={`text-sm ${isGold ? 'text-slate-500' : 'text-slate-400'}`}>{platform.description}</p>
            </div>
        </div>
        <div className={`rounded-xl p-5 border ${isGold ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isGold ? 'text-slate-800' : 'text-white'}`}><List size={18}/> {t.steps}</h3>
            {(platform.steps || []).map((s,i) => <div key={i} className={`text-sm mb-2 ${isGold ? 'text-slate-600' : 'text-slate-300'}`}>{i+1}. {s}</div>)}
        </div>
      </div>
      <div className={`fixed bottom-0 left-0 right-0 p-4 backdrop-blur z-50 max-w-md mx-auto ${isGold ? 'bg-slate-50/90' : 'bg-slate-900/90'}`}>
        <button onClick={() => { onStartTask(platform); }} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold py-3.5 rounded-xl shadow-lg">{t.startTask}</button>
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

export const ProfileView: React.FC<{ user: User; t: any; logout: () => void; lang: Language; onBindCard: (b: string, n: string, no: string, type: 'bank'|'ewallet'|'crypto') => void; onWithdraw: (amount: number, accId: string) => void; toggleTheme: () => void; minWithdraw: number; clearUnreadTx: () => void; }> = ({ user, t, logout, lang, onBindCard, onWithdraw, toggleTheme, minWithdraw, clearUnreadTx }) => {
  const [modal, setModal] = useState<'bind' | 'withdraw' | 'transactions' | null>(null);
  const [bindData, setBindData] = useState({ bank: '', name: '', no: '', type: 'bank' as 'bank'|'ewallet'|'crypto' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccId, setSelectedAccId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isGold = user.theme === 'gold';

  useEffect(() => {
      if (location.state && (location.state as any).openTransactions) {
          setModal('transactions');
          window.history.replaceState({}, document.title);
      }
  }, [location]);

  useEffect(() => {
      if (modal === 'transactions') {
          clearUnreadTx();
      }
  }, [modal]);

  const banks = [...(BANK_OPTIONS[lang] || BANK_OPTIONS['en']), { name: 'USDT (TRC20)', type: 'crypto' }];
  const accounts = (user.bankAccounts || []).filter(acc => acc.bankName && acc.accountNumber);
  const hasAccounts = accounts.length > 0;
  const transactions = user.transactions || [];

  useEffect(() => {
      if (hasAccounts && !selectedAccId) {
          setSelectedAccId(accounts[0].id);
      }
  }, [hasAccounts, accounts, selectedAccId]);

  return (
    <div className={`min-h-screen pb-20 ${isGold ? 'bg-slate-50' : 'bg-slate-900'}`}>
       {/* Modal Styles */}
       {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className={`rounded-2xl w-full max-w-sm p-6 border animate-entry ${isGold ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
            
            {modal === 'transactions' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-xl font-bold ${isGold ? 'text-slate-800' : 'text-white'}`}>{t.transactions}</h3>
                        <button onClick={() => setModal(null)}><XCircle className="text-slate-400"/></button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-2">
                        {transactions.length === 0 && <div className="text-center py-8 text-slate-500">No transactions yet</div>}
                        {transactions.map(tx => (
                            <div key={tx.id} className={`p-3 rounded-lg flex justify-between items-center border ${isGold ? 'bg-slate-50 border-slate-100' : 'bg-slate-900 border-slate-700'}`}>
                                <div>
                                    <div className={`text-sm font-medium ${isGold ? 'text-slate-700' : 'text-white'}`}>{tx.description}</div>
                                    <div className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleString()}</div>
                                </div>
                                <div className={`font-mono text-sm font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, user.currency)}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {modal === 'bind' && (
                <>
                    <h3 className={`text-xl font-bold mb-4 ${isGold ? 'text-slate-800' : 'text-white'}`}>{t.addAccount}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-xs uppercase block mb-1">{t.bankName}</label>
                            <select value={bindData.bank} onChange={e => {
                                const sel = banks.find(b => b.name === e.target.value);
                                setBindData({...bindData, bank: e.target.value, type: (sel?.type || 'bank') as any});
                            }} className={`w-full border rounded-lg p-3 ${isGold ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-600 text-white'}`}>
                                <option value="">Select...</option>
                                {banks.map(b => <option key={b.name} value={b.name}>{b.name} ({b.type})</option>)}
                            </select>
                        </div>
                        {bindData.type === 'crypto' ? (
                            <div><label className="text-slate-400 text-xs uppercase block mb-1">TRC20 Address</label><input type="text" value={bindData.no} onChange={e => setBindData({...bindData, no: e.target.value})} className={`w-full border rounded-lg p-3 ${isGold ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-600 text-white'}`} placeholder="T..." /></div>
                        ) : (
                            <>
                                <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.accHolder}</label><input type="text" value={bindData.name} onChange={e => setBindData({...bindData, name: e.target.value})} className={`w-full border rounded-lg p-3 ${isGold ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-600 text-white'}`} /></div>
                                <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.accNumber}</label><input type="tel" value={bindData.no} onChange={e => setBindData({...bindData, no: e.target.value})} className={`w-full border rounded-lg p-3 ${isGold ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-600 text-white'}`} /></div>
                            </>
                        )}
                        <div className="flex space-x-3 mt-6"><button onClick={() => setModal(null)} className="flex-1 bg-slate-500 text-white py-3 rounded-xl">{t.cancel}</button><button onClick={() => { onBindCard(bindData.bank, bindData.name, bindData.no, bindData.type); setModal(null); }} className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold">{t.save}</button></div>
                    </div>
                </>
            )}

            {modal === 'withdraw' && (
                <>
                    <h3 className={`text-xl font-bold mb-4 ${isGold ? 'text-slate-800' : 'text-white'}`}>{t.confirmWithdraw}</h3>
                    <p className="text-xs text-slate-400 mb-4">Minimum Withdrawal: <span className="text-yellow-500 font-bold">{formatMoney(minWithdraw, user.currency)}</span></p>
                    {hasAccounts ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-xs uppercase block mb-1">{t.selectAccount}</label>
                                <select value={selectedAccId} onChange={e => setSelectedAccId(e.target.value)} className={`w-full border rounded-lg p-3 ${isGold ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-600 text-white'}`}>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                                    ))}
                                </select>
                            </div>
                            <div><label className="text-slate-400 text-xs uppercase block mb-1">{t.amount}</label><input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className={`w-full border rounded-lg p-3 ${isGold ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-600 text-white'}`} /></div>
                            <div className="flex space-x-3 mt-6"><button onClick={() => setModal(null)} className="flex-1 bg-slate-500 text-white py-3 rounded-xl">{t.cancel}</button><button onClick={() => { onWithdraw(Number(withdrawAmount), selectedAccId); setModal(null); }} className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold">{t.submit}</button></div>
                        </div>
                    ) : <div className="text-center text-slate-400 py-4">Please add account first. <button onClick={() => setModal('bind')} className="text-yellow-500 underline">Add</button></div>}
                </>
            )}
          </div>
        </div>
       )}

      <div className={`p-6 rounded-b-3xl shadow-2xl relative overflow-hidden ${isGold ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-indigo-900 to-slate-900'}`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
           <div className="flex items-center space-x-3"><div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm"><UserIcon /></div><div><p className="text-white font-bold text-lg">{user.phone}</p><p className="text-white/70 text-xs">ID: {user.id}</p></div></div>
           <div className="flex gap-2">
               <button onClick={toggleTheme} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"><Palette size={20} /></button>
               <button onClick={logout} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"><LogOut size={20} /></button>
           </div>
        </div>
        
        {/* VIP CARD */}
        <div className="bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-400 rounded-xl p-1 mb-4 shadow-lg">
            <div className="bg-slate-900/90 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow">
                        <Crown size={20} className="text-white fill-white" />
                    </div>
                    <div>
                        <h3 className="text-yellow-400 font-bold text-lg leading-none">VIP {user.vipLevel}</h3>
                        <p className="text-slate-400 text-[10px]">Level 20 Max</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Total Earned</div>
                    <div className="text-yellow-400 font-bold font-mono">{formatMoney(user.totalEarnings, user.currency)}</div>
                </div>
            </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 relative z-10">
           <div className="flex justify-between mb-4">
             <div><p className="text-white/80 text-xs uppercase mb-1">{t.balance}</p><h2 className="text-3xl font-bold text-white">{formatMoney(user.balance, user.currency)}</h2></div>
             <div className="text-right"><p className="text-white/80 text-xs uppercase mb-1">{t.totalEarnings}</p><h2 className="text-xl font-bold text-white">{formatMoney(user.totalEarnings, user.currency)}</h2></div>
           </div>
           <div className="flex space-x-3">
             <button onClick={() => setModal('withdraw')} className="flex-1 bg-white text-yellow-600 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-100 shadow-lg">{t.withdraw}</button>
             <button onClick={() => setModal('bind')} className="flex-1 bg-black/20 text-white py-2.5 rounded-lg font-bold text-sm border border-white/20 hover:bg-black/30">{t.bindCard}</button>
           </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
         {/* Menu Grid */}
         <div className="grid grid-cols-4 gap-4 mb-2">
             <button onClick={() => navigate('/transactions')} className="flex flex-col items-center gap-1">
                 <div className={`p-3 rounded-full ${isGold ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-800 text-indigo-400'}`}><History size={20}/></div>
                 <span className={`text-[10px] ${isGold ? 'text-slate-600' : 'text-slate-400'}`}>{t.transactions}</span>
             </button>
             <button onClick={() => navigate('/help')} className="flex flex-col items-center gap-1">
                 <div className={`p-3 rounded-full ${isGold ? 'bg-green-100 text-green-600' : 'bg-slate-800 text-green-400'}`}><HelpCircle size={20}/></div>
                 <span className={`text-[10px] ${isGold ? 'text-slate-600' : 'text-slate-400'}`}>Help</span>
             </button>
             <button onClick={() => navigate('/about')} className="flex flex-col items-center gap-1">
                 <div className={`p-3 rounded-full ${isGold ? 'bg-orange-100 text-orange-600' : 'bg-slate-800 text-orange-400'}`}><Info size={20}/></div>
                 <span className={`text-[10px] ${isGold ? 'text-slate-600' : 'text-slate-400'}`}>About</span>
             </button>
         </div>

         {/* Bank Card Display - Horizontal Scroll */}
         <h3 className="text-sm font-bold text-slate-400 uppercase">My Accounts</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                {hasAccounts ? accounts.map(acc => (
                     <div key={acc.id} className={`flex-shrink-0 w-64 rounded-xl p-6 shadow-lg text-white relative overflow-hidden h-36 flex flex-col justify-between ${acc.type === 'ewallet' ? 'bg-gradient-to-r from-green-600 to-teal-700' : acc.type === 'crypto' ? 'bg-gradient-to-r from-slate-700 to-slate-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
                        <div className="relative z-10 flex justify-between items-start"><span className="font-bold text-lg">{acc.bankName}</span><span className="text-xs bg-white/20 px-2 py-1 rounded uppercase">{acc.type}</span></div>
                        <div className="relative z-10 font-mono text-lg tracking-wider truncate">{acc.accountNumber}</div>
                        <div className="relative z-10 text-sm opacity-80">{acc.accountName || 'Crypto Wallet'}</div>
                     </div>
                )) : null}
                 <div onClick={() => setModal('bind')} className={`flex-shrink-0 w-16 h-36 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer ${isGold ? 'border-slate-300 text-slate-400 hover:bg-slate-100' : 'border-slate-700 text-slate-500 hover:bg-slate-800'}`}><Plus size={24} /></div>
            </div>

         {/* Latest Transactions Preview */}
         <div onClick={() => navigate('/transactions')} className={`rounded-xl border overflow-hidden cursor-pointer active:scale-98 transition-transform ${isGold ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
            <div className={`p-4 border-b font-bold flex items-center justify-between ${isGold ? 'border-slate-100 text-slate-800' : 'border-slate-700 text-white'}`}>
                <div className="flex items-center gap-2"><History size={16} /> Latest Record</div>
                <ChevronRight size={16} className="text-slate-400"/>
            </div>
            <div>
                {transactions.length === 0 ? <div className="p-4 text-center text-slate-500 text-xs">No transactions</div> : (
                    <div className="p-4 flex justify-between items-center">
                        <div>
                             <div className={`text-sm ${isGold ? 'text-slate-700' : 'text-white'}`}>{transactions[0].description}</div>
                             <div className="text-[10px] text-slate-500">{new Date(transactions[0].date).toLocaleDateString()}</div>
                        </div>
                        <div className={`font-mono text-sm font-bold ${transactions[0].amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{transactions[0].amount > 0 ? '+' : ''}{formatMoney(transactions[0].amount, user.currency)}</div>
                    </div>
                )}
            </div>
         </div>
      </div>
  </div>
  );
};

export const MyTasksView: React.FC<{ user: User; onSubmitProof: (taskId: string, img: string) => void; t: any; lang: Language }> = ({ user, onSubmitProof, t, lang }) => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'reviewing' | 'completed'>('ongoing');
  const myTasks = user.myTasks || [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTaskId, setCurrentUploadTaskId] = useState<string | null>(null);
  const isGold = user.theme === 'gold';
  const navigate = useNavigate();
  
  const tasks = myTasks.filter(task => {
    if (!task || !task.status) return false;
    if (activeTab === 'ongoing') return task.status === 'ongoing';
    if (activeTab === 'reviewing') return task.status === 'reviewing';
    return task.status === 'completed' || task.status === 'rejected';
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && currentUploadTaskId) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onSubmitProof(currentUploadTaskId, reader.result as string);
              setCurrentUploadTaskId(null);
          };
          reader.readAsDataURL(file);
      }
  };

  const triggerUpload = (taskId: string) => {
      setCurrentUploadTaskId(taskId);
      fileInputRef.current?.click();
  };

  return (
    <div className={`p-4 min-h-screen ${isGold ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <h2 className={`text-xl font-bold mb-4 ${isGold ? 'text-slate-800' : 'text-white'}`}>{t.myTasksTitle}</h2>
      
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <div className={`flex space-x-1 p-1 rounded-lg mb-4 ${isGold ? 'bg-slate-200' : 'bg-slate-800'}`}>
        {['ongoing', 'reviewing', 'completed'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === tab ? (isGold ? 'bg-white text-slate-900 shadow' : 'bg-slate-600 text-white shadow') : (isGold ? 'text-slate-500' : 'text-slate-400')}`}>{t.status[tab]}</button>
        ))}
      </div>
      {tasks.length === 0 ? <div className={`text-center py-20 text-slate-500 rounded-xl border border-dashed ${isGold ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/50 border-slate-700'}`}>{t.noTasks}</div> :
        <div className="space-y-4">
           {tasks.map(task => (
             <div key={task.id} onClick={() => navigate(`/task-detail/${task.platformId}`)} className={`rounded-xl p-4 border shadow-md ${isGold ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'} cursor-pointer active:scale-98 transition-transform`}>
               <div className="flex space-x-3 mb-3">
                 <img src={task.logoUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg bg-slate-700 object-cover" />
                 <div><h3 className={`font-bold ${isGold ? 'text-slate-800' : 'text-white'}`}>{task.platformName}</h3><span className="text-yellow-500 text-sm font-bold">{t.reward}: {formatMoney(task.rewardAmount, user.currency)}</span></div>
               </div>
               {task.status === 'ongoing' && (
                 <div className="mt-2 pt-3 border-t border-slate-200/20">
                   <p className="text-slate-400 text-xs mb-3">Tap to upload screenshot proof.</p>
                   <button onClick={(e) => { e.stopPropagation(); triggerUpload(task.id); }} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 flex items-center justify-center space-x-2">
                     <Upload size={14} /><span>{t.uploadScreenshot}</span>
                   </button>
                 </div>
               )}
               {task.status === 'reviewing' && <div className="mt-2 pt-2 border-t border-slate-200/20 flex items-center space-x-2 text-orange-400 text-sm font-medium"><Clock size={16} /><span>Wait for admin audit...</span></div>}
               {task.status === 'completed' && <div className="mt-2 pt-2 border-t border-slate-200/20 flex items-center space-x-2 text-green-500 text-sm font-bold"><CheckCircle size={16} /><span>Reward Received!</span></div>}
               {task.status === 'rejected' && <div className="mt-2 pt-2 border-t border-slate-200/20 flex items-center space-x-2 text-red-500 text-sm font-bold"><XCircle size={16} /><span>Rejected</span></div>}
             </div>
           ))}
        </div>
      }
    </div>
  );
};

export const ReferralView: React.FC<{ user: User; users: User[]; t: any; lang: Language; config: SystemConfig }> = ({ user, users, t, lang, config }) => {
    const referralLink = `https://betbounty.app/reg?c=${user.referralCode}`;
    const copyToClipboard = () => { navigator.clipboard.writeText(referralLink); alert(t.copied); };
    const isGold = user.theme === 'gold';
    
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
     <div className={`min-h-screen ${isGold ? 'bg-slate-50' : 'bg-slate-900'}`}>
        
        <div className="p-4 pt-4 pb-24 space-y-6">
            <div className={`rounded-2xl p-6 shadow-2xl text-center border ${isGold ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-amber-300' : 'bg-gradient-to-br from-indigo-900 to-slate-800 border-indigo-500/30'}`}>
            <h2 className="text-2xl font-bold text-white mb-2">{t.referralRules}</h2>
            <p className="text-white/80 text-sm mb-6">{t.referralDesc}</p>
            
            <div className="bg-black/20 p-4 rounded-xl mb-4 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4 text-left">
                    <div><p className="text-xs text-white/70">{t.todayStats}</p><p className="text-xl font-bold text-yellow-300">{formatMoney(todayComms, user.currency)}</p></div>
                    <div><p className="text-xs text-white/70">{t.totalInvited}</p><p className="text-xl font-bold text-white">{level1.length + level2.length + level3.length}</p></div>
                </div>
            </div>
            <div className="flex justify-between text-xs text-white/70 px-2">
                <div><span className="block font-bold text-white text-lg">{level1.length}</span>{t.level1}</div>
                <div><span className="block font-bold text-white text-lg">{level2.length}</span>{t.level2}</div>
                <div><span className="block font-bold text-white text-lg">{level3.length}</span>{t.level3}</div>
            </div>
            </div>

            {/* Marquee - Between Rules and Share */}
            <div className="-mx-4">
                <WinningMarquee type="invite" lang={lang} hypeLevel={config.hypeLevel || 5} />
            </div>

            {/* Share Section with QR Code (Enhanced Layout) */}
            <div className={`rounded-xl p-4 border ${isGold ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
                <h3 className={`font-bold mb-3 flex items-center gap-2 ${isGold ? 'text-slate-800' : 'text-white'}`}><Share2 size={16}/> {t.shareVia}</h3>
                
                <div className="flex gap-4">
                    {/* Left: Buttons */}
                    <div className="flex-1 flex flex-col justify-center gap-3">
                        <div className="flex justify-between gap-2">
                            <button onClick={() => share('fb')} className="flex-1 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white"><Facebook size={20}/></button>
                            <button onClick={() => share('tw')} className="flex-1 h-10 rounded-lg bg-sky-400 flex items-center justify-center text-white"><Twitter size={20}/></button>
                        </div>
                        <div className="flex justify-between gap-2">
                            <button onClick={() => share('wa')} className="flex-1 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white"><MessageCircle size={20}/></button>
                            <button onClick={() => share('tg')} className="flex-1 h-10 rounded-lg bg-blue-400 flex items-center justify-center text-white"><Send size={20}/></button>
                        </div>
                    </div>

                    {/* Right: QR Code */}
                    <div className="bg-white p-2 rounded-xl flex-shrink-0 shadow-md">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${referralLink}`} className="w-20 h-20" />
                    </div>
                </div>

                <div className={`mt-4 rounded-lg p-3 flex items-center justify-between border ${isGold ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-600'}`}>
                    <div className="truncate text-xs text-slate-400 mr-2 flex-1">{referralLink}</div>
                    <button onClick={copyToClipboard} className="text-white bg-slate-500 hover:bg-slate-600 p-2 rounded-lg flex-shrink-0"><LinkIcon size={16} /></button>
                </div>
            </div>

            {/* Tree Explanation */}
            <div className={`rounded-xl p-6 border ${isGold ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
                <h3 className={`font-bold mb-4 ${isGold ? 'text-slate-800' : 'text-white'}`}>{t.howItWorks}</h3>
                <div className="relative pl-4 space-y-6">
                    <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-indigo-500/30"></div>
                    
                    {/* Level 1 */}
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500 text-slate-900 font-bold flex items-center justify-center z-10 border-4 border-white/10 shadow">You</div>
                            <div className="text-sm">
                                <p className={`font-bold ${isGold ? 'text-slate-700' : 'text-white'}`}>{t.refStoryA}</p>
                                <p className="text-yellow-500 text-xs font-bold">{t.refStoryEarn} 20%</p>
                            </div>
                        </div>
                    </div>

                    {/* Level 2 */}
                    <div className="relative ml-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center z-10 border-2 border-white/10 shadow">A</div>
                            <div className="text-sm">
                                <p className={`font-bold ${isGold ? 'text-slate-700' : 'text-white'}`}>{t.refStoryB}</p>
                                <p className="text-yellow-500 text-xs font-bold">{t.refStoryEarn} 10%</p>
                            </div>
                        </div>
                    </div>

                    {/* Level 3 */}
                    <div className="relative ml-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-500 text-white font-bold flex items-center justify-center z-10 border-2 border-white/10 shadow">B</div>
                            <div className="text-sm">
                                <p className={`font-bold ${isGold ? 'text-slate-700' : 'text-white'}`}>{t.refStoryC}</p>
                                <p className="text-yellow-500 text-xs font-bold">{t.refStoryEarn} 5%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mt-6 p-4 rounded-lg text-xs ${isGold ? 'bg-slate-100 text-slate-500' : 'bg-slate-900/50 text-slate-400'}`}>
                    <p className={`font-bold mb-1 ${isGold ? 'text-slate-700' : 'text-slate-300'}`}>{t.refExample}:</p>
                    <ul className="space-y-1">
                        <li>• Level 1 User (A): You get <span className="text-green-500 font-bold">$20</span></li>
                        <li>• Level 2 User (B): You get <span className="text-green-500 font-bold">$10</span></li>
                        <li>• Level 3 User (C): You get <span className="text-green-500 font-bold">$5</span></li>
                    </ul>
                </div>
            </div>
        </div>
     </div>
    );
};
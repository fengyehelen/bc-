import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { Language, Platform, User, UserTask, SortOption, Activity } from './types';
import { LANGUAGES, TRANSLATIONS, MOCK_PLATFORMS, MOCK_ACTIVITIES } from './constants';
import { generatePlatformName, generatePlatformLogo } from './services/geminiService';
import { 
  ArrowLeft, ChevronRight, Copy, Image as ImageIcon, Loader2, Plus, Share2, Sparkles, 
  Upload, Clock, XCircle, Mail, User as UserIcon, List, CheckCircle, Smartphone, 
  Lock, MessageSquare, LogOut, Check, QrCode, Facebook, Twitter, CreditCard, Image,
  Eye, EyeOff, ArrowDown
} from 'lucide-react';

// --- SUB-COMPONENTS ---

// Helper: Format Money
const formatMoney = (amount: number, lang: Language) => {
  const config = LANGUAGES[lang];
  return `${config.currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
         <div 
           key={act.id} 
           className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
         >
           <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
             <h3 className="text-white font-bold text-lg">{act.title}</h3>
           </div>
         </div>
       ))}
       {filteredActivities.length > 1 && (
         <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
           {filteredActivities.map((_, idx) => (
             <div 
               key={idx} 
               className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-yellow-400 w-4' : 'bg-white/50'}`} 
             />
           ))}
         </div>
       )}
    </div>
  );
};

// Activity Popup
const ActivityPopup: React.FC<{ isOpen: boolean; onClose: () => void; activity: Activity; t: any }> = ({ isOpen, onClose, activity, t }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 z-10 hover:bg-black/70">
          <XCircle size={24} />
        </button>
        <img src={activity.imageUrl} alt={activity.title} className="w-full h-64 object-cover" />
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">{activity.title}</h3>
          <p className="text-slate-400 text-sm mb-6">{t.activityTitle}</p>
          <button 
            onClick={() => { onClose(); navigate(`/activity/${activity.id}`); }}
            className="bg-yellow-500 text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-400 w-full"
          >
            {t.play}
          </button>
        </div>
      </div>
    </div>
  );
};

// Activity Detail View
const ActivityDetailView: React.FC<{ activities: Activity[]; t: any }> = ({ activities, t }) => {
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
        <div className="mt-8">
           <button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg">
             Go to Home
           </button>
        </div>
      </div>
    </div>
  );
};

// Bank Binding Modal
const BindCardModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (bank: string, name: string, no: string) => void; t: any }> = ({ isOpen, onClose, onSave, t }) => {
  const [bank, setBank] = useState('');
  const [name, setName] = useState('');
  const [no, setNo] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="text-yellow-500" />
          {t.bindCard}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs uppercase block mb-1">{t.bankName}</label>
            <input 
              type="text" 
              value={bank} 
              onChange={e => setBank(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500" 
              placeholder="e.g. BCA, BNI"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs uppercase block mb-1">{t.accHolder}</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500" 
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs uppercase block mb-1">{t.accNumber}</label>
            <input 
              type="tel" 
              value={no} 
              onChange={e => setNo(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500" 
            />
          </div>
          <div className="flex space-x-3 mt-6">
            <button onClick={onClose} className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-600">
              {t.cancel}
            </button>
            <button 
              onClick={() => {
                if(bank && name && no) {
                  onSave(bank, name, no);
                  onClose();
                } else {
                  alert("Please fill all fields");
                }
              }} 
              className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-yellow-400"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Home View
const HomeView: React.FC<{ 
  platforms: Platform[]; 
  t: any; 
  setSort: (s: SortOption) => void; 
  sort: SortOption;
  lang: Language;
  activities: Activity[];
}> = ({ platforms, t, setSort, sort, lang, activities }) => {
  const navigate = useNavigate();

  // Filter platforms based on language/country
  const filteredPlatforms = React.useMemo(() => {
    return platforms.filter(p => p.targetCountries === 'all' || p.targetCountries.includes(lang));
  }, [platforms, lang]);

  const sortedPlatforms = React.useMemo(() => {
    return [...filteredPlatforms].sort((a, b) => {
      if (sort === SortOption.HIGHEST_REWARD) return b.rewardAmount - a.rewardAmount;
      if (sort === SortOption.LOWEST_DEPOSIT) return a.firstDepositAmount - b.firstDepositAmount;
      return new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime();
    });
  }, [filteredPlatforms, sort]);

  return (
    <div className="p-4 space-y-4">
      {/* Banner Carousel */}
      <BannerCarousel activities={activities} lang={lang} />

      {/* Filter Bar */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur pt-2 pb-2 z-10">
         <span className="text-slate-400 text-xs font-medium">{t.sort}:</span>
         <div className="flex space-x-2">
           {[
             { id: SortOption.NEWEST, label: t.sortNew },
             { id: SortOption.HIGHEST_REWARD, label: t.sortReward },
             { id: SortOption.LOWEST_DEPOSIT, label: t.sortDeposit },
           ].map((opt) => (
             <button
               key={opt.id}
               onClick={() => setSort(opt.id)}
               className={`px-3 py-1 rounded-full text-[10px] border transition-colors ${
                 sort === opt.id 
                   ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' 
                   : 'bg-slate-800 border-slate-700 text-slate-400'
               }`}
             >
               {opt.label}
             </button>
           ))}
         </div>
      </div>

      {/* List */}
      <div className="space-y-4 pb-12">
        {sortedPlatforms.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
             No tasks available for this region yet.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

// Task Detail View
const TaskDetailView: React.FC<{ 
  platforms: Platform[]; 
  onStartTask: (p: Platform) => void; 
  t: any;
  lang: Language;
}> = ({ platforms, onStartTask, t, lang }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = platforms.find(p => p.id === id);
  if (!platform) return <div className="p-4 text-white">Not found</div>;

  return (
    <div className="bg-slate-900 min-h-screen pb-24">
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 z-30 max-w-md mx-auto">
        <button 
          onClick={() => {
            // Open external link
            window.open(platform.downloadLink, '_blank');
            // Join task internally
            onStartTask(platform);
          }} 
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg transition-all text-lg hover:brightness-110"
        >
          {t.startTask}
        </button>
      </div>
    </div>
  );
};

// My Tasks View
const MyTasksView: React.FC<{ user: User; onSubmitProof: (taskId: string, img: string) => void; t: any; lang: Language }> = ({ user, onSubmitProof, t, lang }) => {
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
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === tab ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.status[tab]}
          </button>
        ))}
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
           {t.noTasks}
        </div>
      ) : (
        <div className="space-y-4">
           {tasks.map(task => (
             <div key={task.id} className={`bg-slate-800 rounded-xl p-4 border shadow-md ${
               task.status === 'ongoing' ? 'border-indigo-500/50' :
               task.status === 'reviewing' ? 'border-orange-500/50' :
               task.status === 'completed' ? 'border-green-500/50' : 'border-red-500/50'
             }`}>
               <div className="flex space-x-3 mb-3">
                 <img src={task.logoUrl} className="w-12 h-12 rounded-lg bg-slate-700" />
                 <div>
                   <h3 className="font-bold text-white">{task.platformName}</h3>
                   <span className="text-yellow-400 text-sm font-bold">{t.reward}: {formatMoney(task.rewardAmount, lang)}</span>
                 </div>
               </div>
               
               {task.status === 'ongoing' && (
                 <div className="mt-2 pt-3 border-t border-slate-700">
                   <p className="text-slate-400 text-xs mb-3">Please upload a screenshot of your recharge/registration to verify.</p>
                   <button 
                     onClick={() => onSubmitProof(task.id, 'https://picsum.photos/200/300?random=' + Date.now())} // Mock upload
                     className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 flex items-center justify-center space-x-2"
                   >
                     <Upload size={14} />
                     <span>{t.uploadScreenshot}</span>
                   </button>
                 </div>
               )}

               {task.status === 'reviewing' && (
                 <div className="mt-2 pt-2 border-t border-slate-700 flex items-center space-x-2 text-orange-400 text-sm font-medium">
                   <Clock size={16} />
                   <span>Wait for admin audit...</span>
                 </div>
               )}
               
               {task.status === 'completed' && (
                 <div className="mt-2 pt-2 border-t border-slate-700 flex items-center space-x-2 text-green-400 text-sm font-bold">
                   <CheckCircle size={16} />
                   <span>Reward Received!</span>
                 </div>
               )}

               {task.status === 'rejected' && (
                 <div className="mt-2 pt-2 border-t border-slate-700 text-red-400 text-sm">
                   <p className="flex items-center space-x-2 font-bold"><XCircle size={16} /> <span>Rejected</span></p>
                   <p className="text-xs mt-1 text-slate-500">{task.rejectReason || 'Document invalid or unclear.'}</p>
                 </div>
               )}
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

// Referral View (Visual Tree)
const ReferralView: React.FC<{ user: User; t: any; lang: Language }> = ({ user, t, lang }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://betbounty.app/ref/${user.referralCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referralCode);
    alert(t.copied);
  };

  return (
     <div className="p-4 pt-8 text-center space-y-6 pb-24">
        {/* Intro Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-[60px] opacity-10"></div>
           <h2 className="text-2xl font-bold text-white mb-2">{t.referralRules}</h2>
           <p className="text-slate-300 text-sm mb-6">{t.referralDesc}</p>

           {/* Tree Diagram */}
           <div className="flex flex-col items-center space-y-2 mb-6 text-sm">
              <div className="bg-yellow-500 text-slate-900 font-bold px-4 py-1.5 rounded-full shadow-lg z-10 w-32 border-2 border-yellow-300">{t.refExampleA}</div>
              <ArrowDown size={20} className="text-slate-500" />
              <div className="bg-slate-700 text-white px-4 py-1.5 rounded-full border border-slate-600 w-32 relative">
                {t.refExampleB}
                <span className="absolute -right-16 top-1/2 -translate-y-1/2 text-yellow-400 font-bold text-xs bg-slate-800 px-2 py-1 rounded border border-yellow-500/30">+ 20%</span>
              </div>
              <ArrowDown size={20} className="text-slate-500" />
              <div className="bg-slate-700 text-white px-4 py-1.5 rounded-full border border-slate-600 w-32 relative">
                {t.refExampleC}
                <span className="absolute -right-16 top-1/2 -translate-y-1/2 text-yellow-400 font-bold text-xs bg-slate-800 px-2 py-1 rounded border border-yellow-500/30">+ 10%</span>
              </div>
               <ArrowDown size={20} className="text-slate-500" />
              <div className="bg-slate-700 text-white px-4 py-1.5 rounded-full border border-slate-600 w-32 relative">
                {t.refExampleD}
                <span className="absolute -right-16 top-1/2 -translate-y-1/2 text-yellow-400 font-bold text-xs bg-slate-800 px-2 py-1 rounded border border-yellow-500/30">+ 5%</span>
              </div>
           </div>

           {/* Example Calculation */}
           <div className="bg-slate-900/50 rounded-lg p-3 text-left border border-slate-700 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                 <Sparkles size={16} className="text-yellow-400" />
                 <span className="text-white font-bold text-xs">{t.example}</span>
              </div>
              <p className="text-slate-400 text-xs mb-2">{t.refCalc}</p>
              <ul className="space-y-1 text-xs text-slate-300">
                <li className="flex justify-between"><span>C {t.refEarn}:</span> <span className="text-yellow-400 font-mono">20% = 20</span></li>
                <li className="flex justify-between"><span>B {t.refEarn}:</span> <span className="text-yellow-400 font-mono">10% = 10</span></li>
                <li className="flex justify-between font-bold text-white"><span>A {t.refEarn}:</span> <span className="text-yellow-400 font-mono">5% = 5</span></li>
              </ul>
           </div>
        </div>

        {/* Share Tools */}
        <div className="space-y-4">
           <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
              <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
           </div>
           
           <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between border border-slate-700 max-w-xs mx-auto">
              <div className="text-left">
                 <p className="text-[10px] text-slate-500 uppercase">{t.shareCode}</p>
                 <p className="text-yellow-400 font-bold text-lg tracking-wider">{user.referralCode}</p>
              </div>
              <button onClick={copyToClipboard} className="text-white bg-slate-700 hover:bg-slate-600 p-2 rounded-lg">
                 <Copy size={18} />
              </button>
           </div>
           
           <div className="flex justify-center space-x-4 max-w-xs mx-auto">
              <button className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                 <Smartphone size={24} />
              </button>
              <button className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                 <Facebook size={24} />
              </button>
              <button className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                 <Twitter size={24} />
              </button>
              <button className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg border border-slate-600">
                 <Share2 size={24} />
              </button>
           </div>
        </div>
     </div>
  );
};

// Profile View
const ProfileView: React.FC<{ 
  user: User; 
  t: any; 
  logout: () => void; 
  lang: Language; 
  onBindCard: (b: string, n: string, no: string) => void;
}> = ({ user, t, logout, lang, onBindCard }) => {
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [showCardNo, setShowCardNo] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <BindCardModal 
        isOpen={isBindModalOpen} 
        onClose={() => setIsBindModalOpen(false)} 
        onSave={onBindCard} 
        t={t} 
      />
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-b-3xl shadow-2xl border-b border-indigo-500/30">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center space-x-3">
             <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white"><UserIcon /></div>
             <div>
                <p className="text-white font-bold text-lg">{user.phone}</p>
                <p className="text-slate-400 text-xs">ID: {user.id}</p>
             </div>
           </div>
           <button onClick={logout} className="text-slate-400 hover:text-white"><LogOut size={20} /></button>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
           <div className="flex justify-between mb-4">
             <div>
                <p className="text-indigo-200 text-xs uppercase mb-1">{t.balance}</p>
                <h2 className="text-3xl font-bold text-white">{formatMoney(user.balance, lang)}</h2>
             </div>
             <div className="text-right">
                <p className="text-slate-400 text-xs uppercase mb-1">{t.totalEarnings}</p>
                <h2 className="text-xl font-bold text-yellow-400">{formatMoney(user.totalEarnings, lang)}</h2>
             </div>
           </div>
           <div className="flex space-x-3">
             <button className="flex-1 bg-yellow-500 text-slate-900 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-400 shadow-lg">{t.withdraw}</button>
             <button 
               onClick={() => setIsBindModalOpen(true)}
               className="flex-1 bg-slate-700 text-white py-2.5 rounded-lg font-bold text-sm border border-slate-600 hover:bg-slate-600"
             >
               {t.bindCard}
             </button>
           </div>
        </div>
      </div>
      
      {/* Bank Card Display */}
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
                    <span className="font-mono text-xl tracking-wider">
                       {showCardNo ? user.bankInfo.split(' - ')[2] : `**** **** **** ${user.bankInfo.split(' - ')[2].slice(-4)}`}
                    </span>
                    <button onClick={() => setShowCardNo(!showCardNo)} className="text-white/70 hover:text-white">
                       {showCardNo ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
               </div>
               <div className="relative z-10 flex justify-between items-end">
                  <div>
                     <p className="text-[10px] opacity-70 uppercase mb-0.5">{t.accHolder}</p>
                     <p className="font-medium">{user.bankInfo.split(' - ')[1]}</p>
                  </div>
                  <img src="https://img.icons8.com/fluency/48/chip-card.png" className="w-10 opacity-80" />
               </div>
            </div>
         ) : (
            <div onClick={() => setIsBindModalOpen(true)} className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800 hover:border-slate-600 cursor-pointer transition-colors">
               <Plus size={32} className="mb-2" />
               <span className="text-sm font-bold">{t.bindCard}</span>
            </div>
         )}

         <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700">
            <span className="text-white">Account Status</span>
            <span className="text-green-400 text-sm font-bold flex items-center"><CheckCircle size={14} className="mr-1"/> Verified</span>
         </div>
      </div>
  </div>
  );
};

// Merchant Backend
const MerchantBackend: React.FC<{ 
  users: User[]; 
  tasks: Platform[]; 
  auditTasks: UserTask[]; 
  activities: Activity[];
  updateTaskStatus: (uid: string, tid: string, status: 'completed'|'rejected') => void; 
  addActivity: (act: Activity) => void;
  addTask: (t: Platform) => void;
  t: any 
}> = ({ users, tasks, auditTasks, activities, updateTaskStatus, addActivity, addTask, t }) => {
  const [view, setView] = useState<'audit' | 'users' | 'tasks' | 'activities'>('audit');
  
  // Activity Form State
  const [newActivity, setNewActivity] = useState({ title: '', imageUrl: '', content: '', targetCountries: 'all' });
  
  // Task Form State
  const [newTask, setNewTask] = useState<Partial<Platform>>({
    name: '', description: '', rules: '', firstDepositAmount: 0, rewardAmount: 0, targetCountries: 'all', steps: ['Download', 'Register', 'Deposit']
  });

  // Mock Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'activity' | 'task') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'activity') setNewActivity(prev => ({ ...prev, imageUrl: reader.result as string }));
        else setNewTask(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 flex flex-col">
         <h1 className="text-2xl font-bold mb-8 flex items-center space-x-2">
            <Sparkles className="text-yellow-400" />
            <span>Merchant</span>
         </h1>
         <nav className="space-y-2 flex-1">
            <button onClick={() => setView('audit')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'audit' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
               <CheckCircle size={20} /> <span>{t.adminTabs.audit}</span>
            </button>
            <button onClick={() => setView('users')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'users' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
               <UserIcon size={20} /> <span>{t.adminTabs.users}</span>
            </button>
            <button onClick={() => setView('tasks')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'tasks' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
               <List size={20} /> <span>{t.adminTabs.tasks}</span>
            </button>
            <button onClick={() => setView('activities')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'activities' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>
               <Image size={20} /> <span>{t.adminTabs.activities}</span>
            </button>
         </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
         {view === 'audit' && (
           <div>
              <h2 className="text-2xl font-bold mb-6">Task Audit Queue</h2>
              {/* ... Same Audit Table ... */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="p-4 text-sm font-semibold text-slate-600">User ID</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Task</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Proof</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {auditTasks.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No pending audits</td></tr>}
                       {auditTasks.map(task => {
                          const user = users.find(u => u.myTasks.some(t => t.id === task.id));
                          return (
                           <tr key={task.id} className="hover:bg-slate-50">
                              <td className="p-4 font-mono text-sm">{user?.id}</td>
                              <td className="p-4">
                                 <div className="font-bold">{task.platformName}</div>
                                 <div className="text-xs text-slate-500">Reward: {task.rewardAmount}</div>
                              </td>
                              <td className="p-4">
                                 {task.proofImageUrl ? (
                                    <a href={task.proofImageUrl} target="_blank" className="text-indigo-600 underline text-sm">View Image</a>
                                 ) : <span className="text-red-400">No Image</span>}
                              </td>
                              <td className="p-4 flex space-x-2">
                                 <button onClick={() => user && updateTaskStatus(user.id, task.id, 'completed')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Approve</button>
                                 <button onClick={() => user && updateTaskStatus(user.id, task.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Reject</button>
                              </td>
                           </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
         )}
         
         {view === 'users' && (
           <div>
              <h2 className="text-2xl font-bold mb-6">Registered Users</h2>
               <div className="grid gap-4">
                 {users.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                       <div>
                          <p className="font-bold text-lg">{u.phone}</p>
                          <p className="text-slate-500 text-sm">Joined: {new Date(u.registrationDate).toLocaleDateString()} | Balance: {u.balance}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
         )}

         {view === 'tasks' && (
            <div>
               <h2 className="text-2xl font-bold mb-6">Task Management</h2>
               
               {/* Create Task Form */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                  <h3 className="font-bold mb-4 text-indigo-700">{t.createTask}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="text-xs text-slate-500 block mb-1">{t.taskName}</label>
                        <input type="text" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} className="w-full border p-2 rounded" />
                     </div>
                     <div>
                        <label className="text-xs text-slate-500 block mb-1">{t.taskReward}</label>
                        <input type="number" value={newTask.rewardAmount} onChange={e => setNewTask({...newTask, rewardAmount: Number(e.target.value)})} className="w-full border p-2 rounded" />
                     </div>
                     <div className="col-span-2">
                        <label className="text-xs text-slate-500 block mb-1">{t.taskDesc}</label>
                        <input type="text" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full border p-2 rounded" />
                     </div>
                     <div className="col-span-2">
                        <label className="text-xs text-slate-500 block mb-1">{t.taskRules}</label>
                        <textarea value={newTask.rules} onChange={e => setNewTask({...newTask, rules: e.target.value})} className="w-full border p-2 rounded h-20"></textarea>
                     </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">{t.targetCountry}</label>
                        <select value={newTask.targetCountries as any} onChange={e => setNewTask({...newTask, targetCountries: e.target.value as any})} className="w-full border p-2 rounded">
                           <option value="all">All</option>
                           <option value="id">Indonesia</option>
                           <option value="th">Thailand</option>
                           <option value="vi">Vietnam</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs text-slate-500 block mb-1">{t.uploadImage}</label>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'task')} className="w-full text-xs" />
                     </div>
                  </div>
                  <button 
                     onClick={() => {
                        addTask({
                           id: 't' + Date.now(),
                           name: newTask.name || 'New Task',
                           logoUrl: newTask.logoUrl || 'https://picsum.photos/100/100',
                           description: newTask.description || '',
                           downloadLink: '#',
                           firstDepositAmount: newTask.firstDepositAmount || 0,
                           rewardAmount: newTask.rewardAmount || 0,
                           launchDate: new Date().toISOString(),
                           remainingQty: 100,
                           totalQty: 100,
                           steps: ['Download', 'Register', 'Deposit'],
                           rules: newTask.rules || '',
                           status: 'online',
                           type: 'deposit',
                           targetCountries: (newTask.targetCountries || 'all') as any
                        });
                        setNewTask({ name: '', description: '', rules: '', rewardAmount: 0 });
                     }}
                     className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-500"
                  >
                     Publish Task
                  </button>
               </div>

               <div className="grid grid-cols-3 gap-4">
                  {tasks.map(t => (
                     <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center space-x-3 mb-2">
                           <img src={t.logoUrl} className="w-10 h-10 rounded-lg bg-slate-100" />
                           <h3 className="font-bold">{t.name}</h3>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                           <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs uppercase">{t.status}</span>
                           <span className="font-bold text-slate-700">{t.rewardAmount}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {view === 'activities' && (
            <div>
               <h2 className="text-2xl font-bold mb-6">Activity Management</h2>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                 <h3 className="font-bold mb-4">{t.addActivity}</h3>
                 <div className="flex gap-4 mb-4">
                   <div className="flex-1">
                     <label className="text-xs text-slate-500 block mb-1">{t.activityName}</label>
                     <input type="text" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} className="w-full border p-2 rounded" />
                   </div>
                   <div className="flex-1">
                     <label className="text-xs text-slate-500 block mb-1">{t.targetCountry}</label>
                     <select 
                       value={newActivity.targetCountries} 
                       onChange={e => setNewActivity({...newActivity, targetCountries: e.target.value})} 
                       className="w-full border p-2 rounded"
                     >
                       <option value="all">All</option>
                       <option value="id">Indonesia</option>
                       <option value="th">Thailand</option>
                       <option value="vi">Vietnam</option>
                     </select>
                   </div>
                 </div>
                 <div className="mb-4">
                    <label className="text-xs text-slate-500 block mb-1">{t.activityContent}</label>
                    <textarea value={newActivity.content} onChange={e => setNewActivity({...newActivity, content: e.target.value})} className="w-full border p-2 rounded h-24" />
                 </div>
                 <div className="mb-4">
                    <label className="text-xs text-slate-500 block mb-1">{t.uploadImage}</label>
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'activity')} className="w-full text-xs" />
                 </div>
                 <button 
                   onClick={() => {
                      addActivity({
                        id: 'a' + Date.now(),
                        title: newActivity.title || 'New Event',
                        imageUrl: newActivity.imageUrl || 'https://picsum.photos/800/400?random=' + Date.now(),
                        content: newActivity.content || '',
                        link: '#',
                        active: true,
                        targetCountries: newActivity.targetCountries as any
                      });
                      setNewActivity({ title: '', imageUrl: '', content: '', targetCountries: 'all' });
                   }}
                   className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
                 >
                   {t.addActivity}
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {activities.map(a => (
                     <div key={a.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative group">
                        <img src={a.imageUrl} className="w-full h-32 object-cover" />
                        <div className="p-4">
                           <h3 className="font-bold">{a.title}</h3>
                           <p className="text-xs text-slate-500">Target: {Array.isArray(a.targetCountries) ? a.targetCountries.join(', ') : a.targetCountries}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

// Login View
const LoginView: React.FC<{ onLogin: (p: string, role: 'user'|'merchant') => void; t: any; lang: Language }> = ({ onLogin, t, lang }) => {
  const [isRegister, setIsRegister] = useState(true); // Default to register
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
     setTimer(60);
     const i = setInterval(() => setTimer(prev => {
        if(prev <= 1) clearInterval(i);
        return prev - 1;
     }), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
       <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-xl shadow-yellow-500/20 mb-6">
        <Sparkles size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-8">{t.appName}</h1>
      
      <div className="w-full max-w-xs space-y-4">
        {/* Phone */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center space-x-3">
           <Smartphone className="text-slate-500" size={20} />
           {lang === 'zh' && (
             <span className="text-slate-300 font-bold pr-2 border-r border-slate-600">+86</span>
           )}
           <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t.phone} className="bg-transparent text-white w-full focus:outline-none" />
        </div>
        
        {/* Password */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center space-x-3">
           <Lock className="text-slate-500" size={20} />
           <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t.password} className="bg-transparent text-white w-full focus:outline-none" />
        </div>

        {/* Code (Register Only) */}
        {isRegister && (
           <div className="flex space-x-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center space-x-3 flex-1">
                 <MessageSquare className="text-slate-500" size={20} />
                 <input type="text" value={code} onChange={e=>setCode(e.target.value)} placeholder={t.verifyCode} className="bg-transparent text-white w-full focus:outline-none" />
              </div>
              <button disabled={timer > 0} onClick={startTimer} className="bg-slate-700 text-white px-4 rounded-xl text-xs font-bold disabled:opacity-50 w-24">
                 {timer > 0 ? `${timer}s` : t.getCode}
              </button>
           </div>
        )}

        <button onClick={() => onLogin(phone, 'user')} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg mt-4 hover:brightness-110 active:scale-95 transition-all">
           {isRegister ? t.register : t.login}
        </button>

        <div className="flex justify-between text-xs text-slate-400 mt-4 px-1">
           <button onClick={() => setIsRegister(!isRegister)} className="hover:text-white">
              {isRegister ? t.login : t.register}
           </button>
           <button onClick={() => onLogin('admin', 'merchant')} className="hover:text-yellow-400">
              {t.merchantLogin}
           </button>
        </div>
      </div>
    </div>
  );
};

// Main App
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Mock DB
  const [platforms, setPlatforms] = useState<Platform[]>(MOCK_PLATFORMS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [lang, setLang] = useState<Language>('en');
  const [sort, setSort] = useState<SortOption>(SortOption.NEWEST);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const l = navigator.language.split('-')[0];
    if (l in TRANSLATIONS) setLang(l as Language);
  }, []);

  const t = TRANSLATIONS[lang];

  const handleLogin = (phone: string, role: 'user'|'merchant') => {
    if (role === 'merchant') {
       setUser({ id: 'admin', phone: 'Admin', balance: 0, totalEarnings: 0, referralCode: '', invitedCount: 0, myTasks: [], registrationDate: new Date().toISOString(), role: 'merchant', notifications: 0 });
       return;
    }

    let existingUser = users.find(u => u.phone === phone);
    if (!existingUser) {
       // Mock Tasks for preview
       const mockTasks: UserTask[] = [
          { id: 't1', platformId: '1', platformName: 'RoyalWin Indonesia', logoUrl: MOCK_PLATFORMS[0].logoUrl, rewardAmount: 15000, status: 'ongoing', startTime: new Date().toISOString() },
          { id: 't2', platformId: '3', platformName: 'Global Bet', logoUrl: MOCK_PLATFORMS[2].logoUrl, rewardAmount: 5, status: 'reviewing', startTime: new Date().toISOString(), proofImageUrl: 'mock', submissionTime: new Date().toISOString() },
          { id: 't3', platformId: '2', platformName: 'ThaiLucky Lotto', logoUrl: MOCK_PLATFORMS[1].logoUrl, rewardAmount: 50, status: 'completed', startTime: new Date().toISOString(), submissionTime: new Date().toISOString() },
          { id: 't4', platformId: '4', platformName: 'VinaWin 88', logoUrl: MOCK_PLATFORMS[3].logoUrl, rewardAmount: 30000, status: 'rejected', startTime: new Date().toISOString(), rejectReason: 'Wrong ID in screenshot' }
       ];

       existingUser = {
         id: Math.random().toString(36).substr(2, 8),
         phone, balance: 50, totalEarnings: 50, referralCode: 'U'+Math.floor(Math.random()*9999), invitedCount: 0, 
         myTasks: mockTasks, registrationDate: new Date().toISOString(), role: 'user', notifications: 2
       };
       setUsers([...users, existingUser]);
    }
    setUser(existingUser);
    setTimeout(() => setShowPopup(true), 800);
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

  const handleBindCard = (bank: string, name: string, no: string) => {
    if (!user) return;
    const updatedUser: User = { ...user, bankInfo: `${bank} - ${name} - ${no}` };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const auditTasks = users.flatMap(u => u.myTasks).filter(t => t.status === 'reviewing');

  if (!user) return <LoginView onLogin={handleLogin} t={t} lang={lang} />;

  return (
    <Router>
      <Routes>
        <Route path="/merchant" element={
           user.role === 'merchant' ? 
           <MerchantBackend 
             users={users} 
             tasks={platforms} 
             activities={activities}
             auditTasks={auditTasks} 
             updateTaskStatus={updateTaskStatus} 
             addActivity={(a) => setActivities([...activities, a])}
             addTask={(task) => setPlatforms([...platforms, task])}
             t={t} 
           /> : 
           <Navigate to="/" />
        } />
        
        <Route path="*" element={
           user.role === 'merchant' ? <Navigate to="/merchant" /> :
           <Layout lang={lang} setLang={setLang}>
              <ActivityPopup isOpen={showPopup} onClose={() => setShowPopup(false)} activity={activities[0]} t={t} />
              <Routes>
                 <Route path="/" element={<HomeView platforms={platforms} activities={activities} t={t} setSort={setSort} sort={sort} lang={lang} />} />
                 <Route path="/referral" element={<ReferralView user={user} t={t} lang={lang} />} />
                 <Route path="/tasks" element={<MyTasksView user={user} onSubmitProof={handleSubmitProof} t={t} lang={lang} />} />
                 <Route path="/profile" element={<ProfileView user={user} t={t} logout={() => setUser(null)} lang={lang} onBindCard={handleBindCard} />} />
                 <Route path="/task-detail/:id" element={<TaskDetailView platforms={platforms} onStartTask={handleStartTask} t={t} lang={lang} />} />
                 <Route path="/activity/:id" element={<ActivityDetailView activities={activities} t={t} />} />
                 <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
           </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
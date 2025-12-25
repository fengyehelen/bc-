import React, { useState, useEffect } from 'react';
import { User, Platform, Activity, Admin, SystemConfig, Language } from '../types';
import { generatePlatformInfo, generatePlatformLogo } from '../services/geminiService';
import { 
  Shield, CheckCircle, User as UserIcon, List, Image, Key, LogOut, ArrowLeft,
  LayoutDashboard, Sparkles, Wand2, Zap, Lock, Settings, Mail, Send, Trash2, Power, Plus, X, Save
} from 'lucide-react';

interface AdminAppProps {
  users: User[];
  tasks: Platform[];
  activities: Activity[];
  admins: Admin[];
  config: SystemConfig;
  updateTaskStatus: (uid: string, tid: string, status: 'completed'|'rejected') => void;
  updateUserPassword: (uid: string, pass: string) => void;
  updateConfig: (cfg: SystemConfig) => void;
  sendMessage: (uid: string, title: string, content: string) => void;
  addActivity: (act: Activity) => void;
  addTask: (t: Platform) => void;
  addAdmin: (a: Admin) => void;
  manageContent: (type: 'task'|'activity', id: string, action: 'delete'|'toggle') => void;
  lang: any;
}

const COUNTRIES = [
  { value: 'id', label: 'Indonesia' },
  { value: 'th', label: 'Thailand' },
  { value: 'vi', label: 'Vietnam' },
  { value: 'ms', label: 'Malaysia' },
  { value: 'tl', label: 'Philippines' },
  { value: 'en', label: 'Global' },
  { value: 'zh', label: 'China' }
];

// --- ADMIN LOGIN ---
const AdminLogin: React.FC<{ onLogin: (u: string, p: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"><Shield size={32} className="text-white" /></div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Operations Portal</h2>
        <div className="space-y-4">
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg" /></div>
          <button onClick={() => onLogin(username, password)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg">Login</button>
        </div>
        <div className="mt-6 text-center"><a href="/#/" className="text-sm text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-2"><ArrowLeft size={14} /> Back to Product</a></div>
      </div>
    </div>
  );
};

// --- MAIN ADMIN ---
const AdminApp: React.FC<AdminAppProps> = (props) => {
  const [session, setSession] = useState<Admin | null>(null);
  const [view, setView] = useState<'audit' | 'users' | 'tasks' | 'activities' | 'admins' | 'config' | 'messages'>('audit');
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // --- ROBUST STATE MANAGEMENT FOR FORMS ---
  
  // Activity Form State
  const [actTitle, setActTitle] = useState('');
  const [actContent, setActContent] = useState('');
  const [actImage, setActImage] = useState('');
  const [actCountry, setActCountry] = useState<string>('id'); // Changed to single string

  // Task Form State
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState<string>('0'); 
  const [taskLink, setTaskLink] = useState('');
  const [taskImage, setTaskImage] = useState('');
  const [taskCountry, setTaskCountry] = useState<string>('id'); // Changed to single string
  const [taskSteps, setTaskSteps] = useState<string[]>(['Download App', 'Register', 'Deposit']);

  // Admin Config State
  const [isGenerating, setIsGenerating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'editor' });
  const [msgData, setMsgData] = useState({ userId: 'all', title: '', content: '' });
  const [userSort, setUserSort] = useState<'reg' | 'bal'>('reg');

  useEffect(() => { checkApiKey(); }, []);

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.hasSelectedApiKey && await window.aistudio.hasSelectedApiKey()) setHasApiKey(true);
  };

  const handleConnectAI = async () => {
    // @ts-ignore
    if (window.aistudio) { await window.aistudio.openSelectKey(); setHasApiKey(true); } else { setHasApiKey(true); }
  };

  const handleLogin = (u: string, p: string) => {
    const admin = props.admins.find(a => a.username === u && a.password === p);
    if (admin) setSession(admin);
    else alert("Invalid credentials");
  };

  // --- HELPERS ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- ACTION HANDLERS ---

  const handleResetUserPassword = (userId: string) => {
    const newPass = prompt("Enter new password for user:");
    if (newPass) {
      props.updateUserPassword(userId, newPass);
      alert("Password updated");
    }
  };

  const handleConfigChange = (type: 'init' | 'min', country: string, value: string) => {
    const val = parseInt(value) || 0;
    const newConfig = { ...props.config };
    if (type === 'init') {
        newConfig.initialBalance = { ...newConfig.initialBalance, [country]: val };
    } else {
        newConfig.minWithdrawAmount = { ...newConfig.minWithdrawAmount, [country]: val };
    }
    props.updateConfig(newConfig);
  };

  const handleSendMessage = () => {
    if(!msgData.title || !msgData.content) return alert("Please fill title and content");
    props.sendMessage(msgData.userId, msgData.title, msgData.content);
    setMsgData({ userId: 'all', title: '', content: '' });
  };

  const resetTaskForm = () => {
      setTaskName('');
      setTaskDesc('');
      setTaskReward('0');
      setTaskLink('');
      setTaskImage('');
      setTaskCountry('id');
      setTaskSteps(['Download App', 'Register', 'Deposit']);
  };

  const publishTask = () => {
      // 1. Validation
      if (!taskName) return alert("Task Name is required");
      if (!taskLink) return alert("Task Link is required");

      // 2. Construction (Safe)
      const newTask: Platform = {
          id: 't_' + Date.now(),
          name: taskName,
          description: taskDesc || 'No description',
          logoUrl: taskImage || 'https://via.placeholder.com/100',
          downloadLink: taskLink,
          rewardAmount: Number(taskReward) || 0, // Force Number
          firstDepositAmount: 0,
          launchDate: new Date().toISOString(),
          remainingQty: 100,
          totalQty: 100,
          steps: [...taskSteps], // Clone array
          rules: '',
          status: 'online',
          type: 'deposit',
          // WRAP SINGLE COUNTRY IN ARRAY FOR COMPATIBILITY
          targetCountries: [taskCountry as Language]
      };

      // 3. Submit
      props.addTask(newTask);
      resetTaskForm();
      alert("Task Published Successfully!");
  };

  const publishActivity = () => {
      if (!actTitle) return alert("Title is required");
      
      const newAct: Activity = {
          id: 'a_' + Date.now(),
          title: actTitle,
          content: actContent,
          imageUrl: actImage || 'https://via.placeholder.com/400x200',
          link: '#',
          active: true,
          // WRAP SINGLE COUNTRY IN ARRAY FOR COMPATIBILITY
          targetCountries: [actCountry as Language]
      };

      props.addActivity(newAct);
      setActTitle('');
      setActContent('');
      setActImage('');
      alert("Activity Published!");
  };

  // --- AI HANDLERS ---
  
  const aiFillTask = async () => {
    if (!taskName) return alert("Enter a Task Name first");
    setIsGenerating(true);
    try {
        const info = await generatePlatformInfo(taskName);
        setTaskName(info.name);
        setTaskDesc(info.description);
    } finally { setIsGenerating(false); }
  };

  const aiLogoTask = async () => {
    if (!taskName) return alert("Enter a Task Name first");
    setIsGenerating(true);
    try {
        const logo = await generatePlatformLogo(`${taskName} ${taskDesc}`);
        setTaskImage(logo);
    } finally { setIsGenerating(false); }
  };

  // --- RENDER ---

  if (!session) return <AdminLogin onLogin={handleLogin} />;

  const auditTasks = props.users.flatMap(u => (u.myTasks || []).filter(t => t.status === 'reviewing'));
  const sortedUsers = [...props.users].sort((a, b) => {
      if (userSort === 'bal') return b.balance - a.balance;
      return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800"><h1 className="text-xl font-bold flex items-center gap-2 text-white"><Shield className="text-yellow-400" /><span>Admin Panel</span></h1></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <button onClick={() => setView('audit')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'audit' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}><CheckCircle size={18} /> <span>Audit Queue</span>{auditTasks.length > 0 && <span className="ml-auto bg-red-500 text-[10px] px-2 rounded-full">{auditTasks.length}</span>}</button>
            <button onClick={() => setView('users')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'users' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}><UserIcon size={18} /> <span>Users</span></button>
            <button onClick={() => setView('tasks')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'tasks' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}><List size={18} /> <span>Tasks</span></button>
            <button onClick={() => setView('activities')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'activities' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}><Image size={18} /> <span>Activities</span></button>
            <button onClick={() => setView('messages')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'messages' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}><Mail size={18} /> <span>Messages</span></button>
            <button onClick={() => setView('config')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'config' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}><Settings size={18} /> <span>Config</span></button>
            <button onClick={() => setView('admins')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${view === 'admins' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}><Key size={18} /> <span>Admins</span></button>
        </nav>
        <div className="p-4 border-t border-slate-800">
             {!hasApiKey && <button onClick={handleConnectAI} className="w-full bg-slate-800 text-yellow-400 text-xs py-2 rounded border border-slate-700 mb-2"><Zap size={12} className="inline mr-1" /> Connect AI</button>}
             <button onClick={() => setSession(null)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-4 py-2 hover:bg-slate-800 rounded-lg"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-slate-800 capitalize">{view} Management</h2><div className="text-right"><p className="text-sm font-bold text-slate-800">{session.username}</p><p className="text-xs text-slate-500 uppercase">{session.role}</p></div></header>

        {view === 'audit' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-4">User</th><th className="p-4">Task</th><th className="p-4">Proof</th><th className="p-4">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                   {auditTasks.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-400">All caught up!</td></tr>}
                   {auditTasks.map(task => {
                      const user = props.users.find(u => (u.myTasks || []).some(t => t.id === task.id));
                      return (
                       <tr key={task.id}>
                          <td className="p-4"><div className="font-bold">{user?.phone}</div><div className="text-xs text-slate-400">ID: {user?.id}</div></td>
                          <td className="p-4"><div className="font-bold text-indigo-600">{task.platformName}</div><div className="text-xs">Reward: {task.rewardAmount}</div></td>
                          <td className="p-4">{task.proofImageUrl ? <a href={task.proofImageUrl} target="_blank" className="text-indigo-600 underline">View</a> : 'No Image'}</td>
                          <td className="p-4 flex gap-2">
                             <button onClick={() => user && props.updateTaskStatus(user.id, task.id, 'completed')} className="bg-green-100 text-green-700 px-3 py-1 rounded">Approve</button>
                             <button onClick={() => user && props.updateTaskStatus(user.id, task.id, 'rejected')} className="bg-red-100 text-red-700 px-3 py-1 rounded">Reject</button>
                          </td>
                       </tr>
                      );
                   })}
                </tbody>
             </table>
           </div>
        )}

        {view === 'users' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex gap-4">
                 <span className="text-xs font-bold uppercase py-2">Sort by:</span>
                 <button onClick={() => setUserSort('reg')} className={`text-xs px-3 py-1 rounded ${userSort === 'reg' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100'}`}>Registration Date</button>
                 <button onClick={() => setUserSort('bal')} className={`text-xs px-3 py-1 rounded ${userSort === 'bal' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100'}`}>Highest Balance</button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr><th className="p-4">Phone/ID</th><th className="p-4">Balance</th><th className="p-4">Team</th><th className="p-4">Reg Date</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {sortedUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                         <td className="p-4">
                             <div className="font-bold text-slate-900">{u.phone}</div>
                             <div className="text-[10px] text-slate-400">ID: {u.id} | Pwd: {u.password}</div>
                         </td>
                         <td className="p-4 font-mono font-bold text-green-600">{u.currency} {u.balance}</td>
                         <td className="p-4">{u.invitedCount}</td>
                         <td className="p-4 text-xs text-slate-500">{new Date(u.registrationDate).toLocaleDateString()} {new Date(u.registrationDate).toLocaleTimeString()}</td>
                         <td className="p-4">
                             <button onClick={() => handleResetUserPassword(u.id)} className="text-xs border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-1"><Lock size={10} /> Reset Pwd</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        )}

        {/* --- REWRITTEN TASK CREATION --- */}
        {view === 'tasks' && (
           <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-slate-800">Create New Task</h3>
                      <button onClick={resetTaskForm} className="text-xs text-slate-500 hover:text-indigo-600 underline">Reset Form</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     {/* LEFT COLUMN: Basic Info */}
                     <div className="space-y-4">
                         <div className="space-y-1">
                             <div className="flex justify-between">
                                <label className="text-xs font-bold uppercase text-slate-500">Platform Name</label>
                                <button onClick={aiFillTask} disabled={isGenerating} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 rounded flex items-center gap-1 hover:bg-indigo-100"><Sparkles size={10}/> AI Fill</button>
                             </div>
                             <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. RoyalWin88" />
                         </div>

                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                             <input type="text" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:outline-none" placeholder="Short marketing text" />
                         </div>

                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Reward Amount</label>
                             <div className="flex items-center">
                                <span className="bg-slate-100 border border-slate-300 border-r-0 p-2.5 rounded-l-lg text-slate-500 text-sm">$</span>
                                <input type="number" value={taskReward} onChange={e => setTaskReward(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-r-lg focus:outline-none font-mono font-bold" placeholder="50000" />
                             </div>
                             <p className="text-[10px] text-slate-400 italic">User sees currency symbol based on their country setting.</p>
                         </div>

                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Task Link (URL)</label>
                             <input type="text" value={taskLink} onChange={e => setTaskLink(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:outline-none" placeholder="https://..." />
                         </div>
                         
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Logo</label>
                             <div className="flex gap-2 items-center">
                                 {taskImage ? <img src={taskImage} className="w-12 h-12 rounded-lg border" /> : <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300"><Image size={20}/></div>}
                                 <input type="file" onChange={e => handleImageUpload(e, setTaskImage)} className="text-xs w-full" />
                                 <button onClick={aiLogoTask} disabled={isGenerating} className="text-xs bg-slate-800 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-slate-700 whitespace-nowrap"><Wand2 size={12}/> AI Gen</button>
                             </div>
                         </div>
                     </div>

                     {/* RIGHT COLUMN: Steps & Country */}
                     <div className="space-y-4">
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">Task Steps</label>
                             <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 max-h-48 overflow-y-auto">
                                 {taskSteps.map((step, idx) => (
                                     <div key={idx} className="flex gap-2">
                                         <span className="bg-white border w-6 h-8 flex items-center justify-center rounded text-xs font-bold text-slate-400">{idx+1}</span>
                                         <input 
                                             value={step} 
                                             onChange={e => {
                                                 const newSteps = [...taskSteps];
                                                 newSteps[idx] = e.target.value;
                                                 setTaskSteps(newSteps);
                                             }}
                                             className="flex-1 border p-1 rounded px-2 text-sm focus:outline-none focus:border-indigo-400"
                                         />
                                         <button onClick={() => setTaskSteps(taskSteps.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                                     </div>
                                 ))}
                                 <button onClick={() => setTaskSteps([...taskSteps, 'New Step'])} className="w-full py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded flex items-center justify-center gap-1"><Plus size={12}/> Add Step</button>
                             </div>
                         </div>

                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">Target Country</label>
                             <select 
                                value={taskCountry} 
                                onChange={e => setTaskCountry(e.target.value)} 
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:outline-none bg-white"
                             >
                                {COUNTRIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                             </select>
                         </div>
                     </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                      <button onClick={publishTask} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform hover:-translate-y-1 active:scale-95">
                          <Save size={18} /> Publish Task
                      </button>
                  </div>
               </div>
               
               {/* Simplified List View */}
               <div className="grid grid-cols-1 gap-3">
                   {(props.tasks || []).map(t => (
                       <div key={t.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                           <div className="flex items-center gap-4">
                               <img src={t.logoUrl || ''} className="w-12 h-12 rounded-lg bg-slate-100 object-cover" />
                               <div>
                                   <h3 className="font-bold text-slate-800">{t.name}</h3>
                                   <div className="flex gap-2 mt-1">
                                       {(t.targetCountries || []).map(tc => <span key={tc} className="bg-slate-100 text-[10px] px-1.5 py-0.5 rounded text-slate-500 uppercase">{tc}</span>)}
                                   </div>
                               </div>
                           </div>
                           <div className="flex items-center gap-3">
                               <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{t.rewardAmount}</span>
                               <div className="h-6 w-px bg-slate-200"></div>
                               <button onClick={() => props.manageContent('task', t.id, 'toggle')} className={`p-2 rounded-lg ${t.status === 'online' ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}><Power size={18}/></button>
                               <button onClick={() => props.manageContent('task', t.id, 'delete')} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={18}/></button>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        )}

        {/* --- REWRITTEN ACTIVITY CREATION --- */}
        {view === 'activities' && (
           <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-6">Publish Activity</h3>
                  <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-4">
                           <div><label className="text-xs font-bold uppercase text-slate-500">Title</label><input value={actTitle} onChange={e => setActTitle(e.target.value)} className="w-full border p-2 rounded-lg mt-1" /></div>
                           <div>
                               <label className="text-xs font-bold uppercase text-slate-500">Image</label>
                               <input type="file" onChange={e => handleImageUpload(e, setActImage)} className="block w-full text-xs mt-1"/>
                               {actImage && <img src={actImage} className="mt-2 h-32 w-full object-cover rounded-lg border" />}
                           </div>
                       </div>
                       <div className="space-y-4">
                           <div><label className="text-xs font-bold uppercase text-slate-500">Content</label><textarea value={actContent} onChange={e => setActContent(e.target.value)} className="w-full border p-2 rounded-lg mt-1 h-32" /></div>
                           <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Target Country</label>
                                <select 
                                    value={actCountry} 
                                    onChange={e => setActCountry(e.target.value)} 
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:outline-none bg-white"
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                           </div>
                       </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                      <button onClick={publishActivity} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Save size={18} /> Publish Activity</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-3">
                   {(props.activities || []).map(a => (
                       <div key={a.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                           <div className="flex items-center gap-4">
                               <img src={a.imageUrl || ''} className="w-16 h-10 rounded bg-slate-100 object-cover" />
                               <div>
                                   <h3 className="font-bold text-slate-800">{a.title}</h3>
                                   <div className="text-xs text-slate-500">{(a.targetCountries || []).join(', ').toUpperCase()}</div>
                               </div>
                           </div>
                           <div className="flex items-center gap-2">
                               <button onClick={() => props.manageContent('activity', a.id, 'toggle')} className={`p-2 rounded-lg ${a.active ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}><Power size={18}/></button>
                               <button onClick={() => props.manageContent('activity', a.id, 'delete')} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={18}/></button>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        )}

        {view === 'config' && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
              <h3 className="font-bold mb-6 text-lg">System Configuration</h3>
              <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New User Bonus</label>
                          {COUNTRIES.map(c => (
                             <div key={c.value} className="flex items-center mb-1">
                                <span className="w-10 text-[10px] font-bold uppercase">{c.value}</span>
                                <input type="number" value={props.config.initialBalance[c.value] || 0} onChange={e => handleConfigChange('init', c.value, e.target.value)} className="flex-1 border p-1 rounded text-sm" />
                             </div>
                          ))}
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Withdrawal</label>
                          {COUNTRIES.map(c => (
                             <div key={c.value} className="flex items-center mb-1">
                                <span className="w-10 text-[10px] font-bold uppercase">{c.value}</span>
                                <input type="number" value={props.config.minWithdrawAmount[c.value] || 0} onChange={e => handleConfigChange('min', c.value, e.target.value)} className="flex-1 border p-1 rounded text-sm" />
                             </div>
                          ))}
                      </div>
                  </div>
                  <div>
                      <h4 className="text-sm font-bold mb-2">Telegram Channels</h4>
                      <div className="grid gap-2">
                          {COUNTRIES.map(c => (
                              <div key={c.value} className="flex items-center gap-2">
                                  <span className="w-16 text-xs font-bold uppercase">{c.label}</span>
                                  <input type="text" value={props.config.telegramLinks[c.value] || ''} onChange={e => props.updateConfig({...props.config, telegramLinks: {...props.config.telegramLinks, [c.value]: e.target.value}})} className="flex-1 border p-2 rounded" placeholder={`https://t.me/betbounty_${c.value}`} />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
           </div>
        )}

        {view === 'messages' && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
              <h3 className="font-bold mb-4">Send System Message</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recipient (User ID or 'all')</label>
                    <input type="text" value={msgData.userId} onChange={e => setMsgData({...msgData, userId: e.target.value})} className="w-full border p-2 rounded" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                    <input type="text" value={msgData.title} onChange={e => setMsgData({...msgData, title: e.target.value})} className="w-full border p-2 rounded" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
                    <textarea value={msgData.content} onChange={e => setMsgData({...msgData, content: e.target.value})} className="w-full border p-2 rounded h-24" />
                 </div>
                 <button onClick={handleSendMessage} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2"><Send size={16}/> Send</button>
              </div>
           </div>
        )}

        {view === 'admins' && (
           <div className="space-y-6">
              {session.role === 'super_admin' ? (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-lg">
                      <h3 className="font-bold mb-4">Create Admin</h3>
                      <div className="space-y-4 mb-4"><input type="text" placeholder="Username" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="w-full border p-2 rounded" /><input type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full border p-2 rounded" /></div>
                      <button onClick={() => { props.addAdmin({ id: 'admin_' + Date.now(), username: newAdmin.username, password: newAdmin.password, role: 'editor' }); alert('Admin created'); }} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold">Create</button>
                   </div>
              ) : <div className="p-4 bg-yellow-50 text-yellow-800">Editor access only.</div>}
               <div className="grid gap-3 max-w-2xl">{props.admins.map(a => <div key={a.id} className="bg-white p-4 rounded border flex justify-between"><span className="font-bold">{a.username}</span><span className="text-xs uppercase">{a.role}</span></div>)}</div>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminApp;
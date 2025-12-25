import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Platform, Activity, Admin, UserTask } from '../types';
import { TRANSLATIONS } from '../constants';
import { generatePlatformInfo, generatePlatformLogo } from '../services/geminiService';
import { 
  Shield, CheckCircle, User as UserIcon, List, Image, Key, LogOut, ArrowLeft,
  LayoutDashboard, Sparkles, Wand2, Zap
} from 'lucide-react';

interface AdminAppProps {
  users: User[];
  tasks: Platform[];
  activities: Activity[];
  admins: Admin[];
  updateTaskStatus: (uid: string, tid: string, status: 'completed'|'rejected') => void;
  addActivity: (act: Activity) => void;
  addTask: (t: Platform) => void;
  addAdmin: (a: Admin) => void;
  lang: any;
}

// --- ADMIN LOGIN COMPONENT ---
const AdminLogin: React.FC<{ onLogin: (u: string, p: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Shield size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Operations Portal</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Authorized Personnel Only</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => onLogin(username, password)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            Login to Dashboard
          </button>
        </div>
        <div className="mt-6 text-center">
            <a href="/#/" className="text-sm text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back to Product
            </a>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ADMIN APP ---
const AdminApp: React.FC<AdminAppProps> = (props) => {
  const [session, setSession] = useState<Admin | null>(null);
  const [view, setView] = useState<'audit' | 'users' | 'tasks' | 'activities' | 'admins'>('audit');
  
  // AI State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Forms State
  const [newActivity, setNewActivity] = useState({ title: '', imageUrl: '', content: '', targetCountries: 'all' });
  const [newTask, setNewTask] = useState<Partial<Platform>>({
    name: '', description: '', rules: '', firstDepositAmount: 0, rewardAmount: 0, targetCountries: 'all', steps: ['Download', 'Register', 'Deposit'], downloadLink: ''
  });
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'editor' });

  const t = TRANSLATIONS[props.lang] || TRANSLATIONS['en'];

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
       // @ts-ignore
       const has = await window.aistudio.hasSelectedApiKey();
       setHasApiKey(has);
    }
  };

  const handleConnectAI = async () => {
    try {
        // @ts-ignore
        if (window.aistudio && window.aistudio.openSelectKey) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setHasApiKey(true);
        } else {
            alert("AI Studio environment not detected. Assuming API Key is set via env.");
            setHasApiKey(true);
        }
    } catch (e) {
        console.error(e);
        alert("Connection failed. Please check your network (VPN required in some regions).");
    }
  };

  const handleLogin = (u: string, p: string) => {
    const admin = props.admins.find(a => a.username === u && a.password === p);
    if (admin) setSession(admin);
    else alert("Invalid credentials");
  };

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

  // AI Generation Functions
  const handleAiFillTask = async () => {
    if (!newTask.name) {
        alert("Please enter a keyword in the 'Product Name' field first (e.g., 'Slot88' or 'Poker').");
        return;
    }
    setIsGenerating(true);
    try {
        const info = await generatePlatformInfo(newTask.name);
        setNewTask(prev => ({ ...prev, name: info.name, description: info.description }));
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAiLogo = async () => {
    if (!newTask.name) return alert("Enter a name first.");
    setIsGenerating(true);
    try {
        const logo = await generatePlatformLogo(newTask.name + " " + (newTask.description || "gambling chip"));
        setNewTask(prev => ({ ...prev, logoUrl: logo }));
    } finally {
        setIsGenerating(false);
    }
  };

  const auditTasks = props.users.flatMap(u => u.myTasks).filter(t => t.status === 'reviewing');

  if (!session) return <AdminLogin onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                <Shield className="text-yellow-400" />
                <span>Admin Panel</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">v1.1.0 • {session.role}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <button onClick={() => setView('audit')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${view === 'audit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <CheckCircle size={18} /> <span>Audit Queue</span>
               {auditTasks.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 rounded-full">{auditTasks.length}</span>}
            </button>
            <button onClick={() => setView('users')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${view === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <UserIcon size={18} /> <span>Users</span>
            </button>
            <button onClick={() => setView('tasks')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${view === 'tasks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <List size={18} /> <span>Tasks / Products</span>
            </button>
            <button onClick={() => setView('activities')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${view === 'activities' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <Image size={18} /> <span>Activities</span>
            </button>
             <button onClick={() => setView('admins')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${view === 'admins' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
               <Key size={18} /> <span>Admin Accounts</span>
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
             {/* AI Connection Status */}
             <div className="mb-4 px-2">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">Google AI</span>
                    <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                {!hasApiKey && (
                    <button 
                        onClick={handleConnectAI}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs py-2 rounded border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                    >
                        <Zap size={12} /> Connect Key
                    </button>
                )}
            </div>

            <button onClick={() => setSession(null)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors">
                <LogOut size={16} /> Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{view} Management</h2>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-slate-500">System Online</span>
            </div>
        </header>

        {view === 'audit' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-700">Pending Submissions</h3>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">User</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Task</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Proof</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {auditTasks.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-400">All caught up! No pending audits.</td></tr>}
                   {auditTasks.map(task => {
                      const user = props.users.find(u => u.myTasks.some(t => t.id === task.id));
                      return (
                       <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                              <div className="font-bold text-slate-800">{user?.phone}</div>
                              <div className="text-xs text-slate-400 font-mono">ID: {user?.id}</div>
                          </td>
                          <td className="p-4">
                             <div className="font-bold text-indigo-600">{task.platformName}</div>
                             <div className="text-xs text-slate-500">Reward: {task.rewardAmount}</div>
                          </td>
                          <td className="p-4">
                             {task.proofImageUrl ? (
                                <a href={task.proofImageUrl} target="_blank" className="text-indigo-600 hover:underline text-sm flex items-center gap-1"><Image size={14}/> View Proof</a>
                             ) : <span className="text-red-400 text-sm">No Image</span>}
                          </td>
                          <td className="p-4">
                             <div className="flex gap-2">
                                <button onClick={() => user && props.updateTaskStatus(user.id, task.id, 'completed')} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors">Approve</button>
                                <button onClick={() => user && props.updateTaskStatus(user.id, task.id, 'rejected')} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">Reject</button>
                             </div>
                          </td>
                       </tr>
                      );
                   })}
                </tbody>
             </table>
           </div>
        )}

        {view === 'users' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between">
                <h3 className="font-bold text-slate-700">Registered Users</h3>
                <span className="text-sm text-slate-500">Total: {props.users.length}</span>
             </div>
             <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                 {props.users.map(u => (
                    <div key={u.id} className="p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow bg-slate-50/30">
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold"><UserIcon size={16}/></div>
                             <span className="font-bold text-slate-700">{u.phone}</span>
                          </div>
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{u.id}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                          <div className="bg-white p-2 rounded border border-slate-100">
                             <span className="text-xs text-slate-400 block">Balance</span>
                             <span className="font-bold text-green-600">{u.balance}</span>
                          </div>
                           <div className="bg-white p-2 rounded border border-slate-100">
                             <span className="text-xs text-slate-400 block">Invited</span>
                             <span className="font-bold text-slate-700">{u.invitedCount}</span>
                          </div>
                       </div>
                       <div className="mt-3 text-xs text-slate-400 border-t border-slate-100 pt-2">
                          Joined: {new Date(u.registrationDate).toLocaleDateString()}
                       </div>
                    </div>
                 ))}
             </div>
           </div>
        )}

        {view === 'tasks' && (
           <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold mb-4 text-lg text-indigo-700 flex items-center gap-2"><LayoutDashboard size={20}/> Publish New Product / Task</h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                     <div className="space-y-4">
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Product Name (Keyword)</label>
                                <button onClick={handleAiFillTask} disabled={isGenerating} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 disabled:opacity-50"><Sparkles size={12}/> AI Fill</button>
                            </div>
                            <input type="text" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 ring-indigo-500 outline-none" placeholder="e.g. LuckySlots 88" />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Country</label>
                            <select value={newTask.targetCountries as any} onChange={e => setNewTask({...newTask, targetCountries: e.target.value as any})} className="w-full border p-2.5 rounded-lg">
                               <option value="all">Global (All)</option>
                               <option value="id">Indonesia</option>
                               <option value="th">Thailand</option>
                               <option value="vi">Vietnam</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Reward Amount</label>
                            <input type="number" value={newTask.rewardAmount} onChange={e => setNewTask({...newTask, rewardAmount: Number(e.target.value)})} className="w-full border p-2.5 rounded-lg" />
                         </div>
                     </div>
                     <div className="space-y-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Product Link (URL)</label>
                            <input type="text" value={newTask.downloadLink} onChange={e => setNewTask({...newTask, downloadLink: e.target.value})} placeholder="https://..." className="w-full border p-2.5 rounded-lg" />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                            <input type="text" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full border p-2.5 rounded-lg" />
                         </div>
                         <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Logo Upload / Generate</label>
                                <button onClick={handleAiLogo} disabled={isGenerating} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 disabled:opacity-50"><Wand2 size={12}/> AI Gen Logo</button>
                            </div>
                            <div className="flex gap-2">
                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'task')} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                {newTask.logoUrl && <img src={newTask.logoUrl} className="w-10 h-10 rounded border" />}
                            </div>
                         </div>
                     </div>
                     <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Task Rules</label>
                        <textarea value={newTask.rules} onChange={e => setNewTask({...newTask, rules: e.target.value})} className="w-full border p-2.5 rounded-lg h-24" placeholder="Step 1... Step 2..."></textarea>
                     </div>
                  </div>
                  <div className="flex justify-end items-center gap-4">
                      {isGenerating && <div className="text-indigo-600 text-sm animate-pulse flex items-center gap-2"><Sparkles size={16}/> AI is thinking...</div>}
                      <button 
                         onClick={() => {
                            props.addTask({
                               id: 't' + Date.now(),
                               name: newTask.name || 'New Task',
                               logoUrl: newTask.logoUrl || 'https://picsum.photos/100/100',
                               description: newTask.description || '',
                               downloadLink: newTask.downloadLink || '#',
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
                            setNewTask({ name: '', description: '', rules: '', rewardAmount: 0, downloadLink: '' });
                            alert('Task Published Successfully');
                         }}
                         className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                      >
                         Publish Product
                      </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {props.tasks.map(t => (
                     <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center space-x-3 mb-3">
                           <img src={t.logoUrl} className="w-12 h-12 rounded-lg bg-slate-100 object-cover" />
                           <div>
                               <h3 className="font-bold text-slate-800 leading-tight">{t.name}</h3>
                               <a href={t.downloadLink} target="_blank" className="text-xs text-indigo-500 hover:underline truncate block max-w-[150px]">{t.downloadLink}</a>
                           </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
                           <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{t.status}</span>
                           <span className="font-bold text-slate-700">Reward: {t.rewardAmount}</span>
                        </div>
                     </div>
                  ))}
               </div>
           </div>
        )}

        {view === 'activities' && (
           <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="font-bold mb-4 text-lg text-indigo-700">Add Marketing Activity</h3>
                 <div className="grid grid-cols-2 gap-6 mb-4">
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Title</label>
                     <input type="text" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} className="w-full border p-2.5 rounded-lg" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target</label>
                     <select 
                       value={newActivity.targetCountries} 
                       onChange={e => setNewActivity({...newActivity, targetCountries: e.target.value})} 
                       className="w-full border p-2.5 rounded-lg"
                     >
                       <option value="all">Global</option>
                       <option value="id">Indonesia</option>
                       <option value="th">Thailand</option>
                     </select>
                   </div>
                   <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Content</label>
                      <textarea value={newActivity.content} onChange={e => setNewActivity({...newActivity, content: e.target.value})} className="w-full border p-2.5 rounded-lg h-24" />
                   </div>
                   <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Banner Image</label>
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'activity')} className="w-full text-xs" />
                   </div>
                 </div>
                 <button 
                   onClick={() => {
                      props.addActivity({
                        id: 'a' + Date.now(),
                        title: newActivity.title || 'New Event',
                        imageUrl: newActivity.imageUrl || 'https://picsum.photos/800/400?random=' + Date.now(),
                        content: newActivity.content || '',
                        link: '#',
                        active: true,
                        targetCountries: newActivity.targetCountries as any
                      });
                      setNewActivity({ title: '', imageUrl: '', content: '', targetCountries: 'all' });
                      alert('Activity Live');
                   }}
                   className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700"
                 >
                   Publish Activity
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  {props.activities.map(a => (
                     <div key={a.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
                        <div className="h-40 overflow-hidden relative">
                             <img src={a.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-1">
                                {Array.isArray(a.targetCountries) ? a.targetCountries.join(', ') : a.targetCountries}
                             </div>
                        </div>
                        <div className="p-4">
                           <h3 className="font-bold text-slate-800">{a.title}</h3>
                        </div>
                     </div>
                  ))}
               </div>
           </div>
        )}

        {view === 'admins' && (
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-lg">
                  <h3 className="font-bold mb-4 text-lg">Create New Admin</h3>
                  <div className="space-y-4 mb-6">
                     <input type="text" placeholder="Username" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="w-full border p-2.5 rounded-lg" />
                     <input type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full border p-2.5 rounded-lg" />
                     <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})} className="w-full border p-2.5 rounded-lg">
                        <option value="editor">Editor</option>
                        <option value="super_admin">Super Admin</option>
                     </select>
                  </div>
                  <button 
                     onClick={() => {
                        if (newAdmin.username && newAdmin.password) {
                          props.addAdmin({
                             id: 'admin_' + Date.now(),
                             username: newAdmin.username,
                             password: newAdmin.password,
                             role: newAdmin.role as any
                          });
                          setNewAdmin({ username: '', password: '', role: 'editor' });
                          alert('Admin created');
                        }
                     }}
                     className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700"
                  >
                     Create Account
                  </button>
               </div>
               <div className="grid gap-3 max-w-2xl">
                  {props.admins.map(a => (
                     <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><UserIcon size={20}/></div>
                           <div>
                               <p className="font-bold text-slate-800">{a.username}</p>
                               <p className="text-xs text-slate-500 uppercase tracking-wider">{a.role}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminApp;
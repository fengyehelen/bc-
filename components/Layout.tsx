import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, User, Headset, Dices, ClipboardList, Bell, Mail, Send } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  children: React.ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
  telegramLink?: string;
}

const Layout: React.FC<Props> = ({ children, lang, setLang, telegramLink }) => {
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const isMerchant = location.pathname.startsWith('/merchant');

  if (isMerchant) {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  const handleCS = () => {
    alert("Opening SalesSmartly Chat...");
  };

  const handleTelegram = () => {
    if (telegramLink) window.open(telegramLink, '_blank');
    else alert("Channel link not configured");
  };

  const handleMail = () => {
    alert("Opening Messages Inbox...");
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-900 border-x border-slate-800 shadow-2xl relative">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 flex-shrink-0">
             <Dices size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
            {t.appName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={handleTelegram} className="p-1.5 rounded-full hover:bg-slate-800 text-blue-400">
             <Send size={18} />
          </button>

           <button onClick={handleMail} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300">
             <Mail size={18} />
          </button>

           <button className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 relative">
             <Bell size={18} />
          </button>

          <button 
            onClick={handleCS}
            className="p-1.5 rounded-full bg-slate-800 border border-slate-700 text-yellow-500 hover:bg-slate-700 transition-colors"
          >
            <Headset size={18} />
          </button>
          
          <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 z-40 w-full max-w-md bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="flex justify-between items-center px-4 py-3">
          <Link to="/" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/') ? 'text-yellow-400' : 'text-slate-500'}`}>
            <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.home}</span>
          </Link>
          
          <Link to="/referral" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/referral') ? 'text-yellow-400' : 'text-slate-500'}`}>
            <Users size={20} strokeWidth={isActive('/referral') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.referral}</span>
          </Link>

          <div className="relative -top-5">
            <div className="absolute inset-0 bg-yellow-500 rounded-full blur opacity-40"></div>
            <Link to="/" className="relative bg-gradient-to-tr from-yellow-400 to-amber-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900 text-white transform transition-transform active:scale-95">
               <span className="font-bold text-xs">{t.earn}</span>
            </Link>
          </div>

          <Link to="/tasks" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/tasks') ? 'text-yellow-400' : 'text-slate-500'}`}>
             <ClipboardList size={20} strokeWidth={isActive('/tasks') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.tasks}</span>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/profile') ? 'text-yellow-400' : 'text-slate-500'}`}>
             <User size={20} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.profile}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, User as UserIcon, Headset, Dices, ClipboardList, Bell, Mail, Send } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  children: React.ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
  telegramLink?: string;
  theme?: 'dark' | 'gold';
  hasUnreadMsg?: boolean;
  hasUnreadTx?: boolean;
}

const Layout: React.FC<Props> = ({ children, lang, setLang, telegramLink, theme = 'dark', hasUnreadMsg, hasUnreadTx }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const t = TRANSLATIONS[lang];
  const isMerchant = location.pathname.startsWith('/merchant');

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme === 'gold' ? 'theme-gold' : '';
  }, [theme]);

  if (isMerchant) {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  // Theme-based colors
  const bgClass = theme === 'gold' ? 'bg-slate-50' : 'bg-slate-900';
  const navClass = theme === 'gold' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800';
  const headerClass = theme === 'gold' ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-800';
  const textClass = theme === 'gold' ? 'text-slate-800' : 'text-slate-200';
  const iconInactive = theme === 'gold' ? 'text-slate-400' : 'text-slate-500';

  const handleCS = () => {
    alert("Opening SalesSmartly Chat...");
  };

  const handleTelegram = () => {
    if (telegramLink) window.open(telegramLink, '_blank');
    else alert("Channel link not configured");
  };

  return (
    <div className={`min-h-screen flex flex-col max-w-md mx-auto border-x shadow-2xl relative transition-colors ${theme === 'gold' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900'}`}>
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 py-3 flex justify-between items-center transition-colors ${headerClass}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 flex-shrink-0">
             <Dices size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent hidden sm:block">
            {t.appName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Telegram */}
          <button onClick={handleTelegram} className={`p-1.5 rounded-full hover:bg-slate-800/10 text-blue-400`}>
             <Send size={18} />
          </button>

          {/* Mailbox (Messages) */}
          <button onClick={() => navigate('/mailbox')} className={`p-1.5 rounded-full hover:bg-slate-800/10 relative ${textClass}`}>
             <Mail size={18} />
             {hasUnreadMsg && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>}
          </button>

          {/* Notifications (Transactions) */}
           <button onClick={() => navigate('/profile', { state: { openTransactions: true } })} className={`p-1.5 rounded-full hover:bg-slate-800/10 relative ${textClass}`}>
             <Bell size={18} />
             {hasUnreadTx && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>}
          </button>

          <button 
            onClick={handleCS}
            className={`p-1.5 rounded-full border text-yellow-500 hover:bg-slate-800/10 transition-colors ${theme === 'gold' ? 'border-slate-200 bg-slate-100' : 'bg-slate-800 border-slate-700'}`}
          >
            <Headset size={18} />
          </button>
          
          <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      <nav className={`fixed bottom-0 z-40 w-full max-w-md border-t pb-safe transition-colors ${navClass}`}>
        <div className="flex justify-between items-center px-4 py-3">
          <Link to="/" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/') ? 'text-yellow-500' : iconInactive}`}>
            <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.home}</span>
          </Link>
          
          <Link to="/referral" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/referral') ? 'text-yellow-500' : iconInactive}`}>
            <Users size={20} strokeWidth={isActive('/referral') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.referral}</span>
          </Link>

          <div className="relative -top-5">
            {/* New Coin Pop / Overflow Animation */}
            <div className="absolute inset-0 bg-yellow-500 rounded-full blur opacity-30 animate-pulse"></div>
            <Link to="/" className="btn-earn-anim bg-gradient-to-tr from-yellow-400 via-yellow-500 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-900 text-white transform transition-transform active:scale-95">
               <span className="font-bold text-xs relative z-10">{t.earn}</span>
               <div className="particle-extra"></div>
            </Link>
          </div>

          <Link to="/tasks" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/tasks') ? 'text-yellow-500' : iconInactive}`}>
             <ClipboardList size={20} strokeWidth={isActive('/tasks') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.tasks}</span>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center space-y-1 w-14 ${isActive('/profile') ? 'text-yellow-500' : iconInactive}`}>
             <UserIcon size={20} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t.profile}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
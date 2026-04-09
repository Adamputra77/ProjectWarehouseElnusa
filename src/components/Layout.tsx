import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ScanLine, 
  History, 
  LogOut, 
  Menu,
  UserCircle,
  ArrowLeftRight,
  Sun,
  Moon,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export function Layout({ children, activeTab, setActiveTab, user, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'scan', label: 'Scan Item', icon: ScanLine },
    { id: 'borrow', label: 'Borrowing', icon: ArrowLeftRight },
    { id: 'audit', label: 'Stock Opname', icon: ClipboardCheck },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-elnusa-blue to-[#004a88] text-white p-6 sticky top-0 h-screen shadow-xl z-20">
        <div className="flex items-center gap-3 mb-10 group cursor-default">
          <div className="w-12 h-12 bg-elnusa-yellow rounded-2xl flex items-center justify-center font-black text-elnusa-blue shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
            E
          </div>
          <div>
            <h1 className="font-black text-xl leading-none tracking-tighter">ELNUSA</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mt-1">Warehouse BSD</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold group",
                activeTab === item.id 
                  ? "bg-white text-elnusa-blue shadow-lg scale-[1.02]" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-elnusa-blue" : "text-white/40 group-hover:text-white"
              )} />
              {item.label}
            </button>
          ))}
          
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white mt-4"
          >
            {isDarkMode ? <Sun size={20} className="text-elnusa-yellow" /> : <Moon size={20} className="text-white/40" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-white/5 border border-white/10">
            <Avatar className="h-10 w-10 border-2 border-elnusa-yellow shadow-sm">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-elnusa-blue text-white font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate uppercase tracking-tight">{user?.displayName}</p>
              <Badge variant="outline" className={cn(
                "text-[9px] uppercase font-black px-1.5 py-0 h-4 border-none",
                user?.email === 'rrajadinadam@gmail.com' ? "bg-elnusa-yellow text-elnusa-blue" : "bg-white/20 text-white"
              )}>
                {user?.email === 'rrajadinadam@gmail.com' ? 'Admin' : 'Staff'}
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10 gap-3 font-bold text-xs uppercase tracking-wider"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout System
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gradient-to-r from-elnusa-blue to-[#004a88] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-elnusa-yellow rounded-xl flex items-center justify-center font-black text-elnusa-blue text-sm shadow-inner">
            E
          </div>
          <div>
            <h1 className="font-black text-sm leading-none tracking-tighter">ELNUSA</h1>
            <p className="text-[8px] uppercase font-bold tracking-widest opacity-60">Warehouse BSD</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu />
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-4/5 h-full bg-gradient-to-b from-elnusa-blue to-[#004a88] p-6 flex flex-col shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-elnusa-yellow rounded-2xl flex items-center justify-center font-black text-elnusa-blue shadow-lg">
                E
              </div>
              <div>
                <h1 className="font-black text-xl text-white leading-none tracking-tighter">ELNUSA</h1>
                <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest mt-1">Warehouse BSD</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all",
                    activeTab === item.id 
                      ? "bg-white text-elnusa-blue shadow-lg" 
                      : "text-white/70 hover:bg-white/10"
                  )}
                >
                  <item.icon size={22} className={activeTab === item.id ? "text-elnusa-blue" : "text-white/40"} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="pt-6 border-t border-white/10">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/60 gap-3 font-bold text-xs uppercase tracking-wider"
                onClick={onLogout}
              >
                <LogOut size={20} />
                Logout System
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

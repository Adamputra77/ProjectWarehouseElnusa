import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ScanLine, 
  History, 
  LogOut, 
  Menu,
  UserCircle,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'scan', label: 'Scan Item', icon: ScanLine },
    { id: 'borrow', label: 'Borrowing', icon: ArrowLeftRight },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-elnusa-blue text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-elnusa-yellow rounded-full flex items-center justify-center font-bold text-elnusa-blue">
            E
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">ELNUSA</h1>
            <p className="text-xs opacity-80">Warehouse BSD</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                activeTab === item.id 
                  ? "bg-white/20 text-white shadow-sm" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border-2 border-elnusa-yellow">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-white/20 text-white">
                {user?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 gap-3"
            onClick={onLogout}
          >
            <LogOut size={20} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-elnusa-blue text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-elnusa-yellow rounded-full flex items-center justify-center font-bold text-elnusa-blue text-sm">
            E
          </div>
          <h1 className="font-bold text-sm">ELNUSA BSD</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu />
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-3/4 h-full bg-elnusa-blue p-6 flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            <nav className="flex-1 space-y-2 mt-10">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                    activeTab === item.id 
                      ? "bg-white/20 text-white" 
                      : "text-white/70"
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/70 gap-3 mt-auto"
              onClick={onLogout}
            >
              <LogOut size={20} />
              Logout
            </Button>
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

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, User, Search, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        setUserData(profile);
      }
    }
    loadUser();
  }, []);

  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content Area */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Unified Sticky Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto w-full">
            {/* Left - Back Button or Mobile Menu */}
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              ) : (
                <button
                  className="md:hidden p-2 hover:bg-accent/50 rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              
              {/* Logo (Desktop) */}
              <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <img src="/dayai-logo.webp" alt="DayAI" className="w-8 h-8" />
                <span className="text-xl font-bold">DayAI</span>
              </div>
            </div>

            {/* Center - Search (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ask DayAI anything..."
                  className="w-full bg-muted/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              {/* Profile Avatar */}
              <Avatar 
                className="w-9 h-9 cursor-pointer border-2 border-primary/20 hover:border-primary/40 transition-colors" 
                onClick={() => navigate('/settings')}
              >
                <AvatarImage src={userData?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                  {userData?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

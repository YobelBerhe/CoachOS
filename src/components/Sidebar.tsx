import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Sun,
  Sunrise,
  Droplet,
  Dumbbell,
  Coffee,
  Target,
  CloudSun,
  Utensils,
  Walking,
  Users,
  Focus,
  Sunset,
  UtensilsCrossed,
  BookOpen,
  Heart,
  Moon,
  BarChart3,
  TrendingUp,
  Calendar,
  Flame,
  Award,
  Plus,
  Camera,
  FileText,
  Clock,
  Bot,
  MessageSquare,
  Lightbulb,
  LineChart,
  Settings,
  User,
  Bell,
  Palette,
  Lock,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    myDay: true,
    tracking: false,
    quickActions: false,
    ai: false,
    settings: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const timeBlocks = [
    { time: '5:00 AM', icon: Sunrise, label: 'Morning Rise', path: '/time/0500', color: 'text-orange-400' },
    { time: '6:00 AM', icon: Sun, label: 'Morning Ritual', path: '/time/0600', color: 'text-yellow-400' },
    { time: '6:30 AM', icon: Droplet, label: 'Hydration', path: '/time/0630', color: 'text-cyan-400' },
    { time: '7:00 AM', icon: Dumbbell, label: 'Movement', path: '/time/0700', color: 'text-red-400' },
    { time: '8:00 AM', icon: Coffee, label: 'Nourishment', path: '/time/0800', color: 'text-amber-400' },
    { time: '9:00 AM', icon: Target, label: 'Peak Performance', path: '/time/0900', color: 'text-blue-400' },
    { time: '10:30 AM', icon: CloudSun, label: 'Energy Break', path: '/time/1030', color: 'text-green-400' },
    { time: '12:00 PM', icon: Utensils, label: 'Refuel', path: '/time/1200', color: 'text-orange-400' },
    { time: '1:00 PM', icon: Walking, label: 'Recharge', path: '/time/1300', color: 'text-emerald-400' },
    { time: '2:00 PM', icon: Users, label: 'Collaboration', path: '/time/1400', color: 'text-purple-400' },
    { time: '3:00 PM', icon: Focus, label: 'Focus Block', path: '/time/1500', color: 'text-indigo-400' },
    { time: '6:00 PM', icon: Sunset, label: 'Wind Down', path: '/time/1800', color: 'text-pink-400' },
    { time: '7:00 PM', icon: UtensilsCrossed, label: 'Dinner Time', path: '/time/1900', color: 'text-red-400' },
    { time: '8:00 PM', icon: BookOpen, label: 'Learn & Grow', path: '/time/2000', color: 'text-blue-400' },
    { time: '9:00 PM', icon: Heart, label: 'Reflection', path: '/time/2100', color: 'text-pink-400' },
    { time: '10:00 PM', icon: Moon, label: 'Sleep Prep', path: '/time/2200', color: 'text-indigo-400' },
  ];

  const trackingItems = [
    { icon: BarChart3, label: 'Progress Dashboard', path: '/tracking/dashboard' },
    { icon: Flame, label: 'Streak Tracker', path: '/tracking/streaks' },
    { icon: Calendar, label: 'Weekly Review', path: '/tracking/weekly' },
    { icon: TrendingUp, label: 'Monthly Insights', path: '/tracking/monthly' },
    { icon: Award, label: 'Goal Progress', path: '/tracking/goals' },
  ];

  const quickActions = [
    { icon: Plus, label: 'Log Quick Entry', action: 'log-entry' },
    { icon: Camera, label: 'Add Photo', action: 'add-photo' },
    { icon: FileText, label: 'Quick Note', action: 'quick-note' },
    { icon: Clock, label: 'Start Timer', action: 'start-timer' },
    { icon: Droplet, label: 'Log Water', action: 'log-water' },
  ];

  const aiItems = [
    { icon: MessageSquare, label: 'Chat with AI Coach', path: '/ai/chat' },
    { icon: Lightbulb, label: 'Get Suggestions', path: '/ai/suggestions' },
    { icon: LineChart, label: 'Analyze Patterns', path: '/ai/analyze' },
  ];

  const settingsItems = [
    { icon: User, label: 'Profile', path: '/settings/profile' },
    { icon: Bell, label: 'Notifications', path: '/settings/notifications' },
    { icon: Palette, label: 'Appearance', path: '/settings/appearance' },
    { icon: Lock, label: 'Privacy', path: '/settings/privacy' },
    { icon: Smartphone, label: 'Integrations', path: '/settings/integrations' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Implement modals/actions here
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-black text-white border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
          <img src="/dayai-icon-64.png" alt="DayAI" className="w-8 h-8 rounded-full" />
          <span className="font-bold text-lg">DayAI</span>
        </div>
        <button 
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="p-2">
          {/* Home */}
          <button
            onClick={() => handleNavigation('/')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              location.pathname === '/' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Home</span>
          </button>

          {/* My Day Timeline */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('myDay')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition"
            >
              <span>⏰ My Day Timeline</span>
              {expandedSections.myDay ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.myDay && (
              <div className="mt-1 space-y-1">
                {timeBlocks.map((block, idx) => {
                  const Icon = block.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigation(block.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition group ${
                        location.pathname === block.path ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${block.color}`} />
                      <div className="flex-1 text-left">
                        <div className="text-xs text-gray-500">{block.time}</div>
                        <div className="text-sm text-gray-300 group-hover:text-white">{block.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tracking & Analytics */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('tracking')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition"
            >
              <span>📊 Tracking & Analytics</span>
              {expandedSections.tracking ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.tracking && (
              <div className="mt-1 space-y-1">
                {trackingItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                        location.pathname === item.path ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('quickActions')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition"
            >
              <span>✅ Quick Actions</span>
              {expandedSections.quickActions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.quickActions && (
              <div className="mt-1 space-y-1">
                {quickActions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(item.action)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Assistant */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('ai')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition"
            >
              <span>🤖 AI Assistant</span>
              {expandedSections.ai ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.ai && (
              <div className="mt-1 space-y-1">
                {aiItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                        location.pathname === item.path ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('settings')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition"
            >
              <span>⚙️ Settings</span>
              {expandedSections.settings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.settings && (
              <div className="mt-1 space-y-1">
                {settingsItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                        location.pathname === item.path ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Upgrade Button */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => handleNavigation('/pricing')}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition"
        >
          ✨ Upgrade to Pro
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen fixed left-0 top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 w-80 h-screen z-50 md:hidden animate-slide-in">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sunrise, Moon, Target, Dumbbell, Coffee, Brain, 
  Droplet, Heart, Activity, BookOpen, BedDouble,
  Apple, Smartphone, ArrowRight, Check, Star, Clock, Zap,
  Pill, NotebookPen, CircleDot, Footprints, RotateCcw, Users, Utensils,
  PhoneOff, FileText, X, Menu
} from 'lucide-react';
import appStoreBadge from '@/assets/app-store-badge.svg';
import googlePlayBadge from '@/assets/google-play-badge.png';
import ratedBadge from '@/assets/rated-badge.png';
import dayaiLogo from '@/assets/dayai-icon.png';
import businessInsider from '@/assets/logos/business-insider.svg';
import forbes from '@/assets/logos/forbes.svg';
import logitech from '@/assets/logos/logitech.svg';
import techcrunch from '@/assets/logos/techcrunch.svg';
import tiktok from '@/assets/logos/tiktok.svg';
import meta from '@/assets/logos/meta.svg';

const dailyTools = [
  { 
    icon: Sunrise,
    time: '5:00 AM',
    title: 'Morning Optimization', 
    description: 'Wake with intention. AI-powered routines that adapt to your energy. 90% of executives win before 9 AM.', 
    gradient: 'from-orange-500 to-pink-500'
  },
  { 
    icon: PhoneOff,
    time: '5:30 AM',
    title: 'No Phone for First Hour', 
    description: 'Checking phone first thing spikes cortisol 23% (UCI Study). Morning screen time linked to higher anxiety (Journal of Behavioral Addictions).', 
    gradient: 'from-slate-500 to-gray-600'
  },
  { 
    icon: Droplet,
    time: '6:00 AM',
    title: 'Hydration Tracking', 
    description: '16-20oz water upon waking improves cognition by 14%. Your brain is 73% water—fuel it first.', 
    gradient: 'from-cyan-500 to-blue-500'
  },
  { 
    icon: Dumbbell,
    time: '6:30 AM',
    title: 'Morning Exercise', 
    description: 'Morning workouts have 50% better adherence. Exercise before breakfast burns 20% more fat.', 
    gradient: 'from-red-500 to-orange-500'
  },
  { 
    icon: Brain,
    time: '7:00 AM',
    title: 'Meditation & Mindfulness', 
    description: '10 minutes daily increases focus by 11%. Ray Dalio: 20min 2x/day for 40+ years.', 
    gradient: 'from-purple-500 to-indigo-600'
  },
  { 
    icon: NotebookPen,
    time: '7:30 AM',
    title: 'Morning Pages', 
    description: 'Stream of consciousness journaling. Improves working memory by 13%. Tim Ferriss: 3 pages daily.', 
    gradient: 'from-orange-500 to-amber-500'
  },
  { 
    icon: Coffee,
    time: '8:00 AM',
    title: 'Nutritious Breakfast', 
    description: 'High-protein breakfast = 135 fewer calories later. Breakfast eaters earn $5k+ more annually.', 
    gradient: 'from-amber-500 to-orange-500'
  },
  { 
    icon: CircleDot,
    time: '9:00 AM',
    title: 'Eat the Frog First', 
    description: 'Tackle hardest task when willpower is highest. Peak performance 2-4 hours after waking.', 
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: Target,
    time: '9:00 AM - 12:00 PM',
    title: 'Deep Work Blocks', 
    description: 'Uninterrupted 90-min focus sessions. Single-tasking is 40% more productive than multitasking.', 
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    icon: Footprints,
    time: '12:00 PM',
    title: 'Lunch Away from Desk', 
    description: 'Walking lunch increases creative ideas by 30%. Steve Jobs: Famous walking meetings.', 
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    icon: Users,
    time: '1:00 PM',
    title: 'Social Connection', 
    description: 'Loneliness as deadly as smoking 15 cigarettes/day (Harvard Study, 80 years). Strong relationships = #1 predictor of happiness (Harvard Grant Study). 15 minutes social interaction = productivity boost (MIT).', 
    gradient: 'from-pink-500 to-purple-500'
  },
  { 
    icon: RotateCcw,
    time: '2:00 PM',
    title: 'Power Nap', 
    description: '20-min nap = 34% performance boost. Churchill, LeBron, Jeff Bezos all nap strategically.', 
    gradient: 'from-teal-500 to-cyan-500'
  },
  { 
    icon: Users,
    time: '3:00 PM',
    title: 'Meetings & Collaboration', 
    description: 'Best meeting time: 2:30-3 PM. Stand-up meetings 34% shorter with same effectiveness.', 
    gradient: 'from-green-500 to-emerald-600'
  },
  { 
    icon: FileText,
    time: '5:00 PM',
    title: 'Admin & Shallow Work', 
    description: 'Email checking = 3 hours lost daily (McKinsey). Batch processing = 40% time savings (MIT).', 
    gradient: 'from-yellow-500 to-amber-500'
  },
  { 
    icon: Utensils,
    time: '6:00 PM',
    title: 'Mindful Dinner', 
    description: 'Quality family time reduces burnout. Obama: Family dinner at 6:30 PM when possible.', 
    gradient: 'from-orange-500 to-amber-600'
  },
  { 
    icon: BookOpen,
    time: '7:00 PM',
    title: 'Learning Time', 
    description: '30 min/day = 23 books/year. Warren Buffett: 500 pages daily. Leaders are readers.', 
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    icon: Moon,
    time: '9:00 PM',
    title: 'Evening Reflection', 
    description: 'Reflection increases performance by 23%. Ben Franklin, Oprah, Ray Dalio: Daily reflection.', 
    gradient: 'from-purple-500 to-indigo-600'
  },
  { 
    icon: Heart,
    time: '9:30 PM',
    title: 'Gratitude Practice', 
    description: 'Daily gratitude increases happiness by 25%. Oprah: Gratitude journal before bed.', 
    gradient: 'from-pink-500 to-rose-500'
  },
  { 
    icon: BedDouble,
    time: '10:00 PM',
    title: 'Sleep Optimization', 
    description: '7-8 hours = ultimate performance enhancer. Jeff Bezos: 8 hours = better decisions.', 
    gradient: 'from-purple-500 to-violet-600'
  },
];

const appLogos = [
  { name: 'Notion', logo: 'https://logo.clearbit.com/notion.so' },
  { name: 'Todoist', logo: 'https://logo.clearbit.com/todoist.com' },
  { name: 'Trello', logo: 'https://logo.clearbit.com/trello.com' },
  { name: 'Asana', logo: 'https://logo.clearbit.com/asana.com' },
  { name: 'MyFitnessPal', logo: 'https://logo.clearbit.com/myfitnesspal.com' },
  { name: 'Lose It!', logo: 'https://logo.clearbit.com/loseit.com' },
  { name: 'Noom', logo: 'https://logo.clearbit.com/noom.com' },
  { name: 'Strava', logo: 'https://logo.clearbit.com/strava.com' },
  { name: 'Fitbit', logo: 'https://logo.clearbit.com/fitbit.com' },
  { name: 'Peloton', logo: 'https://logo.clearbit.com/onepeloton.com' },
  { name: 'Nike', logo: 'https://logo.clearbit.com/nike.com' },
  { name: 'Headspace', logo: 'https://logo.clearbit.com/headspace.com' },
  { name: 'Calm', logo: 'https://logo.clearbit.com/calm.com' },
  { name: 'Sleep Cycle', logo: 'https://logo.clearbit.com/sleepcycle.com' },
  { name: 'Oura', logo: 'https://logo.clearbit.com/ouraring.com' },
  { name: 'RescueTime', logo: 'https://logo.clearbit.com/rescuetime.com' },
  { name: 'Forest', logo: 'https://logo.clearbit.com/forestapp.cc' },
  { name: 'Habitica', logo: 'https://logo.clearbit.com/habitica.com' },
];

const testimonials = [
  {
    text: "I was drowning in productivity apps... Todoist, MyFitnessPal, Headspace, Sleep Cycle - spending $80+ monthly! Found DayAI and everything clicked. One dashboard, AI insights, and I actually stick to my routines now. Lost 8 lbs, sleeping 7.5 hours consistently. Best decision ever 🙌",
    author: "Sarah Chen",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
  },
  {
    text: "Can't believe I used to juggle 7 different apps before this. The AI coaching is a game changer - it learns when I'm most productive and schedules my day accordingly. My 15-day streak turned into 90 days. This isn't just an app, it's a lifestyle upgrade.",
    author: "Marcus Johnson",
    role: "Entrepreneur",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    text: "Started using DayAI for basic habit tracking but now I'm hooked! The evening reflection helped me realize I was working 60+ hours with zero ROI. Now I work 45 hours with 2x output. Plus the meal tracking with barcode scanner? Chef's kiss 👌",
    author: "Emily Rodriguez",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
  },
  {
    text: "ngl was skeptical at first... another productivity app? 🙄 But this is different. The AI actually understands my patterns. It told me I'm most creative at 3 PM (I thought it was mornings!). Restructured my day and doubled my output. Mind. Blown.",
    author: "David Kim",
    role: "Marketing Director",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
  },
  {
    text: "This platform is exactly what my clients needed! Used to recommend 5 different apps for sleep, nutrition, workouts, habits. Now it's just DayAI. The workout logger + meal tracking integration is seamless. My clients are seeing 3x better results 💪",
    author: "Lisa Martinez",
    role: "Fitness Coach",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400"
  },
  {
    text: "This tool is a lifesaver for our leadership team! We were all using different systems. Switched everyone to DayAI last quarter - productivity up 40%, burnout down 60%. The AI insights in evening reflection are pure gold 🌟",
    author: "Amanda Williams",
    role: "Startup COO",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
  },
];

const userAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100",
];

export default function Landing() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 30, seconds: 35 });
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Flash Sale Banner */}
      {showBanner && (
        <div className="bg-red-600 py-3 px-4 text-center text-sm font-medium relative text-white">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span>⏰ LIMITED TIME: START FREE FOREVER</span>
            <span className="line-through opacity-75">$49</span>
            <span className="font-bold">$0/month</span>
            <span>{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 rounded p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={dayaiLogo} alt="DayAI" className="w-12 h-12 md:w-10 md:h-10" />
            <span className="font-bold text-lg hidden md:block">DayAI</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-700 hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-700 hover:text-gray-900">Pricing</a>
            <a href="#affiliate" className="text-sm text-gray-700 hover:text-gray-900">Affiliate 💸</a>
            <button 
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Sign in
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Get started for free
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-sm text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-sm text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#affiliate" 
                className="text-sm text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Affiliate 💸
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <img src={ratedBadge} alt="#1 All-in-One AI Platform" className="h-16 mx-auto" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gray-900">
          Every Tool You Need<br />
          for Your Perfect Day.
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master sleep, productivity, fitness, nutrition, and mindfulness—all in one intelligent platform.
        </p>

        <button 
          onClick={() => navigate('/auth')}
          className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition my-8"
        >
          Get started for free
        </button>

        <div className="flex justify-center gap-4 mb-8">
          <a href="#" className="hover:opacity-80 transition">
            <img src={appStoreBadge} alt="Download on the App Store" className="h-10" />
          </a>
          <a href="#" className="hover:opacity-80 transition">
            <img src={googlePlayBadge} alt="Get it on Google Play" className="h-10" />
          </a>
        </div>

        {/* Overlapping Avatars */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex -space-x-3">
            {userAvatars.map((avatar, idx) => (
              <img 
                key={idx}
                src={avatar}
                alt={`User ${idx + 1}`}
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
              />
            ))}
          </div>
          <span className="font-medium text-gray-900">2.1M+ users optimizing daily</span>
          <span>❤️</span>
        </div>
      </section>

      {/* Scrolling Apps Carousel */}
      <section className="overflow-hidden py-8 border-y border-gray-200">
        <div className="flex gap-8 animate-scroll">
          {[...appLogos, ...appLogos].map((app, idx) => (
            <div key={idx} className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-full border border-gray-200 whitespace-nowrap">
              <div className="w-6 h-6 relative flex-shrink-0">
                <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-medium text-gray-900">{app.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tool Suite Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
          A Tool Suite for Pros and Beginners Alike
        </h2>
        <p className="text-center text-gray-600 mb-12">
          DayAI powers millions of high-performers, entrepreneurs, and everyday people.
        </p>

        {/* Brand Logos Carousel */}
        <div className="overflow-hidden mb-20 relative">
          <div className="flex gap-12 items-center animate-scroll">
            {[businessInsider, forbes, logitech, techcrunch, tiktok, meta, businessInsider, forbes, logitech, techcrunch, tiktok, meta].map((logo, idx) => (
              <div key={idx} className="flex-shrink-0 h-10 opacity-40 hover:opacity-60 transition-opacity">
                <img src={logo} alt="Company Logo" className="h-full w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid with Icons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dailyTools.map((tool, idx) => {
            const IconComponent = tool.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:scale-105 transition-transform duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                  <IconComponent className="w-7 h-7 text-white stroke-[2.5]" />
                </div>
                <div className="text-xs font-medium text-gray-500 mb-2">{tool.time}</div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{tool.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Comparison with Receipt Design */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
          Cut Your Unproductive Hours by 97%
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Why juggle 20+ apps when you can optimize your entire day in one place?
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without DayAI - Receipt Style */}
          <div className="bg-white text-black rounded-2xl p-8 relative shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-300">
            <div className="absolute -top-3 left-8 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold">
              WITHOUT DAYAI
            </div>
            <div className="text-center mb-6 border-b-2 border-dashed border-black/20 pb-4">
              <div className="text-2xl font-bold mb-2">📱 PRODUCTIVITY APPS</div>
              <div className="text-sm text-gray-600">Monthly Subscription Receipt</div>
              <div className="text-xs text-gray-500">Oct 13, 2025 11:29 AM</div>
            </div>
            <div className="mb-4">
              <div className="text-xs font-bold mb-3 text-gray-600">ITEMS PURCHASED:</div>
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {[
                  { name: '⏰ Todoist Premium', price: '$10.00' },
                  { name: '📝 Notion Pro', price: '$10.00' },
                  { name: '🥗 MyFitnessPal Premium', price: '$10.00' },
                  { name: '🧘 Headspace', price: '$13.00' },
                  { name: '😴 Sleep Cycle Premium', price: '$10.00' },
                  { name: '🏃 Strava Premium', price: '$12.00' },
                  { name: '☮️ Calm Premium', price: '$15.00' },
                  { name: '⏱️ RescueTime Premium', price: '$12.00' },
                  { name: '⏲️ Toggl Track', price: '$9.00' },
                  { name: '🌲 Forest Premium', price: '$4.00' },
                  { name: '🎮 Habitica', price: '$5.00' },
                  { name: '💍 Oura Membership', price: '$6.00' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-dashed border-black/10 pb-1">
                    <span>{item.name}</span>
                    <span className="font-mono">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t-2 border-dashed border-black/30 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-mono">$116.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Fees:</span>
                <span className="font-mono">$4.00</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-red-600 pt-2 border-t border-black/20">
                <span>TOTAL DUE:</span>
                <span className="font-mono">$120.00/mo</span>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                😰 Plus time wasted switching between apps
              </div>
            </div>
          </div>

          {/* With DayAI - Receipt Style */}
          <div className="bg-white text-black rounded-2xl p-8 relative shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-300 border-4 border-green-500">
            <div className="absolute -top-3 left-8 bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              ✨ WITH DAYAI
            </div>
            <div className="text-center mb-6 border-b-2 border-dashed border-black/20 pb-4">
              <div className="text-2xl font-bold mb-2">🚀 DAYAI ALL-IN-ONE</div>
              <div className="text-sm text-gray-600">Complete Daily Optimization</div>
              <div className="text-xs text-gray-500">Oct 13, 2025 11:29 AM</div>
            </div>
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-3 mb-4 text-center">
              <span className="text-green-700 font-bold text-sm">✓ BULK DEAL APPLIED ✓</span>
              <div className="text-xs text-gray-600 mt-1">ALL FEATURES INCLUDED:</div>
            </div>
            <div className="mb-4">
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {[
                  { name: '☀️ Morning Optimization', price: '$10.00' },
                  { name: '😴 Sleep Tracking', price: '$10.00' },
                  { name: '✅ Task Management', price: '$10.00' },
                  { name: '💪 Fitness Logger', price: '$10.00' },
                  { name: '🥑 Meal Tracker', price: '$10.00' },
                  { name: '🧘 Meditation Timer', price: '$13.00' },
                  { name: '🎯 Habit Tracking', price: '$12.00' },
                  { name: '⚡ Energy Analytics', price: '$10.00' },
                  { name: '📊 Progress Dashboard', price: '$9.00' },
                  { name: '🤖 AI Coach', price: '$15.00' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-dashed border-black/10 pb-1 text-gray-500">
                    <span>✓ {item.name}</span>
                    <span className="line-through font-mono">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="text-center text-green-600 font-bold my-3 text-sm">
                + 15 MORE PREMIUM FEATURES
              </div>
            </div>
            <div className="border-t-2 border-dashed border-black/30 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Retail Value:</span>
                <span className="line-through font-mono">$120.00</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-bold">
                <span>🎉 Optimization Discount:</span>
                <span className="font-mono">-$120.00</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-green-600 pt-2 border-t border-black/20">
                <span>YOU PAY:</span>
                <span className="font-mono">$0.00/mo</span>
              </div>
              <div className="text-center text-green-600 font-bold text-sm mt-2 bg-green-100 rounded-lg py-2">
                🎊 YOU SAVED $120.00/MONTH! 🎊
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                ✨ Free forever. No credit card required.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold mb-2 text-gray-900">💡 How is free forever even possible?</h3>
          <p className="text-sm text-gray-700">
            We believe everyone deserves to optimize their day. DayAI is free forever with optional premium features. No tricks, no trials—just pure daily optimization for everyone.
          </p>
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/auth')}
            className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition flex items-center gap-2 mx-auto text-lg"
          >
            ✂️ Start Optimizing Your Day Free ✂️
          </button>
        </div>
      </section>

      {/* Dead Simple Section - 3 Steps */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
          Dead Simple. No Tutorials Needed.
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Skip dry tutorials and get right into optimizing your day. Even if you've never used productivity tools before.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {[
            {
              step: '01',
              icon: '👤',
              title: 'Create Your Profile',
              description: 'Tell us about your goals and daily routine. Takes less than 2 minutes.'
            },
            {
              step: '02',
              icon: '🤖',
              title: 'AI Learns Your Patterns',
              description: 'Our AI analyzes your habits and creates a personalized optimization plan.'
            },
            {
              step: '03',
              icon: '🚀',
              title: 'Start Winning Your Days',
              description: 'Follow AI-powered insights and watch your productivity soar.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center hover:bg-gray-100 transition">
              <div className="text-6xl font-bold text-gray-300 mb-4">{item.step}</div>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate('/auth')}
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            ⚡ Start Optimizing in Under 60 Seconds
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
          Trusted by 2.1M+ Professionals Worldwide
        </h2>
        <p className="text-center text-gray-600 mb-12">
          See why smart people are switching to DayAI
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:bg-gray-100 transition">
              <p className="text-sm text-gray-700 mb-6">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                />
                <div>
                  <div className="font-bold text-sm text-gray-900">{testimonial.author}</div>
                  <div className="text-xs text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* A Simpler Solution */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
          A Simpler Solution 💡
        </h2>
        <p className="text-center text-gray-600 mb-8">
          No more paying for 20+ different apps! DayAI brings it all home.
        </p>

        {/* User Avatars */}
        <div className="flex justify-center items-center mb-4">
          <div className="flex -space-x-3">
            {userAvatars.map((avatar, idx) => (
              <img 
                key={idx}
                src={avatar}
                alt={`User ${idx + 1}`}
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
        </div>
        <p className="text-center text-gray-900 font-medium mb-12">
          Join 2.1M+ happy users ❤️
        </p>

        {/* App Logos Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-5xl mx-auto mb-12">
          {appLogos.map((app, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center p-2.5 hover:bg-gray-100 hover:scale-105 transition-all">
                <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-xs text-center text-gray-600 group-hover:text-gray-900 transition">{app.name}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            All these features. <span className="font-bold text-gray-900">One simple platform.</span> <span className="font-bold text-green-500">$0/month forever.</span>
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Start optimizing your day free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src={dayaiLogo} alt="DayAI" className="w-8 h-8" />
                <span className="font-bold text-gray-900">DayAI</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">The Most Powerful Daily Optimization Platform on the Planet</p>
              <div className="flex gap-4">
                <a href="#" className="hover:opacity-80 transition">
                  <img src={appStoreBadge} alt="Download on the App Store" className="h-8" />
                </a>
                <a href="#" className="hover:opacity-80 transition">
                  <img src={googlePlayBadge} alt="Get it on Google Play" className="h-8" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm text-gray-900">POPULAR FEATURES</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Morning Optimization</a></li>
                <li><a href="#" className="hover:text-gray-900">Sleep Tracking</a></li>
                <li><a href="#" className="hover:text-gray-900">Workout Logger</a></li>
                <li><a href="#" className="hover:text-gray-900">Meal Tracker</a></li>
                <li><a href="#" className="hover:text-gray-900">AI Coach</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm text-gray-900">MORE TOOLS</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Habit Tracking</a></li>
                <li><a href="#" className="hover:text-gray-900">Meditation Timer</a></li>
                <li><a href="#" className="hover:text-gray-900">Energy Analytics</a></li>
                <li><a href="#" className="hover:text-gray-900">Deep Work</a></li>
                <li><a href="#" className="hover:text-gray-900">Gratitude Journal</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm text-gray-900">COMPANY</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8">
            <div className="flex justify-center gap-3 mb-6">
              <a href="https://x.com/Dayai_io" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/DayAI.io/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/dayai.io/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@dayai.io" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
            <div className="text-center text-sm text-gray-600">
              © 2025 DayAI Inc. All rights reserved. Built for intentional living.
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

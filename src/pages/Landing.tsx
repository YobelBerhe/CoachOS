import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sunrise, Moon, Target, Dumbbell, Coffee, Brain, 
  Droplet, Heart, Activity, BookOpen, BedDouble,
  Apple, Smartphone, ArrowRight, Check, Star, Clock, Zap
} from 'lucide-react';

const dailyTools = [
  { 
    icon: 'https://cdn-icons-png.flaticon.com/512/3209/3209265.png',
    title: 'Morning Optimization', 
    description: 'Wake with intention. AI-powered routines that adapt to your energy. 90% of executives win before 9 AM.', 
    gradient: 'from-orange-500/20 to-pink-500/20'
  },
  { 
    icon: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
    title: 'Sleep Tracking', 
    description: '7-8 hours tracked and optimized. Sleep is the ultimate performance enhancer, not a luxury.', 
    gradient: 'from-indigo-500/20 to-purple-500/20'
  },
  { 
    icon: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png',
    title: 'Intelligent Fitness', 
    description: 'Exercise when your body is primed. Morning workouts have 50% better adherence.', 
    gradient: 'from-red-500/20 to-orange-500/20'
  },
  { 
    icon: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
    title: 'Nutrition Optimization', 
    description: 'Smart meal tracking with AI insights. High-protein breakfast = 135 fewer calories later.', 
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  { 
    icon: 'https://cdn-icons-png.flaticon.com/512/2920/2920349.png',
    title: 'Meditation & Mindfulness', 
    description: '10 minutes daily increases focus by 11% and reduces stress by 22% in 8 weeks.', 
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  { 
    icon: 'https://cdn-icons-png.flaticon.com/512/3874/3874845.png',
    title: 'Evening Reflection', 
    description: 'Close with gratitude. Reflection increases performance by 23%. Build your best self.', 
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
];

const appLogos = [
  { name: 'Notion', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
  { name: 'Todoist', logo: 'https://cdn.worldvectorlogo.com/logos/todoist.svg' },
  { name: 'MyFitnessPal', logo: 'https://cdn.worldvectorlogo.com/logos/myfitnesspal.svg' },
  { name: 'Headspace', logo: 'https://cdn.worldvectorlogo.com/logos/headspace.svg' },
  { name: 'Calm', logo: 'https://cdn.worldvectorlogo.com/logos/calm.svg' },
  { name: 'Sleep Cycle', logo: 'https://sleepcycle.com/wp-content/themes/sleepcycle/assets/images/sc-icon.png' },
  { name: 'Strava', logo: 'https://cdn.worldvectorlogo.com/logos/strava-1.svg' },
  { name: 'Oura', logo: 'https://ouraring.com/blog/content/images/size/w256h256/2023/06/Oura_O_Icon_Gold_RGB.png' },
  { name: 'RescueTime', logo: 'https://www.rescuetime.com/images/rescuetime-icon.png' },
  { name: 'Forest', logo: 'https://forestapp.cc/images/logo.png' },
  { name: 'Habitica', logo: 'https://habitica.com/static/img/favicon.ico' },
  { name: 'Streaks', logo: 'https://streaksapp.com/icon.png' },
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
      <div className="bg-red-600 py-3 px-4 text-center text-sm font-medium relative text-white">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>⏰ LIMITED TIME: START FREE FOREVER</span>
          <span className="line-through opacity-75">$49</span>
          <span className="font-bold">$0/month</span>
          <span>{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/dayai-icon-64.png" alt="DayAI" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-lg">DayAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-700 hover:text-gray-900">Pricing</a>
            <a href="#testimonials" className="text-sm text-gray-700 hover:text-gray-900">Reviews</a>
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            <span className="text-sm text-gray-900">Rated #1 Daily Optimization Platform</span>
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          </div>
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
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white">
              <Apple className="w-6 h-6" />
              <div className="text-left text-xs">
                <div>Download on the</div>
                <div className="font-semibold">App Store</div>
              </div>
            </div>
          </a>
          <a href="#" className="hover:opacity-80 transition">
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white">
              <Smartphone className="w-6 h-6" />
              <div className="text-left text-xs">
                <div>GET IT ON</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </div>
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

        {/* Brand Logos Placeholder */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-20 opacity-40">
          {['Forbes', 'TechCrunch', 'Business Insider', 'ProductHunt', 'Wired', 'The Verge'].map((brand) => (
            <div key={brand} className="text-2xl font-bold text-gray-400">{brand}</div>
          ))}
        </div>

        {/* Feature Grid with Icons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dailyTools.map((tool, idx) => (
            <div 
              key={idx} 
              className={`bg-gradient-to-br ${tool.gradient} backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:scale-105 transition-transform duration-300 cursor-pointer`}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <img src={tool.icon} alt={tool.title} className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{tool.title}</h3>
              <p className="text-sm text-gray-700">{tool.description}</p>
            </div>
          ))}
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
            className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition inline-flex items-center gap-2"
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
        <p className="text-center text-gray-600 mb-12">
          No more paying for 20+ different apps! DayAI brings it all home.
        </p>

        {/* App Logos Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 max-w-5xl mx-auto mb-12">
          {appLogos.map((app, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center p-3 hover:bg-gray-100 hover:scale-110 transition-all">
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
            className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Get started for free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/dayai-icon-64.png" alt="DayAI" className="w-8 h-8 rounded-full" />
                <span className="font-bold text-gray-900">DayAI</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">The Most Powerful Daily Optimization Platform on the Planet</p>
              <div className="flex gap-4">
                <a href="#" className="hover:opacity-80 transition">
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
                    <Apple className="w-4 h-4" />
                    <div>App Store</div>
                  </div>
                </a>
                <a href="#" className="hover:opacity-80 transition">
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
                    <Smartphone className="w-4 h-4" />
                    <div>Google Play</div>
                  </div>
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
            <div className="flex justify-center gap-6 mb-6">
              {[
                'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
                'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                '23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
                'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
              ].map((path, idx) => (
                <a key={idx} href="#" className="text-gray-500 hover:text-gray-900 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
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

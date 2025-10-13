import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BRAND } from '@/lib/constants';
import {
  ArrowRight,
  Target,
  Moon,
  Activity,
  TrendingUp,
  Users,
  Menu,
  X,
  Sunrise,
  BookOpen,
  Dumbbell,
  Coffee,
  Heart,
  Zap,
  Brain,
  Droplet,
  NotebookPen,
  Smartphone,
  Footprints,
  RefreshCw,
  Utensils,
  BedDouble,
  Apple,
  Check,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const chronologicalFeatures = [
    {
      time: '5:00 AM',
      icon: Sunrise,
      title: 'Morning Optimization',
      description: 'Wake with intention. AI-powered routines that adapt to your energy. 90% of executives win before 9 AM.',
      gradient: 'from-orange-400 to-pink-500',
      iconColor: 'text-white'
    },
    {
      time: '6:00 AM',
      icon: Droplet,
      title: 'Hydration Tracking',
      description: '16-20oz water upon waking improves cognition by 14%. Your brain is 73% water—fuel it first.',
      gradient: 'from-cyan-400 to-blue-500',
      iconColor: 'text-white'
    },
    {
      time: '6:30 AM',
      icon: Dumbbell,
      title: 'Morning Exercise',
      description: 'Morning workouts have 50% better adherence. Exercise before breakfast burns 20% more fat.',
      gradient: 'from-red-500 to-orange-400',
      iconColor: 'text-white'
    },
    {
      time: '7:00 AM',
      icon: Brain,
      title: 'Meditation & Mindfulness',
      description: '10 minutes daily increases focus by 11%. Ray Dalio: 20min 2x/day for 40+ years.',
      gradient: 'from-purple-500 to-indigo-500',
      iconColor: 'text-white'
    },
    {
      time: '7:30 AM',
      icon: NotebookPen,
      title: 'Morning Pages',
      description: 'Stream of consciousness journaling. Improves working memory by 13%. Tim Ferriss: 3 pages daily.',
      gradient: 'from-yellow-400 to-orange-500',
      iconColor: 'text-white'
    },
    {
      time: '8:00 AM',
      icon: Coffee,
      title: 'Nutritious Breakfast',
      description: 'High-protein breakfast = 135 fewer calories later. Breakfast eaters earn $5K+ more annually.',
      gradient: 'from-amber-500 to-yellow-400',
      iconColor: 'text-white'
    },
    {
      time: '9:00 AM',
      icon: Target,
      title: 'Eat the Frog First',
      description: 'Tackle hardest task when willpower is highest. Peak performance 2-4 hours after waking.',
      gradient: 'from-blue-500 to-cyan-400',
      iconColor: 'text-white'
    },
    {
      time: '9:00 AM - 12:00 PM',
      icon: Target,
      title: 'Deep Work Blocks',
      description: 'Uninterrupted 90-min focus sessions. Single-tasking is 40% more productive than multitasking.',
      gradient: 'from-blue-600 to-indigo-500',
      iconColor: 'text-white'
    },
    {
      time: '12:00 PM',
      icon: Footprints,
      title: 'Lunch Away from Desk',
      description: 'Walking lunch increases creative ideas by 30%. Steve Jobs: Famous walking meetings.',
      gradient: 'from-green-400 to-emerald-500',
      iconColor: 'text-white'
    },
    {
      time: '2:00 PM',
      icon: RefreshCw,
      title: 'Power Nap',
      description: '20-min nap = 34% performance boost. Churchill, LeBron, Jeff Bezos all nap strategically.',
      gradient: 'from-teal-400 to-cyan-500',
      iconColor: 'text-white'
    },
    {
      time: '3:00 PM',
      icon: Users,
      title: 'Meetings & Collaboration',
      description: 'Best meeting time: 2:30-3 PM. Stand-up meetings 34% shorter with same effectiveness.',
      gradient: 'from-green-500 to-teal-500',
      iconColor: 'text-white'
    },
    {
      time: '6:00 PM',
      icon: Utensils,
      title: 'Mindful Dinner',
      description: 'Quality family time reduces burnout. Obama: Family dinner at 6:30 PM when possible.',
      gradient: 'from-orange-400 to-amber-500',
      iconColor: 'text-white'
    },
    {
      time: '7:00 PM',
      icon: BookOpen,
      title: 'Learning Time',
      description: '30 min/day = 23 books/year. Warren Buffett: 500 pages daily. Leaders are readers.',
      gradient: 'from-blue-500 to-indigo-600',
      iconColor: 'text-white'
    },
    {
      time: '9:00 PM',
      icon: Moon,
      title: 'Evening Reflection',
      description: 'Reflection increases performance by 23%. Ben Franklin, Oprah, Ray Dalio: Daily reflection.',
      gradient: 'from-indigo-500 to-purple-500',
      iconColor: 'text-white'
    },
    {
      time: '9:30 PM',
      icon: Heart,
      title: 'Gratitude Practice',
      description: 'Daily gratitude increases happiness by 25%. Oprah: Gratitude journal before bed.',
      gradient: 'from-pink-400 to-rose-500',
      iconColor: 'text-white'
    },
    {
      time: '10:00 PM',
      icon: BedDouble,
      title: 'Sleep Optimization',
      description: '7-8 hours = ultimate performance enhancer. Jeff Bezos: 8 hours = better decisions.',
      gradient: 'from-purple-500 to-pink-500',
      iconColor: 'text-white'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager at Tech Startup',
      quote: 'I was drowning in productivity apps... Todoist, MyFitnessPal, Headspace, Sleep Cycle - spending $80+ monthly! Found DayAI and everything clicked. One dashboard, AI insights, and I actually stick to my routines now. Lost 8 lbs, sleeping 7.5 hours consistently. Best decision ever 🙌',
      avatar: 'SC'
    },
    {
      name: 'Marcus Johnson',
      role: 'Entrepreneur & Founder',
      quote: 'Can\'t believe I used to juggle 7 different apps before this. The AI coaching is a game changer - it learns when I\'m most productive and schedules my day accordingly. My 15-day streak turned into 90 days. This isn\'t just an app, it\'s a lifestyle upgrade.',
      avatar: 'MJ'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Software Engineer',
      quote: 'Started using DayAI for basic habit tracking but now I\'m hooked! The evening reflection helped me realize I was working 60+ hours with zero ROI. Now I work 45 hours with 2x output. Plus the meal tracking with barcode scanner? Chef\'s kiss 👌',
      avatar: 'ER'
    },
    {
      name: 'David Kim',
      role: 'Marketing Director',
      quote: 'ngl was skeptical at first... another productivity app? 🙄 But this is different. The AI actually understands my patterns. It told me I\'m most creative at 3 PM (I thought it was mornings!). Restructured my day and doubled my output. Mind. Blown.',
      avatar: 'DK'
    },
    {
      name: 'Lisa Martinez',
      role: 'Fitness Coach',
      quote: 'This platform is exactly what my clients needed! Used to recommend 5 different apps for sleep, nutrition, workouts, habits. Now it\'s just DayAI. The workout logger + meal tracking integration is seamless. My clients are seeing 3x better results 💪',
      avatar: 'LM'
    },
    {
      name: 'Thomas Chen',
      role: 'Medical Resident',
      quote: 'Just tried the sleep optimization feature and I\'m genuinely shocked. As a resident working 80-hour weeks, sleep was my biggest challenge. DayAI\'s AI figured out my optimal sleep schedule. Went from 5.5 hours to 7 hours without changing my schedule. How?!',
      avatar: 'TC'
    },
    {
      name: 'Amanda Williams',
      role: 'Startup COO',
      quote: 'This tool is a lifesaver for our leadership team! We were all using different systems. Switched everyone to DayAI last quarter - productivity up 40%, burnout down 60%. The AI insights in evening reflection are pure gold 🌟',
      avatar: 'AW'
    },
    {
      name: 'Priya Patel',
      role: 'Content Creator',
      quote: 'The interface is so intuitive! No more copy-pasting between different apps or losing streaks. Everything syncs. Morning pages flow into daily tasks, workouts connect to nutrition, sleep quality informs tomorrow\'s energy. It just works seamlessly 🎯',
      avatar: 'PP'
    },
    {
      name: 'Kevin Patterson',
      role: 'Finance Executive',
      quote: 'I don\'t usually write reviews but had to share - DayAI literally transformed how I live. I was "successful" but exhausted. The AI helped me cut 15 hours of busywork weekly. Now I\'m home for dinner, reading 2 books/month, and still outperforming. This is the way.',
      avatar: 'KP'
    }
  ];

  const allFeatures = [
    'Morning Journal', 'Task Management', 'Sleep Tracker', 'Workout Logger',
    'Meal Planner', 'Food Diary', 'Barcode Scanner', 'Habit Tracker',
    'Meditation Timer', 'Gratitude Journal', 'Evening Reflection', 'AI Coach',
    'Energy Analytics', 'Productivity Insights', 'Goal Setting', 'Progress Dashboard',
    'Smart Reminders', 'Weekly Reviews', 'Monthly Reports', 'Streak Tracking',
    'Social Accountability', 'Custom Routines', 'Time Blocking', 'Focus Modes',
    'Break Reminders', 'Hydration Tracking', 'Mood Logging', 'Life Balance Score'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/dayai-icon-64.png" alt="DayAI" className="w-8 h-8" />
              <span className="text-xl font-semibold text-gray-900">{BRAND.name}</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#comparison" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Why DayAI</a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-sm">Sign In</Button>
              <Button onClick={() => navigate('/auth')} className="bg-black hover:bg-gray-800 text-white text-sm rounded-full px-6">
                Get started for free
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <a href="#features" className="block py-2 text-sm text-gray-600">Features</a>
              <a href="#comparison" className="block py-2 text-sm text-gray-600">Why DayAI</a>
              <a href="#testimonials" className="block py-2 text-sm text-gray-600">Reviews</a>
              <div className="pt-3 space-y-2">
                <Button variant="outline" className="w-full rounded-full" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button className="w-full bg-black text-white rounded-full" onClick={() => navigate('/auth')}>
                  Get started for free
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Every AI Tool You'll
              <br />
              Ever Need for Your Day
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              One platform for all your daily optimization needs - sleep, productivity, fitness, nutrition, and more. No one else comes close.
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-2 bg-gray-50 rounded-full text-sm text-gray-600 mb-8">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">The Most Powerful Daily Optimization Suite On The Planet</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-black hover:bg-gray-800 text-white text-base h-12 rounded-full px-8"
              >
                Get started for free
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {['JD', 'SK', 'AL', 'MC', 'TR', 'LW', 'EP', 'RG', 'NH'].map((initials, idx) => {
                    const gradients = [
                      'from-blue-500 to-cyan-400',
                      'from-purple-500 to-pink-500',
                      'from-pink-500 to-rose-500',
                      'from-green-500 to-emerald-500',
                      'from-orange-500 to-amber-500',
                      'from-red-500 to-orange-500',
                      'from-teal-500 to-cyan-500',
                      'from-indigo-500 to-purple-500',
                      'from-amber-500 to-yellow-500'
                    ];
                    return (
                      <div 
                        key={idx}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[idx]} border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                      >
                        {initials}
                      </div>
                    );
                  })}
                </div>
                <span className="text-gray-700 font-medium">2.1+ Million users optimizing daily</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="max-w-5xl mx-auto">
            <Card className="border border-gray-200 shadow-2xl overflow-hidden bg-white rounded-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <img src="/dayai-icon-64.png" alt="DayAI" className="w-7 h-7" />
                      <span className="font-semibold text-gray-900">DayAI</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="hidden sm:inline">All systems optimized</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-900">Today's Progress</span>
                        <span className="text-sm font-bold text-gray-900">83%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: '83%' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { icon: Moon, label: 'Sleep quality', value: '7.5h', gradient: 'from-indigo-500 to-purple-500' },
                        { icon: Target, label: 'Tasks complete', value: '3/3', gradient: 'from-blue-500 to-cyan-400' },
                        { icon: Activity, label: 'Active time', value: '45min', gradient: 'from-red-500 to-orange-400' },
                        { icon: Zap, label: 'Day streak', value: '15🔥', gradient: 'from-yellow-400 to-amber-500' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-xl font-bold text-gray-900">{item.value}</p>
                          <p className="text-sm text-gray-600">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">AI Insight</p>
                          <p className="text-sm text-gray-700">
                            Your peak productivity window is 9-11 AM. Schedule deep work during this time.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              A Tool Suite for Pros and Beginners Alike
            </h3>
            <p className="text-gray-600">
              DayAI powers millions of high-performers, entrepreneurs, and everyday people.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {/* Placeholder logos - you can replace with actual logos */}
            {['Forbes', 'TechCrunch', 'Business Insider', 'ProductHunt', 'Wired', 'The Verge'].map((brand, idx) => (
              <div key={idx} className="text-2xl font-bold text-gray-400">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chronological Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Everything you need to master your day
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              From morning optimization to evening reflection, DayAI guides you through every hour with intelligent coaching.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {chronologicalFeatures.map((feature, idx) => (
              <Card key={idx} className="border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl group hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {feature.time}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Explore All Button */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-black hover:bg-gray-800 text-white text-base h-12 px-8 rounded-full"
            >
              Explore All Features
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Section - Unoptimized vs AI-Optimized Day */}
      <section id="comparison" className="py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Cut Your Unproductive Hours by 97%
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Why waste time juggling multiple apps when you can optimize your entire day in one place?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Left: Unoptimized Day */}
            <Card className="border-2 border-red-200 bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-2">
                <div className="bg-red-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full inline-block">
                  Without DayAI
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Unoptimized Day</h3>
                    <p className="text-sm text-gray-600">Scattered & Unproductive</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { time: '8:00 AM', activity: 'Wake up late, groggy', icon: '😴' },
                    { time: '8:30 AM', activity: 'Scroll social media in bed', icon: '📱' },
                    { time: '9:00 AM', activity: 'Skip breakfast, coffee only', icon: '☕' },
                    { time: '10:00 AM', activity: 'Check emails, feel overwhelmed', icon: '📧' },
                    { time: '11:00 AM', activity: 'Meetings with no prep', icon: '😰' },
                    { time: '12:30 PM', activity: 'Fast food at desk', icon: '🍔' },
                    { time: '2:00 PM', activity: 'Afternoon crash, more coffee', icon: '😫' },
                    { time: '3:00 PM', activity: 'Distracted work, low focus', icon: '🤷' },
                    { time: '5:00 PM', activity: 'Realize nothing done today', icon: '😞' },
                    { time: '6:00 PM', activity: 'Stress eat junk food', icon: '🍕' },
                    { time: '8:00 PM', activity: 'Guilt spiral on couch', icon: '😔' },
                    { time: '10:00 PM', activity: 'Promise tomorrow is different', icon: '🤞' },
                    { time: '1:00 AM', activity: 'Still watching Netflix...', icon: '📺' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-red-700">{item.time}</div>
                        <div className="text-sm text-gray-700">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-red-100 rounded-lg border-2 border-red-300">
                  <p className="text-sm font-bold text-red-900 text-center">
                    ⚠️ Result: Exhausted, unproductive, unhealthy cycle
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right: AI-Optimized Day */}
            <Card className="border-2 border-green-200 bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2">
                <div className="bg-green-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full inline-block flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  With DayAI
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">AI-Optimized Day</h3>
                    <p className="text-sm text-gray-600">Intentional & High-Performance</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { time: '6:00 AM', activity: 'Wake refreshed, 7.5h sleep', icon: '✨' },
                    { time: '6:15 AM', activity: 'Morning pages + meditation', icon: '🧘' },
                    { time: '7:00 AM', activity: 'Workout (peak energy time)', icon: '💪' },
                    { time: '8:00 AM', activity: 'High-protein breakfast', icon: '🥑' },
                    { time: '9:00 AM', activity: 'Deep work: Hardest task first', icon: '🎯' },
                    { time: '11:00 AM', activity: '90-min focus block complete', icon: '🔥' },
                    { time: '12:30 PM', activity: 'Walking lunch, mindful meal', icon: '🚶' },
                    { time: '2:00 PM', activity: '20-min power nap', icon: '😴' },
                    { time: '3:00 PM', activity: 'Meetings (energized!)', icon: '💼' },
                    { time: '5:30 PM', activity: 'Work done, leave on time', icon: '✅' },
                    { time: '6:30 PM', activity: 'Family dinner, quality time', icon: '👨‍👩‍👧' },
                    { time: '8:00 PM', activity: 'Reading + learning (30min)', icon: '📚' },
                    { time: '9:30 PM', activity: 'Evening reflection + gratitude', icon: '🙏' },
                    { time: '10:00 PM', activity: 'Wind down, sleep by 10:30', icon: '🌙' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-green-700">{item.time}</div>
                        <div className="text-sm text-gray-700">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-100 rounded-lg border-2 border-green-300">
                  <p className="text-sm font-bold text-green-900 text-center">
                    ✨ Result: Energized, productive, thriving lifestyle
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-black hover:bg-gray-800 text-white text-base h-14 px-12 rounded-full text-lg"
            >
              Start Your Optimized Day Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 2.1M+ users optimizing daily
            </p>
          </div>
        </div>
      </section>

      {/* A Simpler Solution Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              A Simpler Solution 💰
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              No more paying for 20+ different apps! DayAI brings it all home.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {allFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
              >
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">
              All included. One simple subscription. <span className="font-bold text-gray-900">$0/month</span> to start.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Trusted by 1M+ Professionals Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              See why smart people are switching to DayAI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1">
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Start optimizing today
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 2.1+ million high-performers using DayAI. Free to start, upgrade anytime.
          </p>
          
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-black hover:bg-gray-800 text-white text-base h-12 px-8 rounded-full"
          >
            Get started for free
          </Button>

          <p className="text-sm text-gray-500 mt-6">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/dayai-icon-64.png" alt="DayAI" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">{BRAND.name}</span>
            </div>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
              The Most Powerful Daily Optimization Platform on the Planet
            </p>
            
            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a 
                href="#" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a 
                href="#" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Product</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#comparison" className="hover:text-gray-900 transition-colors">Why DayAI</a></li>
                <li><a href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="/changelog" className="hover:text-gray-900 transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-gray-900 transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="/help" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="/guides" className="hover:text-gray-900 transition-colors">Guides</a></li>
                <li><a href="/api" className="hover:text-gray-900 transition-colors">API</a></li>
                <li><a href="/status" className="hover:text-gray-900 transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-gray-900 transition-colors">Terms</a></li>
                <li><a href="/security" className="hover:text-gray-900 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {[
              { name: 'Twitter', path: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
              { name: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              { name: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { name: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { name: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
              { name: 'TikTok', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' }
            ].map((social, idx) => (
              <a 
                key={idx}
                href={`#${social.name.toLowerCase()}`}
                className="text-gray-400 hover:text-gray-600 transition-colors" 
                aria-label={social.name}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-600">
              © 2025 {BRAND.name} Inc. All rights reserved. Built for intentional living.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

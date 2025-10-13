import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BRAND } from '@/lib/constants';
import {
  ArrowRight,
  Target,
  Moon,
  Sun,
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
  SmartphoneOff,
  Walk,
  GraduationCap,
  Focus,
  RefreshCw,
  Utensils,
  BedDouble,
  Timer,
  Apple,
  Smartphone
} from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Sunrise,
      title: 'Morning Optimization',
      description: 'AI-powered morning routines that adapt to your energy levels. 90% of executives win their day before 9 AM.',
      gradient: 'from-orange-400 to-pink-500',
      iconColor: 'text-white'
    },
    {
      icon: Target,
      title: 'Eat the Frog First',
      description: 'Tackle your hardest task when willpower is highest. Peak cognitive performance is 2-4 hours after waking.',
      gradient: 'from-blue-500 to-cyan-400',
      iconColor: 'text-white'
    },
    {
      icon: Dumbbell,
      title: 'Intelligent Fitness',
      description: 'Exercise when your body is primed. Morning workouts have 50% better adherence and improve mood all day.',
      gradient: 'from-red-500 to-orange-400',
      iconColor: 'text-white'
    },
    {
      icon: Coffee,
      title: 'Nutrition Optimization',
      description: 'Smart meal tracking with insights. High-protein breakfast = 135 fewer calories consumed later.',
      gradient: 'from-amber-500 to-yellow-400',
      iconColor: 'text-white'
    },
    {
      icon: Moon,
      title: 'Evening Reflection',
      description: 'Close your day with structured reflection. Reflection increases performance by 23%.',
      gradient: 'from-indigo-500 to-purple-500',
      iconColor: 'text-white'
    },
    {
      icon: BedDouble,
      title: 'Sleep Tracking',
      description: '7-8 hours tracked and optimized. Sleep is the ultimate performance enhancer, not a luxury.',
      gradient: 'from-purple-500 to-pink-500',
      iconColor: 'text-white'
    },
    {
      icon: Droplet,
      title: 'Hydration Tracking',
      description: '16-20oz water upon waking improves cognition by 14%. Your brain is 73% water—fuel it first.',
      gradient: 'from-cyan-400 to-blue-500',
      iconColor: 'text-white'
    },
    {
      icon: Brain,
      title: 'Meditation & Mindfulness',
      description: '10 minutes daily increases focus by 11% and reduces stress by 22% in 8 weeks.',
      gradient: 'from-purple-400 to-indigo-500',
      iconColor: 'text-white'
    },
    {
      icon: NotebookPen,
      title: 'Morning Pages',
      description: 'Stream of consciousness journaling. Expressive writing improves working memory by 13%.',
      gradient: 'from-yellow-400 to-orange-500',
      iconColor: 'text-white'
    },
    {
      icon: SmartphoneOff,
      title: 'No Phone First Hour',
      description: 'Protect morning sovereignty. Checking phone first thing spikes cortisol by 23%.',
      gradient: 'from-gray-600 to-gray-800',
      iconColor: 'text-white'
    },
    {
      icon: Focus,
      title: 'Deep Work Blocks',
      description: 'Uninterrupted 90-minute focus sessions. Single-tasking is 40% more productive than multitasking.',
      gradient: 'from-blue-600 to-blue-400',
      iconColor: 'text-white'
    },
    {
      icon: Timer,
      title: '90-Minute Work Cycles',
      description: 'Ultradian rhythms for peak performance. Elite performers work in sprints, not marathons.',
      gradient: 'from-orange-500 to-red-500',
      iconColor: 'text-white'
    },
    {
      icon: Walk,
      title: 'Walking Meetings',
      description: 'Lunch walks increase creative ideas by 30%. Movement fuels innovation.',
      gradient: 'from-green-400 to-emerald-500',
      iconColor: 'text-white'
    },
    {
      icon: BookOpen,
      title: 'Daily Reading',
      description: '30 min/day = 23 additional books/year. Knowledge compounds like interest.',
      gradient: 'from-blue-500 to-indigo-600',
      iconColor: 'text-white'
    },
    {
      icon: Heart,
      title: 'Gratitude Practice',
      description: 'Daily gratitude increases happiness by 25%. Perspective is everything.',
      gradient: 'from-pink-400 to-rose-500',
      iconColor: 'text-white'
    },
    {
      icon: Zap,
      title: 'Energy Management',
      description: 'Manage energy, not just time. Top performers work 40-50 hours, not 80.',
      gradient: 'from-yellow-400 to-amber-500',
      iconColor: 'text-white'
    },
    {
      icon: Users,
      title: 'Social Connection',
      description: '15 minutes of social interaction boosts productivity. Strong relationships = happiness.',
      gradient: 'from-green-500 to-teal-500',
      iconColor: 'text-white'
    },
    {
      icon: Utensils,
      title: 'Mindful Meals',
      description: 'Lunch away from desk = 15% more productive afternoon. Eating is recovery, not a race.',
      gradient: 'from-orange-400 to-amber-500',
      iconColor: 'text-white'
    },
    {
      icon: RefreshCw,
      title: 'Recovery & Breaks',
      description: 'Strategic rest enables peak performance. Working 55+ hours = zero productivity gains.',
      gradient: 'from-teal-400 to-cyan-500',
      iconColor: 'text-white'
    },
    {
      icon: GraduationCap,
      title: 'Continuous Learning',
      description: 'Lifelong learners earn 20% more. Leaders are readers, always.',
      gradient: 'from-indigo-400 to-purple-500',
      iconColor: 'text-white'
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Insights',
      description: 'Turn data into decisions. Pattern recognition that compounds over time.',
      gradient: 'from-emerald-500 to-green-600',
      iconColor: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/dayai-icon-64.png" alt="DayAI" className="w-8 h-8" />
              <span className="text-xl font-semibold text-gray-900">{BRAND.name}</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Reviews
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-sm"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-black hover:bg-gray-800 text-white text-sm rounded-full px-6"
              >
                Get started for free
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <a href="#features" className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#how-it-works" className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="#testimonials" className="block py-2 text-sm text-gray-600 hover:text-gray-900">
                Reviews
              </a>
              <div className="pt-3 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full rounded-full"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-full"
                  onClick={() => navigate('/auth')}
                >
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

            {/* Social Proof - 2.1M users with 9 colorful faces */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    JD
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    SK
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    AL
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    MC
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    TR
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    LW
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    EP
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    RG
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    NH
                  </div>
                </div>
                <span className="text-gray-700 font-medium">2.1+ Million users optimizing daily</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="max-w-5xl mx-auto">
            <Card className="border border-gray-200 shadow-2xl overflow-hidden bg-white rounded-2xl">
              <CardContent className="p-0">
                {/* Mock Dashboard Screenshot */}
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
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-3">
                          <Moon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">7.5h</p>
                        <p className="text-sm text-gray-600">Sleep quality</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-3">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">3/3</p>
                        <p className="text-sm text-gray-600">Tasks complete</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center mb-3">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">45min</p>
                        <p className="text-sm text-gray-600">Active time</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-3">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">15🔥</p>
                        <p className="text-sm text-gray-600">Day streak</p>
                      </div>
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

      {/* Features Section - Galaxy.ai Style with Vibrant Gradient Icons */}
      <section id="features" className="py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Everything you need to master your day
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              From morning optimization to evening reflection, DayAI provides intelligent guidance across every aspect of your daily life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl group hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
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
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Simple to start,
              <br />
              powerful to master
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              DayAI learns your patterns and optimizes your routine automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                number: '01',
                icon: Users,
                title: 'Set your goals',
                description: 'Tell DayAI what you want to achieve. Better sleep, higher productivity, improved fitness—we optimize for your unique objectives.',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                number: '02',
                icon: Brain,
                title: 'AI learns your patterns',
                description: 'Track your daily activities. Our AI analyzes when you\'re most productive, energetic, and focused to provide personalized guidance.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                number: '03',
                icon: TrendingUp,
                title: 'Continuously improve',
                description: 'Receive intelligent recommendations that adapt to your life. Small optimizations compound into extraordinary results.',
                gradient: 'from-blue-500 to-cyan-400'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="mb-6">
                  <span className="text-6xl sm:text-7xl font-bold text-gray-100">
                    {item.number}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Journey Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              From wake to sleep,
              <br />
              we've got you
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              DayAI guides you through every phase of your day with intelligent coaching.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                time: '6:00 AM',
                icon: Sun,
                title: 'Morning optimization',
                description: 'Wake with intention. Log sleep, set goals, receive AI-powered prioritization.',
                gradient: 'from-orange-400 to-pink-500'
              },
              {
                time: '9:00 AM',
                icon: Target,
                title: 'Peak productivity',
                description: 'Tackle MITs when willpower is highest. AI schedules deep work optimally.',
                gradient: 'from-blue-500 to-cyan-400'
              },
              {
                time: '3:00 PM',
                icon: Activity,
                title: 'Workout time',
                description: 'Exercise when your body is primed. Track performance and recovery.',
                gradient: 'from-red-500 to-orange-400'
              },
              {
                time: '6:00 PM',
                icon: Heart,
                title: 'Nutrition & recovery',
                description: 'Smart meal tracking with insights. Optimize nutrition for performance.',
                gradient: 'from-pink-400 to-rose-500'
              },
              {
                time: '9:00 PM',
                icon: Moon,
                title: 'Evening reflection',
                description: 'Close with gratitude. AI analyzes patterns for continuous improvement.',
                gradient: 'from-indigo-500 to-purple-500'
              }
            ].map((phase, idx) => (
              <Card key={idx} className="border border-gray-200 bg-white hover:shadow-lg transition-all rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <phase.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {phase.time}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {phase.title}
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Loved by high-performers
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Join millions who've transformed their daily routines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Product Manager',
                quote: 'DayAI transformed how I approach every day. The AI insights are incredibly accurate. 40% productivity increase in 3 weeks.',
              },
              {
                name: 'Marcus Johnson',
                role: 'Entrepreneur',
                quote: 'Best investment in myself. The evening reflection alone is worth it. 30-day streak and feeling unstoppable.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Software Engineer',
                quote: 'Finally, an app that understands me. The coaching feels personal. Lost 12 lbs, sleeping better than ever.',
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border border-gray-200 bg-white hover:shadow-lg transition-all rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
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

      {/* Footer - Galaxy.ai Style */}
      <footer className="border-t border-gray-200 py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo and Tagline */}
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
            {/* Product */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Product</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a></li>
                <li><a href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="/changelog" className="hover:text-gray-900 transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-gray-900 transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="/help" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="/guides" className="hover:text-gray-900 transition-colors">Guides</a></li>
                <li><a href="/api" className="hover:text-gray-900 transition-colors">API</a></li>
                <li><a href="/status" className="hover:text-gray-900 transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Legal */}
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
            <a href="https://twitter.com/dayai" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="https://linkedin.com/company/dayai" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://facebook.com/dayai" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="https://instagram.com/dayai" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://youtube.com/@dayai" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="https://tiktok.com/@dayai" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="TikTok">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
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

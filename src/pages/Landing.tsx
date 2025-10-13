import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BRAND } from '@/lib/constants';
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Moon,
  Sun,
  Activity,
  TrendingUp,
  Users,
  Menu,
  X,
  Sunrise,
  Dumbbell,
  Coffee,
  Heart,
  Zap,
  Brain
} from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/dayai-logo.webp" alt="DayAI" className="w-8 h-8" />
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
                className="bg-black hover:bg-gray-800 text-white text-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
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
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  onClick={() => navigate('/auth')}
                >
                  Get Started
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
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Your AI for an
              <br />
              intentional day
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Optimize every hour from wake to sleep. Intelligent coaching, habit tracking, and personalized insights—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-black hover:bg-gray-800 text-white text-base h-12"
              >
                Get DayAI free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                    A
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                    M
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                    S
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center text-xs font-semibold text-white">
                    E
                  </div>
                </div>
                <span className="text-gray-600">2,847+ users optimizing daily</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="max-w-5xl mx-auto">
            <Card className="border border-gray-200 shadow-lg overflow-hidden bg-white">
              <CardContent className="p-0">
                {/* Mock Dashboard Screenshot */}
                <div className="bg-[#FAFAFA] p-8">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <img src="/dayai-logo.webp" alt="DayAI" className="w-7 h-7" />
                      <span className="font-semibold text-gray-900">DayAI</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      All systems optimized
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-900">Today's Progress</span>
                        <span className="text-sm text-gray-500">83%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: '83%' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <Moon className="w-5 h-5 text-gray-700 mb-2" />
                        <p className="text-lg font-semibold text-gray-900">7.5h</p>
                        <p className="text-sm text-gray-600">Sleep quality</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <Target className="w-5 h-5 text-gray-700 mb-2" />
                        <p className="text-lg font-semibold text-gray-900">3/3</p>
                        <p className="text-sm text-gray-600">Tasks complete</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <Activity className="w-5 h-5 text-gray-700 mb-2" />
                        <p className="text-lg font-semibold text-gray-900">45min</p>
                        <p className="text-sm text-gray-600">Active time</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <Zap className="w-5 h-5 text-gray-700 mb-2" />
                        <p className="text-lg font-semibold text-gray-900">15🔥</p>
                        <p className="text-sm text-gray-600">Day streak</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">AI Insight</p>
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

      {/* Features Section */}
      <section id="features" className="py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Everything you need to master your day
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              From morning optimization to evening reflection, DayAI provides intelligent guidance across every aspect of your daily life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sunrise,
                title: 'Morning Optimization',
                description: 'Start your day with AI-powered routines. Set intentions, prioritize tasks, and build momentum from the moment you wake.'
              },
              {
                icon: Target,
                title: 'Smart Task Prioritization',
                description: 'AI analyzes your patterns to schedule tasks at peak performance times. Focus on what matters most when you\'re most capable.'
              },
              {
                icon: Dumbbell,
                title: 'Intelligent Fitness',
                description: 'Track workouts, optimize timing based on energy levels, and receive personalized coaching that adapts to your progress.'
              },
              {
                icon: Coffee,
                title: 'Nutrition Tracking',
                description: 'Smart meal logging with barcode scanning. Get insights on how nutrition affects your performance and energy.'
              },
              {
                icon: Moon,
                title: 'Evening Reflection',
                description: 'Close your day with structured reflection. Learn from today, celebrate wins, and prepare for tomorrow.'
              },
              {
                icon: TrendingUp,
                title: 'Continuous Learning',
                description: 'AI identifies patterns and provides actionable insights. Turn data into decisions that compound over time.'
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border border-gray-200 bg-white hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <feature.icon className="w-6 h-6 text-gray-900 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Simple to start,
              <br />
              powerful to master
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              DayAI learns your patterns and optimizes your routine automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                number: '01',
                icon: Users,
                title: 'Set your goals',
                description: 'Tell DayAI what you want to achieve. Better sleep, higher productivity, improved fitness—we optimize for your unique objectives.'
              },
              {
                number: '02',
                icon: Brain,
                title: 'AI learns your patterns',
                description: 'Track your daily activities. Our AI analyzes when you\'re most productive, energetic, and focused to provide personalized guidance.'
              },
              {
                number: '03',
                icon: TrendingUp,
                title: 'Continuously improve',
                description: 'Receive intelligent recommendations that adapt to your life. Small optimizations compound into extraordinary results.'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="mb-6">
                  <span className="text-6xl font-bold text-gray-100">
                    {item.number}
                  </span>
                </div>
                <item.icon className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
      <section className="py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              From wake to sleep,
              <br />
              we've got you
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              DayAI guides you through every phase of your day with intelligent coaching.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                time: '6:00 AM',
                icon: Sun,
                title: 'Morning optimization',
                description: 'Wake with intention. Log sleep, set goals, receive AI-powered prioritization.'
              },
              {
                time: '9:00 AM',
                icon: Target,
                title: 'Peak productivity',
                description: 'Tackle MITs when willpower is highest. AI schedules deep work optimally.'
              },
              {
                time: '3:00 PM',
                icon: Activity,
                title: 'Workout time',
                description: 'Exercise when your body is primed. Track performance and recovery.'
              },
              {
                time: '6:00 PM',
                icon: Heart,
                title: 'Nutrition & recovery',
                description: 'Smart meal tracking with insights. Optimize nutrition for performance.'
              },
              {
                time: '9:00 PM',
                icon: Moon,
                title: 'Evening reflection',
                description: 'Close with gratitude. AI analyzes patterns for continuous improvement.'
              }
            ].map((phase, idx) => (
              <Card key={idx} className="border border-gray-200 bg-white hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <phase.icon className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {phase.time}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
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
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Loved by high-performers
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join thousands who've transformed their daily routines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <Card key={idx} className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Start optimizing today
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 2,847+ high-performers using DayAI. Free to start, upgrade anytime.
          </p>
          
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-black hover:bg-gray-800 text-white text-base h-12 px-8"
          >
            Get DayAI free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-sm text-gray-500 mt-6">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/dayai-logo.webp" alt="DayAI" className="w-6 h-6" />
                <span className="text-lg font-semibold text-gray-900">{BRAND.name}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 max-w-xs">
                Your AI for an intentional day. Optimize every hour from wake to sleep.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-900">How it works</a></li>
                <li><a href="/pricing" className="hover:text-gray-900">Pricing</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-gray-900">About</a></li>
                <li><a href="/blog" className="hover:text-gray-900">Blog</a></li>
                <li><a href="/contact" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/privacy" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="/terms" className="hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 {BRAND.name}. Built for intentional living.
            </p>
            <div className="flex gap-6">
              <a href={`https://twitter.com/${BRAND.social.twitter}`} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href={`https://linkedin.com/${BRAND.social.linkedin}`} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
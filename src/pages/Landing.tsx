import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BRAND } from '@/lib/constants';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Moon,
  Sun,
  Activity,
  Brain,
  TrendingUp,
  Users,
  Heart,
  Star,
  ChevronRight,
  Menu,
  X
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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/dayai-logo.webp" alt="DayAI" className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-900">{BRAND.name}</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Reviews
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
              <a href="#features" className="block py-2 text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#how-it-works" className="block py-2 text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="#testimonials" className="block py-2 text-gray-600 hover:text-gray-900">
                Reviews
              </a>
              <a href="#pricing" className="block py-2 text-gray-600 hover:text-gray-900">
                Pricing
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Daily Optimization
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your AI for an
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Intentional Day
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Optimize every hour from wake to sleep with intelligent coaching, personalized insights, and seamless tracking across sleep, productivity, fitness, and nutrition.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg h-14"
                >
                  Start Optimizing Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg h-14"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See How It Works
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white" />
                    ))}
                  </div>
                  <span>2,847+ users</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="border-2 border-gray-200 shadow-2xl overflow-hidden">
                  <CardContent className="p-0">
                    {/* Mock Dashboard Screenshot */}
                    <div className="bg-white p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <img src="/dayai-logo.webp" alt="DayAI" className="w-8 h-8" />
                          <span className="font-bold text-gray-900">DayAI</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          All Systems Go
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">Today's Progress</span>
                            <span className="text-sm text-gray-600">83%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[83%]" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                            <Moon className="w-5 h-5 text-green-600 mb-1" />
                            <p className="text-sm font-semibold text-gray-900">7.5h</p>
                            <p className="text-xs text-gray-600">Sleep</p>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <Target className="w-5 h-5 text-blue-600 mb-1" />
                            <p className="text-sm font-semibold text-gray-900">3/3</p>
                            <p className="text-xs text-gray-600">MITs Done</p>
                          </div>
                          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                            <Activity className="w-5 h-5 text-orange-600 mb-1" />
                            <p className="text-sm font-semibold text-gray-900">45min</p>
                            <p className="text-xs text-gray-600">Workout</p>
                          </div>
                          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                            <Sparkles className="w-5 h-5 text-purple-600 mb-1" />
                            <p className="text-sm font-semibold text-gray-900">15🔥</p>
                            <p className="text-xs text-gray-600">Streak</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                          <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 mb-1">AI Insight</p>
                              <p className="text-xs text-gray-700">
                                Your most productive hours are 9-11 AM. Schedule deep work then.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              Features
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Master Your Day
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From morning optimization to evening reflection, DayAI provides intelligent guidance across every aspect of your daily life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BRAND.features.map((feature: any, idx: number) => (
              <Card key={idx} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              How It Works
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DayAI learns your patterns and optimizes your daily routine automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Set Your Goals',
                description: 'Tell DayAI what you want to achieve. Weight loss, productivity, better sleep—we optimize for your unique goals.'
              },
              {
                step: '02',
                icon: Brain,
                title: 'AI Learns Your Patterns',
                description: 'Track your daily activities. Our AI analyzes when you\'re most productive, energetic, and focused.'
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Optimize & Improve',
                description: 'Get personalized recommendations, insights, and coaching that adapt to your life in real-time.'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <Card className="border-2 border-gray-200 hover:shadow-xl transition-all h-full">
                  <CardContent className="p-8">
                    <div className="text-6xl font-bold text-gray-100 mb-4">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
                {idx < 2 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Journey Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              Your Day, Optimized
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              From Wake to Sleep, We've Got You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DayAI guides you through every phase of your day with intelligent coaching and personalized insights.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                time: '6:00 AM',
                icon: Sun,
                title: 'Morning Optimization',
                description: 'Wake with intention. Log sleep quality, set daily goals, and receive AI-powered prioritization.',
                color: 'from-yellow-400 to-orange-400'
              },
              {
                time: '9:00 AM',
                icon: Target,
                title: 'Peak Productivity',
                description: 'Tackle your MITs (Most Important Tasks) when willpower is highest. AI schedules deep work optimally.',
                color: 'from-blue-400 to-cyan-400'
              },
              {
                time: '3:00 PM',
                icon: Activity,
                title: 'Workout Time',
                description: 'Exercise when your body is primed. Track workouts, calories, and recovery patterns.',
                color: 'from-red-400 to-pink-400'
              },
              {
                time: '6:00 PM',
                icon: Heart,
                title: 'Nutrition & Recovery',
                description: 'Smart meal tracking with barcode scanning. Optimize nutrition for performance.',
                color: 'from-green-400 to-emerald-400'
              },
              {
                time: '9:00 PM',
                icon: Moon,
                title: 'Evening Reflection',
                description: 'Close your day with gratitude. AI analyzes patterns and provides insights for tomorrow.',
                color: 'from-indigo-400 to-purple-400'
              }
            ].map((phase, idx) => (
              <Card key={idx} className="border-2 border-gray-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center flex-shrink-0`}>
                      <phase.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {phase.time}
                        </Badge>
                        <h3 className="text-xl font-bold text-gray-900">
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
      <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-100 text-pink-700 border-pink-200">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by High-Performers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands who've transformed their daily routines with DayAI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Product Manager at Google',
                avatar: '👩‍💼',
                quote: 'DayAI transformed how I approach every single day. The AI insights are scary accurate. I\'ve increased my productivity by 40% in just 3 weeks.',
                rating: 5
              },
              {
                name: 'Marcus Johnson',
                role: 'Entrepreneur & Founder',
                avatar: '👨‍💼',
                quote: 'Best investment I\'ve made in myself. The evening reflection feature alone is worth it. I\'ve built a 30-day streak and feel unstoppable.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Software Engineer',
                avatar: '👩‍💻',
                quote: 'Finally, an app that gets me. The AI coaching feels personal, not generic. Lost 12 lbs and sleeping better than ever. Game changer.',
                rating: 5
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
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
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Optimize Your Life?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 2,847+ high-performers using DayAI to master their days. Start free, upgrade anytime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg h-14 px-8"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10 text-lg h-14 px-8"
            >
              View Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/dayai-logo.webp" alt="DayAI" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-900">{BRAND.name}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {BRAND.tagline}
              </p>
              <div className="flex gap-3">
                <a href={`https://twitter.com/${BRAND.social.twitter}`} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href={`https://instagram.com/${BRAND.social.instagram}`} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href={`https://linkedin.com/${BRAND.social.linkedin}`} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-900">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="/changelog" className="hover:text-gray-900">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-gray-900">About</a></li>
                <li><a href="/blog" className="hover:text-gray-900">Blog</a></li>
                <li><a href="/contact" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/privacy" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="/terms" className="hover:text-gray-900">Terms</a></li>
                <li><a href="/security" className="hover:text-gray-900">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>© 2025 {BRAND.name}. All rights reserved. Built for intentional living.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

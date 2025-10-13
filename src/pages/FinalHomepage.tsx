import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  Check,
  Star,
  Users,
  TrendingUp,
  Leaf,
  Sparkles,
  Clock,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

export default function FinalHomepage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);

  return (
    <div className="min-h-screen bg-background">
      {/* SECTION 1: HERO - DoorDash Style */}
      <motion.section 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-background to-blue-50"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Copy */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  The All-in-One Health Platform
                </Badge>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  From breakfast
                  <br />to bedtime.
                  <br />
                  <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    All powered by AI.
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Track meals. Scan menus. Stop food waste. Save money. 
                  Build community. <strong>30+ features</strong> that fit your life.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 h-14 text-lg shadow-xl hover:shadow-2xl transition-all"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-14 text-lg border-2 px-8"
                  >
                    <PlayCircle className="mr-2 w-5 h-5" />
                    See How It Works
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Free 14-day trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>No credit card needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </motion.div>

              {/* Right: App Preview */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {/* Floating Phone Mockup */}
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-pink-400/30 blur-3xl" />
                  
                  {/* Phone Frame */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl">
                    <div className="bg-background rounded-[2.5rem] overflow-hidden">
                      {/* Notch */}
                      <div className="bg-gray-900 h-8 rounded-b-3xl mx-auto w-40 mb-2" />
                      
                      {/* Screen Content */}
                      <div className="p-4 space-y-4">
                        {/* Mock Dashboard */}
                        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-4 text-white">
                          <p className="text-sm opacity-90">Today's Progress</p>
                          <p className="text-3xl font-bold">1,847 / 2,000</p>
                          <p className="text-xs opacity-75">calories</p>
                        </div>

                        {/* Mock Feature Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          {['🍽️ Menu AI', '🛒 Shopping', '🌍 Waste', '📊 Reports'].map((feature, i) => (
                            <div key={i} className="bg-secondary rounded-xl p-3 text-center">
                              <p className="text-2xl mb-1">{feature.split(' ')[0]}</p>
                              <p className="text-xs font-semibold">{feature.split(' ')[1]}</p>
                            </div>
                          ))}
                        </div>

                        {/* Mock Stats */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                            <span className="text-xs font-medium">Food Saved</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">$47.20</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <span className="text-xs font-medium">CO₂ Prevented</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">8.4kg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-6 -right-6 bg-card rounded-2xl shadow-xl p-4 border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Meal Scanned</p>
                        <p className="text-sm font-bold">Healthy! ✓</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-4 border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">
                        🍱
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Meal Swap</p>
                        <p className="text-sm font-bold">2 nearby</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Scroll to explore</p>
            <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-muted-foreground rounded-full" />
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* SECTION 2: YOUR 24-HOUR JOURNEY - Story Scroll */}
      <section id="how-it-works" className="relative py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
              <Clock className="w-4 h-4 mr-2" />
              Your 24-Hour Journey
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Every moment. <span className="text-orange-500">Optimized.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From sunrise to sleep, we've got you covered with AI-powered features
            </p>
          </div>

          {/* Journey Timeline - DoorDash Style */}
          <div className="max-w-5xl mx-auto space-y-24">
            {[
              {
                time: '6:00 AM',
                period: 'Morning',
                emoji: '🌅',
                gradient: 'from-orange-400 to-yellow-400',
                title: 'Wake. Hydrate. Set Goals.',
                features: [
                  { icon: '💧', name: 'Smart Hydration', desc: 'Voice reminds you to drink water' },
                  { icon: '🎯', name: 'AI Goal Setting', desc: 'Personalized calorie targets' },
                  { icon: '📊', name: 'Morning Report', desc: "Yesterday's progress summary" }
                ],
                image: 'left'
              },
              {
                time: '12:00 PM',
                period: 'Lunch',
                emoji: '🍽️',
                gradient: 'from-green-400 to-emerald-400',
                title: 'Scan Any Menu. Know What\'s Healthy.',
                features: [
                  { icon: '📱', name: 'Menu Scanner AI', desc: 'WORLD-FIRST: Scan restaurant menus', badge: 'NEW' },
                  { icon: '⚡', name: 'Health Scores', desc: 'Instant 0-100 ratings' },
                  { icon: '💡', name: 'Smart Mods', desc: 'Better choices on same menu' }
                ],
                image: 'right'
              },
              {
                time: '3:00 PM',
                period: 'Shopping',
                emoji: '🛒',
                gradient: 'from-blue-400 to-cyan-400',
                title: 'Shop Smart. Never Overbuy.',
                features: [
                  { icon: '🤖', name: 'AI Shopping List', desc: 'Goal-based lists in 3 seconds' },
                  { icon: '📸', name: 'Scan-to-Check', desc: 'Auto-check items as you shop' },
                  { icon: '💳', name: 'Receipt Scanner', desc: 'Compare costs automatically' }
                ],
                image: 'left'
              },
              {
                time: '6:00 PM',
                period: 'Dinner',
                emoji: '👨‍🍳',
                gradient: 'from-purple-400 to-pink-400',
                title: 'Cook. Share. Save the Planet.',
                features: [
                  { icon: '🌍', name: 'Food Waste AI', desc: 'Track inventory, prevent waste', badge: 'WORLD-FIRST' },
                  { icon: '🍱', name: 'Rescue Recipes', desc: 'Use expiring ingredients' },
                  { icon: '🤝', name: 'Meal Swap', desc: 'Share extra meals with neighbors' }
                ],
                image: 'right'
              },
              {
                time: '10:00 PM',
                period: 'Evening',
                emoji: '📈',
                gradient: 'from-indigo-400 to-purple-400',
                title: 'Reflect. Achieve. Improve.',
                features: [
                  { icon: '🏆', name: 'Daily Report', desc: 'Complete progress summary' },
                  { icon: '💰', name: 'Money Saved', desc: 'See financial impact' },
                  { icon: '🌳', name: 'Carbon Impact', desc: 'Environmental contribution' }
                ],
                image: 'left'
              }
            ].map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  phase.image === 'right' ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={phase.image === 'right' ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-5xl">{phase.emoji}</div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">{phase.time}</p>
                      <h3 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${phase.gradient} bg-clip-text text-transparent`}>
                        {phase.period}
                      </h3>
                    </div>
                  </div>

                  <h4 className="text-2xl md:text-3xl font-bold mb-6">
                    {phase.title}
                  </h4>

                  <div className="space-y-4">
                    {phase.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
                      >
                        <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold group-hover:text-orange-500 transition-colors">
                              {feature.name}
                            </h5>
                            {feature.badge && (
                              <Badge className="bg-orange-500 text-white text-xs">
                                {feature.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{feature.desc}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 transition-colors flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className={phase.image === 'right' ? 'lg:order-1' : ''}>
                  <div className={`relative aspect-square rounded-3xl bg-gradient-to-br ${phase.gradient} p-8 shadow-2xl`}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl" />
                    <div className="relative h-full flex items-center justify-center text-9xl">
                      {phase.emoji}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURE MARKETPLACE - Amazon Style */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              30+ Premium Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need. All in one place.
            </p>
          </div>

          {/* Feature Categories - Amazon Style */}
          <div className="space-y-12">
            {[
              {
                category: '🤖 AI-Powered Intelligence',
                features: [
                  { name: 'Menu Scanner AI', desc: 'Scan menus, get health scores', badge: 'WORLD-FIRST' },
                  { name: 'AI Meal Planner', desc: 'Personalized recipes instantly' },
                  { name: 'Smart Shopping Lists', desc: 'Goal-based in 3 seconds' },
                  { name: 'Rescue Recipe Generator', desc: 'Use expiring ingredients' },
                  { name: 'Health Score Algorithm', desc: 'Rate any food 0-100' },
                  { name: 'Expiration Predictor', desc: 'AI learns your patterns' }
                ]
              },
              {
                category: '📱 Smart Scanning & Tracking',
                features: [
                  { name: 'Bobby-Style Barcode Scanner', desc: 'Instant health analysis' },
                  { name: 'Scan-to-Check-Off Shopping', desc: 'Auto-check while you shop' },
                  { name: 'Receipt Scanner OCR', desc: 'Compare costs automatically' },
                  { name: 'Food Diary', desc: 'Log meals in seconds' },
                  { name: 'Macro Tracker', desc: 'Protein, carbs, fats' },
                  { name: 'Calorie Counter', desc: 'CalAI-style tracking' }
                ]
              },
              {
                category: '🌍 Sustainability & Impact',
                features: [
                  { name: 'Food Waste Intelligence', desc: 'Track & predict waste', badge: 'WORLD-FIRST' },
                  { name: 'Carbon Footprint', desc: 'See environmental impact' },
                  { name: 'Money Saved Dashboard', desc: 'Track all savings' },
                  { name: 'Waste Pattern Analysis', desc: 'AI prevents future waste' },
                  { name: 'Fridge Inventory', desc: 'Smart expiration alerts' }
                ]
              },
              {
                category: '🤝 Community & Sharing',
                features: [
                  { name: 'Meal Swap Marketplace', desc: 'Trade meals with neighbors', badge: 'WORLD-FIRST' },
                  { name: 'Family Sharing', desc: 'Real-time collaboration' },
                  { name: 'Social Reviews', desc: 'Community ratings' },
                  { name: 'Achievement System', desc: 'Unlock badges & milestones' }
                ]
              },
              {
                category: '🎤 Voice & Mobile',
                features: [
                  { name: 'Voice Commands', desc: 'Hands-free control' },
                  { name: 'Text-to-Speech', desc: 'App talks to you' },
                  { name: 'Push Notifications', desc: 'Smart reminders' },
                  { name: 'PWA Mobile App', desc: 'Install to home screen' },
                  { name: 'Offline Mode', desc: 'Works without internet' },
                  { name: 'Dark Mode', desc: 'Easy on the eyes' }
                ]
              }
            ].map((category, idx) => (
              <div key={idx}>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      className="p-6 rounded-xl border-2 hover:border-orange-200 dark:hover:border-orange-800 transition-all cursor-pointer bg-card group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold group-hover:text-orange-500 transition-colors">
                          {feature.name}
                        </h4>
                        {feature.badge && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SOCIAL PROOF - Trust Builder */}
      <section className="py-20 bg-gradient-to-br from-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by Health-Conscious Innovators
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands already transforming their lives
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
            {[
              { number: '$245', label: 'Avg. Saved/Month', icon: TrendingUp, color: 'text-green-500' },
              { number: '32kg', label: 'CO₂ Prevented/Year', icon: Leaf, color: 'text-emerald-500' },
              { number: '4.9/5', label: 'User Rating', icon: Star, color: 'text-yellow-500' },
              { number: '10K+', label: 'Active Users', icon: Users, color: 'text-blue-500' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <p className="text-3xl md:text-4xl font-bold mb-1">{stat.number}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "The menu scanner changed how I eat out. I finally know what's actually healthy!",
                name: "Sarah M.",
                role: "Fitness Enthusiast",
                avatar: "👩‍💼"
              },
              {
                quote: "Saved $180 last month just by preventing food waste. This app paid for itself!",
                name: "Michael R.",
                role: "Dad of 3",
                avatar: "👨‍👧‍👦"
              },
              {
                quote: "Meal swapping is genius. I've met my neighbors and tried amazing new foods!",
                name: "Jessica L.",
                role: "Community Builder",
                avatar: "👩‍🍳"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-0 shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{testimonial.avatar}</div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Join thousands experiencing the future of health & sustainability
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="flex gap-2 max-w-md mx-auto sm:mx-0">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/90 backdrop-blur-sm border-0 h-14 text-gray-900 text-lg"
                />
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-white text-orange-500 hover:bg-gray-100 h-14 px-8 text-lg font-bold whitespace-nowrap"
                >
                  Start Free
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4">DayAI</h3>
              <p className="text-gray-400 text-sm">
                Your AI for an intentional day. Optimize every hour from wake to sleep.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Download</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 DayAI. All rights reserved. Built for intentional living.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Droplet,
  Target,
  Coffee,
  Dumbbell,
  Bell,
  Utensils,
  ShoppingCart,
  Camera,
  Receipt,
  ChefHat,
  Leaf,
  Moon,
  Repeat,
  Award,
  TrendingUp,
  Sunrise,
  Clock,
  Play,
  Zap,
  Sparkles,
  ArrowRight,
  Check,
  Users,
  Globe,
  Smartphone,
  Brain,
  Heart,
  X,
  ChevronDown
} from 'lucide-react';

interface TimeSlot {
  time: string;
  period: string;
  icon: any;
  iconColor: string;
  title: string;
  emoji: string;
  features: {
    name: string;
    path: string;
    icon: any;
    description: string;
    badge?: string;
  }[];
  gradient: string;
}

export default function NewHomepage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().getHours());
  const [isPlaying, setIsPlaying] = useState(false);
  const [email, setEmail] = useState('');

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const timeSlots: TimeSlot[] = [
    {
      time: '6:00 AM',
      period: 'Morning Wake Up',
      icon: Sunrise,
      iconColor: 'text-orange-500',
      gradient: 'from-orange-500/20 to-yellow-500/20',
      title: 'Rise & Shine',
      emoji: '🌅',
      features: [
        {
          name: 'Voice Greeting',
          path: '/voice-commands',
          icon: Bell,
          description: 'Good morning! Here\'s your day',
          badge: 'AI'
        },
        {
          name: 'Hydration Reminder',
          path: '/dashboard',
          icon: Droplet,
          description: 'Start with 16oz water'
        },
        {
          name: 'Daily Goal Setting',
          path: '/dashboard',
          icon: Target,
          description: 'AI sets personalized targets'
        },
        {
          name: 'Morning Report',
          path: '/dashboard',
          icon: TrendingUp,
          description: 'Yesterday\'s progress summary'
        }
      ]
    },
    {
      time: '7:00 AM',
      period: 'Breakfast Time',
      icon: Coffee,
      iconColor: 'text-amber-600',
      gradient: 'from-amber-500/20 to-orange-500/20',
      title: 'Breakfast',
      emoji: '🍳',
      features: [
        {
          name: 'Food Diary',
          path: '/dashboard',
          icon: Coffee,
          description: 'Log breakfast in seconds'
        },
        {
          name: 'Barcode Scanner',
          path: '/barcode-scanner',
          icon: Camera,
          description: 'Scan food items instantly',
          badge: 'Bobby-Style'
        },
        {
          name: 'Macro Tracker',
          path: '/dashboard',
          icon: TrendingUp,
          description: 'Real-time macro calculation'
        },
        {
          name: 'Voice Logging',
          path: '/voice-commands',
          icon: Bell,
          description: 'Say what you ate, hands-free'
        }
      ]
    },
    {
      time: '9:00 AM',
      period: 'Workout Session',
      icon: Dumbbell,
      iconColor: 'text-red-500',
      gradient: 'from-red-500/20 to-pink-500/20',
      title: 'Workout',
      emoji: '💪',
      features: [
        {
          name: 'Voice Commands',
          path: '/voice-commands',
          icon: Bell,
          description: 'Hands-free workout logging'
        },
        {
          name: 'Smart Reminders',
          path: '/notifications',
          icon: Bell,
          description: 'Never miss a workout'
        },
        {
          name: 'Achievement Tracking',
          path: '/dashboard',
          icon: Award,
          description: 'Unlock fitness badges'
        }
      ]
    },
    {
      time: '12:00 PM',
      period: 'Lunch Break',
      icon: Utensils,
      iconColor: 'text-green-500',
      gradient: 'from-green-500/20 to-emerald-500/20',
      title: 'Lunch',
      emoji: '🍽️',
      features: [
        {
          name: 'Menu Scanner AI',
          path: '/menu-scanner',
          icon: Camera,
          description: 'Scan ANY restaurant menu',
          badge: 'WORLD-FIRST'
        },
        {
          name: 'Health Scores',
          path: '/menu-scanner',
          icon: Sparkles,
          description: 'Instant 0-100 ratings per dish'
        },
        {
          name: 'Smart Modifications',
          path: '/menu-scanner',
          icon: Zap,
          description: 'Better alternatives on same menu'
        },
        {
          name: 'Meal Logging',
          path: '/dashboard',
          icon: Coffee,
          description: 'Auto-log restaurant meals'
        }
      ]
    },
    {
      time: '3:00 PM',
      period: 'Grocery Shopping',
      icon: ShoppingCart,
      iconColor: 'text-blue-500',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      title: 'Shopping',
      emoji: '🛒',
      features: [
        {
          name: 'AI Shopping List',
          path: '/shopping-list',
          icon: ShoppingCart,
          description: 'Goal-based list in 3 seconds',
          badge: 'AI'
        },
        {
          name: 'Scan-to-Check-Off',
          path: '/barcode-scanner',
          icon: Camera,
          description: 'Auto-check while shopping'
        },
        {
          name: 'Bobby-Style Alerts',
          path: '/barcode-scanner',
          icon: Sparkles,
          description: 'Real-time health warnings'
        },
        {
          name: 'Receipt Scanner',
          path: '/receipt-scanner',
          icon: Receipt,
          description: 'Compare actual vs estimated',
          badge: 'OCR'
        },
        {
          name: 'Family Sync',
          path: '/family-sharing',
          icon: Users,
          description: 'Shop together, real-time'
        }
      ]
    },
    {
      time: '6:00 PM',
      period: 'Meal Preparation',
      icon: ChefHat,
      iconColor: 'text-purple-500',
      gradient: 'from-purple-500/20 to-pink-500/20',
      title: 'Cooking',
      emoji: '👨‍🍳',
      features: [
        {
          name: 'AI Meal Planner',
          path: '/dashboard',
          icon: Sparkles,
          description: 'Personalized recipes instantly'
        },
        {
          name: 'Rescue Recipes',
          path: '/rescue-recipes',
          icon: ChefHat,
          description: 'Use expiring ingredients',
          badge: 'WORLD-FIRST'
        },
        {
          name: 'Food Waste Tracker',
          path: '/food-waste',
          icon: Leaf,
          description: 'Smart fridge inventory'
        },
        {
          name: 'Voice Cook Mode',
          path: '/voice-commands',
          icon: Bell,
          description: 'Hands-free recipe steps'
        }
      ]
    },
    {
      time: '8:00 PM',
      period: 'Dinner & Community',
      icon: Repeat,
      iconColor: 'text-orange-500',
      gradient: 'from-orange-500/20 to-red-500/20',
      title: 'Dinner',
      emoji: '🍱',
      features: [
        {
          name: 'Meal Swap',
          path: '/meal-swap',
          icon: Repeat,
          description: 'Share extra meal prep',
          badge: 'WORLD-FIRST'
        },
        {
          name: 'Community',
          path: '/meal-swap',
          icon: Users,
          description: 'Trade meals with neighbors'
        },
        {
          name: 'Carbon Tracking',
          path: '/waste-report',
          icon: Leaf,
          description: 'Track environmental impact'
        }
      ]
    },
    {
      time: '10:00 PM',
      period: 'Evening Review',
      icon: Award,
      iconColor: 'text-yellow-500',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      title: 'Daily Summary',
      emoji: '📊',
      features: [
        {
          name: 'Daily Report',
          path: '/dashboard',
          icon: TrendingUp,
          description: 'Complete progress summary'
        },
        {
          name: 'Achievements',
          path: '/dashboard',
          icon: Award,
          description: 'Badges & milestones unlocked'
        },
        {
          name: 'Money Saved',
          path: '/waste-report',
          icon: TrendingUp,
          description: 'See financial impact'
        },
        {
          name: 'Voice Summary',
          path: '/voice-commands',
          icon: Bell,
          description: 'Hear your day summary'
        }
      ]
    },
    {
      time: '11:00 PM',
      period: 'Wind Down',
      icon: Moon,
      iconColor: 'text-indigo-500',
      gradient: 'from-indigo-500/20 to-purple-500/20',
      title: 'Sleep',
      emoji: '😴',
      features: [
        {
          name: 'Sleep Tracking',
          path: '/voice-commands',
          icon: Moon,
          description: 'Voice-log sleep quality'
        },
        {
          name: 'Tomorrow Prep',
          path: '/shopping-list',
          icon: Target,
          description: 'Plan next day automatically'
        }
      ]
    }
  ];

  // Auto-play demo
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const nextHour = (prev + 1) % 24;
          const hasSlot = timeSlots.some(slot => 
            parseInt(slot.time.split(':')[0]) === nextHour
          );
          return hasSlot ? nextHour : (prev + 1) % 24;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Find active slot
  const activeSlotIndex = timeSlots.findIndex((slot) => {
    const slotHour = parseInt(slot.time.split(':')[0]);
    return slotHour === currentTime;
  });

  async function handleEarlyAccess() {
    if (!email) return;
    alert('🎉 You\'re on the list! We\'ll notify you at launch.');
    setEmail('');
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
      {/* Removed flickering particles */}

      {/* Hero Section */}
      <motion.div style={{ y: y1, opacity }} className="relative z-10">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm md:text-lg px-4 md:px-6 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                World's First AI-Powered Health Platform
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Perfect Day,
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              From morning hydration to evening meal prep - experience how <strong className="text-primary">CoachOS</strong> seamlessly integrates <strong>30+ premium features</strong> into your daily routine
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-base md:text-lg px-6 md:px-8 h-12 md:h-14 w-full sm:w-auto shadow-2xl hover:shadow-blue-500/50 transition-all"
              >
                <Sparkles className="w-4 md:w-5 h-4 md:h-5" />
                Start Free Trial
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="gap-2 text-base md:text-lg px-6 md:px-8 h-12 md:h-14 w-full sm:w-auto border-2"
              >
                {isPlaying ? (
                  <>
                    <Clock className="w-4 md:w-5 h-4 md:h-5" />
                    Pause Tour
                  </>
                ) : (
                  <>
                    <Play className="w-4 md:w-5 h-4 md:h-5" />
                    Watch 24hr Demo
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-12 md:mt-16"
            >
              <ChevronDown className="w-8 h-8 mx-auto text-muted-foreground" />
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto mb-12 md:mb-20 px-4"
          >
            {[
              { number: '30+', label: 'Premium Features', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
              { number: '4', label: 'World-First Innovations', icon: Award, color: 'from-purple-500 to-pink-500' },
              { number: '24/7', label: 'AI Assistance', icon: Brain, color: 'from-orange-500 to-red-500' },
              { number: '100%', label: 'Mobile Optimized', icon: Smartphone, color: 'from-green-500 to-emerald-500' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-primary/5">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold mb-1">{stat.number}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Interactive Timeline Section */}
      <div id="timeline" className="relative z-10 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Clock className="w-4 h-4 mr-2" />
              24-Hour Journey
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Every Moment,
              <br className="md:hidden" />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Optimized</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Click any time slot to explore features designed for that moment
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTime}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-center mb-6 md:mb-8"
            >
              <div className="inline-flex items-center gap-3 px-4 md:px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary/30 shadow-lg">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-lg md:text-xl font-bold">
                  {isPlaying ? (
                    <>
                      {timeSlots[activeSlotIndex]?.emoji} {currentTime}:00 - {timeSlots[activeSlotIndex]?.title}
                    </>
                  ) : (
                    'Explore Your Day'
                  )}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {timeSlots.map((slot, index) => {
              const isActive = index === activeSlotIndex && isPlaying;
              const SlotIcon = slot.icon;

              return (
                <motion.div
                  key={slot.time}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setSelectedSlot(slot)}
                  className="cursor-pointer"
                >
                  <Card className={`border-0 shadow-xl transition-all h-full bg-gradient-to-br ${slot.gradient} ${
                    isActive ? 'ring-4 ring-primary shadow-2xl shadow-primary/50' : ''
                  }`}>
                    <CardContent className="p-4 md:p-6 relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={`w-12 h-12 rounded-full bg-gradient-to-br ${slot.gradient} flex items-center justify-center shadow-lg`}
                            animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                          >
                            <SlotIcon className={`w-6 h-6 ${slot.iconColor}`} />
                          </motion.div>
                          <div>
                            <p className="font-bold text-xs text-muted-foreground">{slot.time}</p>
                            <p className="text-base md:text-lg font-bold flex items-center gap-2">
                              <span>{slot.emoji}</span>
                              {slot.title}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Badge className="bg-primary shadow-lg">Live</Badge>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {slot.features.slice(0, 2).map((feature, idx) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <motion.div
                              key={idx}
                              whileHover={{ x: 5 }}
                              className="flex items-center gap-2 p-2 rounded-lg bg-background/60 hover:bg-background/90 transition-all"
                            >
                              <FeatureIcon className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium flex-1 line-clamp-1">{feature.name}</span>
                              {feature.badge && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  {feature.badge}
                                </Badge>
                              )}
                            </motion.div>
                          );
                        })}
                        {slot.features.length > 2 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{slot.features.length - 2} more
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        className="w-full mt-4 gap-2 hover:bg-primary/10"
                        size="sm"
                      >
                        Explore Features
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* World-First Features Section */}
      <motion.div style={{ y: y2 }} className="relative z-10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Award className="w-4 h-4 mr-2" />
              Industry Leading
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              4 World-First Innovations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Features that don't exist in ANY other fitness app
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Camera,
                title: 'Restaurant Menu Decoder AI',
                description: 'Point camera at ANY menu, get instant health analysis',
                gradient: 'from-purple-500 to-pink-500',
                badge: 'WORLD-FIRST',
                features: ['0-100 health scores', 'Smart modifications', 'Better alternatives']
              },
              {
                icon: Leaf,
                title: 'Food Waste Intelligence',
                description: 'Track inventory, predict waste, save money & planet',
                gradient: 'from-green-500 to-emerald-500',
                badge: 'REVOLUTIONARY',
                features: ['AI expiration alerts', 'Rescue recipes', 'Carbon tracking']
              },
              {
                icon: Repeat,
                title: 'Meal Swap Marketplace',
                description: 'Trade meal prep with neighbors, reduce waste together',
                gradient: 'from-orange-500 to-red-500',
                badge: 'WORLD-FIRST',
                features: ['Community trading', 'Credit economy', 'Real-time chat']
              },
              {
                icon: Receipt,
                title: 'Receipt Scanner + Analysis',
                description: 'Compare actual vs estimated costs, optimize budget',
                gradient: 'from-blue-500 to-cyan-500',
                badge: 'SMART',
                features: ['OCR scanning', 'Price tracking', 'Savings analytics']
              }
            ].map((innovation, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className={`border-0 shadow-2xl h-full bg-gradient-to-br ${innovation.gradient}/10`}>
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${innovation.gradient} flex items-center justify-center shadow-lg`}>
                        <innovation.icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge className={`bg-gradient-to-r ${innovation.gradient} text-white`}>
                        {innovation.badge}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{innovation.title}</h3>
                    <p className="text-muted-foreground mb-4">{innovation.description}</p>
                    <div className="space-y-2">
                      {innovation.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Social Proof Section */}
      <div className="relative z-10 py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Built for <span className="text-primary">Everyone</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Heart,
                  title: 'Health Conscious',
                  description: 'Make smarter food choices every day'
                },
                {
                  icon: Globe,
                  title: 'Eco Warriors',
                  description: 'Reduce waste, save the planet'
                },
                {
                  icon: Users,
                  title: 'Busy Families',
                  description: 'Coordinate shopping & meal prep'
                }
              ].map((audience, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <audience.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{audience.title}</h3>
                  <p className="text-muted-foreground">{audience.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-primary/10">
              <CardContent className="p-8 md:p-12 relative text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Ready to Transform
                  <br />
                  Your Life?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of users already experiencing the future of health & sustainability
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-6">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                  <Button
                    size="lg"
                    onClick={handleEarlyAccess}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-12 px-8 whitespace-nowrap"
                  >
                    Get Early Access
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  ✨ No credit card required • 🎁 14-day free trial • ⚡ Cancel anytime
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSlot(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-5xl md:max-h-[90vh] z-50 overflow-y-auto"
            >
              <Card className="border-0 shadow-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedSlot.gradient} opacity-20 rounded-lg`} />
                <CardContent className="p-6 md:p-8 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedSlot.gradient} flex items-center justify-center ring-4 ring-background shadow-xl`}>
                        <selectedSlot.icon className={`w-8 h-8 ${selectedSlot.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{selectedSlot.time}</p>
                        <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                          <span>{selectedSlot.emoji}</span>
                          {selectedSlot.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{selectedSlot.period}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSlot(null)}
                      className="rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {selectedSlot.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            navigate(feature.path);
                            setSelectedSlot(null);
                          }}
                          className="p-4 rounded-xl bg-background hover:bg-background/80 cursor-pointer transition-all border-2 border-border hover:border-primary group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <FeatureIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold">{feature.name}</p>
                                {feature.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {feature.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSlot(null)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/auth');
                        setSelectedSlot(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Started Free
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

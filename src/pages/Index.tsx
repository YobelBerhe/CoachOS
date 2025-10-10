import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Activity,
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
  Camera,
  ShoppingCart,
  Leaf,
  Utensils,
  Repeat,
  Brain,
  Moon,
  Dumbbell,
  Flame,
  Users,
  Receipt,
  Sparkles,
  Star,
  ArrowRight
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: Camera,
      title: "Bobby-Style Barcode Scanner",
      description: "Instant health analysis with red/yellow/green flags",
      color: "from-purple-500 to-blue-500",
      emoji: "📸"
    },
    {
      icon: Brain,
      title: "Restaurant Menu AI Decoder",
      description: "World's first AI menu analyzer - see calories & health scores",
      color: "from-orange-500 to-red-500",
      emoji: "🍽️",
      badge: "WORLD FIRST"
    },
    {
      icon: Leaf,
      title: "AI Food Waste Predictor",
      description: "Track fridge inventory, predict waste, get rescue recipes",
      color: "from-green-500 to-emerald-500",
      emoji: "🌱",
      badge: "WORLD FIRST"
    },
    {
      icon: Repeat,
      title: "Meal Swap Marketplace",
      description: "Trade meal prep with neighbors, reduce waste, build community",
      color: "from-orange-500 to-red-500",
      emoji: "🤝",
      badge: "WORLD FIRST"
    }
  ];

  const additionalFeatures = [
    { icon: ShoppingCart, title: "AI Shopping List", description: "Auto-generate from goals" },
    { icon: Receipt, title: "Receipt Scanner", description: "OCR nutrition tracking" },
    { icon: Dumbbell, title: "Workout Tracker", description: "Progressive overload" },
    { icon: Moon, title: "Sleep Tracking", description: "Quality metrics" },
    { icon: Flame, title: "Fasting Timer", description: "Intermittent fasting" },
    { icon: Users, title: "Family Sharing", description: "Track together" },
    { icon: Sparkles, title: "Voice Commands", description: "Hands-free control" },
    { icon: Target, title: "Smart Goals", description: "AI-calculated macros" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow mb-4 sm:mb-6 shadow-xl">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          
          <Badge className="mb-4 text-xs sm:text-sm">
            🚀 Revolutionary Fitness Platform
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent leading-tight">
            World's First AI-Powered<br />Sustainability-Focused Fitness App
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            4 World-First Innovations • 30+ Premium Features • Save the Planet While Getting Fit
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-base sm:text-lg px-6 sm:px-8 shadow-lg w-full sm:w-auto"
            >
              Start Free Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      </section>

      {/* World-First Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 sm:mb-12"
        >
          <Badge className="mb-3 text-xs sm:text-sm">🌍 WORLD-FIRST INNOVATIONS</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Features That Don't Exist Anywhere Else
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            We've built what the fitness industry has been waiting for
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {mainFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all h-full overflow-hidden group cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-4 sm:p-6 relative">
                  {feature.badge && (
                    <Badge className="absolute top-2 right-2 text-[10px] sm:text-xs bg-gradient-to-r from-yellow-500 to-orange-500">
                      {feature.badge}
                    </Badge>
                  )}
                  
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.emoji}</div>
                  
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}>
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold mb-2 leading-tight">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Plus 30+ Premium Features
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Everything you need for complete health transformation
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {additionalFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold mb-1 leading-tight">{feature.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: "4", label: "World-First Features", icon: Star },
            { value: "30+", label: "Premium Features", icon: Sparkles },
            { value: "100%", label: "Free to Start", icon: CheckCircle },
            { value: "🌍", label: "Planet-Friendly", icon: Leaf }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <Card className="border-0 shadow-lg text-center">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/20 to-primary/20" />
            <CardContent className="p-8 sm:p-12 text-center relative">
              <div className="text-4xl sm:text-5xl mb-4">🚀</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Ready to Transform Your Life?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
                Join the revolution. Get fit. Save the planet. Build community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-base sm:text-lg px-8 sm:px-12 shadow-xl w-full sm:w-auto"
                >
                  Start Your Journey Free
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="text-base sm:text-lg px-8 sm:px-12 w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>
              
              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8 px-4">
        <div className="container mx-auto text-center text-xs sm:text-sm text-muted-foreground">
          <p className="leading-relaxed">
            © 2025 FitTrack Pro. World's most advanced fitness & sustainability platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

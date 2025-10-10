import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Mic,
  Image as ImageIcon,
  Apple,
  Dumbbell,
  Target,
  TrendingUp,
  Heart,
  ChefHat,
  Lightbulb,
  MoreVertical,
  Loader2,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  quickActions?: Array<{
    label: string;
    icon: any;
    action: string;
  }>;
}

export default function AICoach() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    { icon: Apple, text: "What should I eat for breakfast?", category: "Nutrition" },
    { icon: Dumbbell, text: "Create a workout plan for me", category: "Fitness" },
    { icon: Target, text: "How can I lose 5kg this month?", category: "Goals" },
    { icon: ChefHat, text: "Give me a high-protein recipe", category: "Recipes" },
    { icon: TrendingUp, text: "Review my progress this week", category: "Progress" },
    { icon: Heart, text: "Tips for better sleep quality", category: "Health" }
  ];

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    await loadUserProfile(user.id);
    
    if (messages.length === 0) {
      addWelcomeMessage();
    }
  }

  async function loadUserProfile(uid: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      const { data: goal } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .maybeSingle();

      const { data: latestWeight } = await supabase
        .from('weight_logs')
        .select('weight_kg')
        .eq('user_id', uid)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      setUserProfile({
        ...profile,
        goal,
        current_weight: latestWeight?.weight_kg
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  function addWelcomeMessage() {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Hey there! 👋 I'm your AI Nutrition & Fitness Coach!\n\nI'm here to help you crush your goals! I can help with:\n\n🍎 Meal planning & nutrition advice\n💪 Workout recommendations\n📊 Progress tracking & analysis\n🎯 Goal setting & motivation\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
      quickActions: [
        { label: 'Meal Plan', icon: Apple, action: 'meal_plan' },
        { label: 'Workout', icon: Dumbbell, action: 'workout' },
        { label: 'Progress', icon: TrendingUp, action: 'progress' }
      ]
    };
    setMessages([welcomeMessage]);
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  async function sendMessage(content?: string) {
    const messageContent = content || inputMessage.trim();
    if (!messageContent || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const aiResponse = await generateAIResponse(messageContent, userProfile);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        quickActions: aiResponse.quickActions
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }

  async function generateAIResponse(message: string, profile: any) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('breakfast') || lowerMessage.includes('morning')) {
      return {
        content: `Great question! Based on your ${profile?.goal?.type || 'fitness'} goal, here are some awesome breakfast options:\n\n**High-Protein Breakfast Ideas:**\n\n🥚 **Greek Yogurt Power Bowl**\n• 200g Greek yogurt\n• 1/2 cup granola\n• Mixed berries\n• 1 tbsp honey\n*~380 cal, 25g protein*\n\n🍳 **Veggie Egg Scramble**\n• 3 eggs\n• Spinach, tomatoes, mushrooms\n• Whole grain toast\n*~350 cal, 28g protein*\n\n🥞 **Protein Pancakes**\n• 1 scoop protein powder\n• 1 banana\n• 2 eggs\n• Top with berries\n*~420 cal, 30g protein*\n\nWhich one sounds good to you? I can provide the full recipe! 📝`,
        suggestions: [
          "Give me the Greek Yogurt recipe",
          "What about lunch ideas?",
          "How many calories should I eat?"
        ],
        quickActions: [
          { label: 'Full Recipe', icon: ChefHat, action: 'recipe' },
          { label: 'Log Meal', icon: Apple, action: 'log_meal' }
        ]
      };
    }

    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('train')) {
      const frequency = profile?.workout_frequency || 3;
      return {
        content: `Let's build you an amazing workout plan! 💪\n\nBased on your profile, I recommend a **${profile?.workout_preference || 'Push/Pull/Legs'}** split, ${frequency}x per week.\n\n**This Week's Plan:**\n\n**Day 1 - Push (Chest, Shoulders, Triceps)**\n• Bench Press: 4x8-10\n• Overhead Press: 3x8-10\n• Incline Dumbbell Press: 3x10-12\n• Lateral Raises: 3x12-15\n• Tricep Dips: 3x10-12\n\n**Day 2 - Pull (Back, Biceps)**\n• Deadlifts: 4x6-8\n• Pull-ups: 3x8-10\n• Barbell Rows: 3x8-10\n• Face Pulls: 3x12-15\n• Bicep Curls: 3x10-12\n\n**Day 3 - Legs**\n• Squats: 4x8-10\n• Romanian Deadlifts: 3x10-12\n• Leg Press: 3x12-15\n• Leg Curls: 3x12-15\n• Calf Raises: 4x15-20\n\nReady to crush it? 🔥`,
        suggestions: [
          "Show me how to do bench press",
          "What about cardio?",
          "Create today's workout"
        ],
        quickActions: [
          { label: 'Start Workout', icon: Dumbbell, action: 'start_workout' },
          { label: 'Save Plan', icon: Target, action: 'save_plan' }
        ]
      };
    }

    if (lowerMessage.includes('lose') || lowerMessage.includes('fat') || lowerMessage.includes('weight loss')) {
      const currentWeight = profile?.current_weight || 80;
      const targetWeight = profile?.goal?.target_weight_kg || 75;
      const difference = currentWeight - targetWeight;
      
      return {
        content: `Let's create your fat loss strategy! 🎯\n\n**Your Goal:** ${currentWeight}kg → ${targetWeight}kg (${difference.toFixed(1)}kg to lose)\n\n**My Recommendations:**\n\n**1. Calorie Target** 🔥\nAim for a 500 calorie deficit:\n• Maintenance: ~2,200 cal/day\n• Target: ~1,700 cal/day\n• Expected loss: 0.5kg/week\n\n**2. Macros Split** 📊\n• Protein: 150g (35%)\n• Carbs: 170g (40%)\n• Fats: 47g (25%)\n\n**3. Key Strategies** 💡\n✓ Prioritize protein at every meal\n✓ Lift weights 3-4x/week to preserve muscle\n✓ 10k steps daily\n✓ Sleep 7-8 hours\n✓ Track consistently\n\n**4. Timeline** 📅\nAt 0.5kg/week, you'll reach your goal in ~${Math.ceil(difference / 0.5)} weeks!\n\nWant me to create a meal plan for this? 🍽️`,
        suggestions: [
          "Yes, create my meal plan",
          "What exercises burn most fat?",
          "Help me track my calories"
        ],
        quickActions: [
          { label: 'Meal Plan', icon: Apple, action: 'meal_plan' },
          { label: 'Track Calories', icon: Apple, action: 'track' }
        ]
      };
    }

    if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
      return {
        content: `I've got some amazing recipes for you! 👨‍🍳\n\nWhat type of meal are you looking for?\n\n🍳 **Breakfast** - Quick & protein-packed\n🥗 **Lunch** - Filling & nutritious\n🍛 **Dinner** - Satisfying & delicious\n🍪 **Snacks** - Healthy & tasty\n\nOr tell me:\n• Your dietary preferences (vegan, keto, etc.)\n• Cuisine type (Italian, Asian, Mexican)\n• Cooking time available\n• Calorie target\n\nI'll find the perfect recipe! ✨`,
        suggestions: [
          "High protein dinner recipe",
          "Quick lunch under 500 calories",
          "Vegan meal ideas"
        ],
        quickActions: [
          { label: 'Browse Recipes', icon: ChefHat, action: 'recipes' }
        ]
      };
    }

    if (lowerMessage.includes('progress') || lowerMessage.includes('review') || lowerMessage.includes('how am i doing')) {
      return {
        content: `Let me check your progress! 📊\n\n**This Week's Summary:**\n\n✅ **Logging Streak:** 5 days - Great job!\n💪 **Workouts:** 3 completed\n🍎 **Nutrition:** 85% on target\n⚖️ **Weight:** -0.4kg (trending down!)\n\n**Highlights:** 🌟\n• You hit your protein goal 6/7 days!\n• Consistent calorie deficit\n• 3 strength training sessions ✓\n\n**Areas to Improve:** 💡\n• Water intake: avg 1.5L (aim for 2.5L)\n• Sleep: 6.5hrs avg (aim for 7-8hrs)\n\n**Next Steps:**\n1. Keep up the amazing consistency! 🔥\n2. Focus on hydration this week\n3. Prioritize sleep for better recovery\n\nYou're doing awesome! Keep it up! 💪`,
        suggestions: [
          "How can I improve my sleep?",
          "Set a water reminder",
          "What's my weekly goal?"
        ],
        quickActions: [
          { label: 'Full Stats', icon: TrendingUp, action: 'stats' },
          { label: 'Set Goals', icon: Target, action: 'goals' }
        ]
      };
    }

    return {
      content: `I'm here to help! I can assist with:\n\n🍎 **Nutrition:** Meal planning, calorie tracking, macros\n💪 **Fitness:** Workout plans, exercise form, programming\n📊 **Progress:** Tracking stats, analyzing trends\n🎯 **Goals:** Setting targets, staying motivated\n\nWhat would you like to know more about?`,
      suggestions: [
        "What should I eat today?",
        "Create a workout plan",
        "How do I lose weight?"
      ],
      quickActions: [
        { label: 'Meal Plan', icon: Apple, action: 'meal_plan' },
        { label: 'Workout', icon: Dumbbell, action: 'workout' }
      ]
    };
  }

  function handleQuickAction(action: string) {
    switch (action) {
      case 'meal_plan':
        sendMessage("Create a meal plan for me based on my goals");
        break;
      case 'workout':
        sendMessage("Create a workout plan for me");
        break;
      case 'progress':
        sendMessage("Show me my progress this week");
        break;
      case 'recipe':
      case 'recipes':
        navigate('/recipes');
        break;
      case 'start_workout':
        navigate('/train');
        break;
      case 'stats':
        navigate('/reports');
        break;
      case 'goals':
      case 'save_plan':
        navigate('/settings');
        break;
      case 'track':
      case 'log_meal':
        navigate('/eat');
        break;
      default:
        break;
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  }

  const FloatingOrb = ({ delay = 0, color = "purple" }: any) => (
    <motion.div
      className={`absolute w-64 h-64 rounded-full bg-gradient-to-br ${
        color === 'purple' ? 'from-purple-500/20 to-pink-500/20' :
        color === 'blue' ? 'from-blue-500/20 to-cyan-500/20' :
        'from-orange-500/20 to-red-500/20'
      } blur-3xl`}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="purple" />
        <FloatingOrb delay={2} color="blue" />
        <FloatingOrb delay={4} color="orange" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-50"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  AI Nutrition Coach
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm text-muted-foreground">Always here to help</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col border-0 shadow-2xl backdrop-blur-xl bg-background/95 overflow-hidden">
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <Avatar className="w-10 h-10 border-2 border-border">
                            {message.role === 'assistant' ? (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <AvatarFallback>{userProfile?.full_name?.[0] || 'U'}</AvatarFallback>
                            )}
                          </Avatar>
                        </motion.div>

                        <div className="flex-1">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-2xl ${
                              message.role === 'user'
                                ? 'bg-gradient-to-br from-primary to-purple-500 text-primary-foreground'
                                : 'bg-secondary'
                            }`}
                            style={{
                              transformStyle: 'preserve-3d',
                              boxShadow: message.role === 'assistant' 
                                ? '0 4px 20px rgba(0,0,0,0.1)'
                                : '0 4px 20px rgba(139,92,246,0.3)'
                            }}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </motion.div>

                          <p className="text-xs text-muted-foreground mt-1 px-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>

                          {message.quickActions && message.quickActions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex flex-wrap gap-2 mt-3"
                            >
                              {message.quickActions.map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                  <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleQuickAction(action.action)}
                                    className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all flex items-center gap-2"
                                    style={{ transformStyle: 'preserve-3d' }}
                                  >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{action.label}</span>
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          )}

                          {message.suggestions && message.suggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="flex flex-wrap gap-2 mt-3"
                            >
                              {message.suggestions.map((suggestion, idx) => (
                                <motion.button
                                  key={idx}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="px-3 py-1.5 rounded-full bg-background hover:bg-secondary border border-border text-sm transition-all"
                                >
                                  {suggestion}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 mb-6"
                  >
                    <Avatar className="w-10 h-10 border-2 border-border">
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </Avatar>
                    <div className="p-4 rounded-2xl bg-secondary">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </ScrollArea>

              <div className="p-4 border-t border-border/50 backdrop-blur-xl bg-background/50">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Ask me anything about nutrition, fitness, or health..."
                      className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-background"
                      disabled={loading}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => sendMessage()}
                      disabled={!inputMessage.trim() || loading}
                      size="icon"
                      className="h-[60px] w-[60px] rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Send className="w-6 h-6" />
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>
          </div>

          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-80"
            >
              <Card className="border-0 shadow-2xl backdrop-blur-xl bg-background/95 h-full">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Try asking...
                  </h3>
                  
                  <div className="space-y-3">
                    {suggestedPrompts.map((prompt, index) => {
                      const Icon = prompt.icon;
                      return (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.03, x: 5 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => sendMessage(prompt.text)}
                          className="w-full p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary hover:from-secondary hover:to-secondary/80 border border-border/50 transition-all text-left"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-2 text-xs">
                                {prompt.category}
                              </Badge>
                              <p className="text-sm font-medium leading-relaxed">{prompt.text}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/50">
                    <h4 className="font-semibold text-sm mb-3 text-muted-foreground">AI CAPABILITIES</h4>
                    <div className="space-y-2">
                      {[
                        { icon: Apple, text: 'Personalized meal plans' },
                        { icon: Dumbbell, text: 'Custom workout programs' },
                        { icon: TrendingUp, text: 'Progress analysis' },
                        { icon: Heart, text: 'Health recommendations' },
                        { icon: Target, text: 'Goal tracking' },
                        { icon: Zap, text: 'Real-time answers' }
                      ].map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Icon className="w-4 h-4 text-primary" />
                            <span>{feature.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

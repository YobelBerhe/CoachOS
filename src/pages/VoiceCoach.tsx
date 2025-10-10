import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  Heart,
  Dumbbell,
  Apple,
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  Flame,
  CheckCircle2,
  MessageCircle,
  Settings,
  Info,
  User,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: string;
  category?: 'workout' | 'nutrition' | 'motivation' | 'general';
}

interface WorkoutSession {
  exercise: string;
  reps: number;
  sets: number;
  current_set: number;
  rest_time: number;
}

interface CoachPersonality {
  name: string;
  avatar: string;
  style: string;
  description: string;
}

const COACH_PERSONALITIES: CoachPersonality[] = [
  {
    name: 'Max Power',
    avatar: '💪',
    style: 'intense',
    description: 'High-energy, motivational, pushes you to your limits'
  },
  {
    name: 'Zen Master',
    avatar: '🧘',
    style: 'calm',
    description: 'Calm, mindful, focuses on form and breathing'
  },
  {
    name: 'Sarah Swift',
    avatar: '⚡',
    style: 'encouraging',
    description: 'Encouraging, positive, celebrates every achievement'
  },
  {
    name: 'Coach Tech',
    avatar: '🤖',
    style: 'analytical',
    description: 'Data-driven, precise, focuses on technique and metrics'
  }
];

const SAMPLE_RESPONSES: { [key: string]: string[] } = {
  greeting: [
    "Hey champion! Ready to crush today's workout? 💪",
    "Welcome back! Let's make today count! 🔥",
    "What's up, athlete? Time to get after it!",
    "Ready to dominate? Let's do this! ⚡"
  ],
  workout_start: [
    "Let's start strong! Remember, proper form over everything. You got this!",
    "Time to work! Focus on the movement, control the weight, own each rep!",
    "Here we go! Stay focused, stay strong, and let's make it happen!",
    "Workout mode activated! Let's push those limits today!"
  ],
  motivation: [
    "You're doing amazing! Every rep counts! 💪",
    "That's the spirit! Keep that energy up! 🔥",
    "Phenomenal work! You're stronger than you think!",
    "Look at you go! This is YOUR time to shine! ⭐"
  ],
  rest: [
    "Take 60 seconds. Breathe deep, recover, and get ready for the next set!",
    "Rest time! Hydrate, shake it out, you've earned this break.",
    "Good set! Catch your breath. Next one's coming up!",
    "Rest up, warrior. Visualize crushing this next set!"
  ],
  complete: [
    "Incredible work today! You showed up and gave it your all! 🏆",
    "Workout complete! That's how champions are made! 👑",
    "You crushed it! Every rep, every set - perfection! 💎",
    "Amazing session! Your dedication is inspiring! 🌟"
  ],
  nutrition: [
    "Great question! For muscle recovery, aim for 20-30g of protein within 2 hours post-workout.",
    "Nutrition is 70% of the game! Focus on whole foods, lean proteins, and complex carbs.",
    "Hydration is key! Aim for at least 3 liters of water daily, more if you're training hard.",
    "Pre-workout: light carbs and protein 1-2 hours before. Post-workout: protein and carbs!"
  ]
};

export default function VoiceCoach() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<'workout' | 'nutrition' | 'chat'>('chat');
  const [selectedCoach, setSelectedCoach] = useState<CoachPersonality>(COACH_PERSONALITIES[0]);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Welcome message
    addMessage('coach', getRandomResponse('greeting'), 'general');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function getRandomResponse(category: string): string {
    const responses = SAMPLE_RESPONSES[category] || SAMPLE_RESPONSES.greeting;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function addMessage(type: 'user' | 'coach', content: string, category?: string) {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      category
    };
    setMessages(prev => [...prev, message]);
  }

  async function startListening() {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsListening(true);
      visualizeAudio();
      
      toast({ title: "Listening... 🎤" });
      
      // Simulate speech recognition (in production, use Web Speech API)
      setTimeout(() => {
        simulateUserInput();
      }, 2000);
      
    } catch (error) {
      console.error('Microphone error:', error);
      toast({
        title: "Microphone access denied",
        description: "Please enable microphone permissions",
        variant: "destructive"
      });
    }
  }

  function stopListening() {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
  }

  function visualizeAudio() {
    if (!analyserRef.current || !isListening) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const animate = () => {
      if (!isListening) return;
      
      analyserRef.current?.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  function simulateUserInput() {
    const userInputs = [
      { text: "How do I do a proper squat?", mode: 'workout' },
      { text: "What should I eat before a workout?", mode: 'nutrition' },
      { text: "I need motivation!", mode: 'chat' },
      { text: "Start leg day workout", mode: 'workout' },
      { text: "How much protein do I need?", mode: 'nutrition' }
    ];
    
    const input = userInputs[Math.floor(Math.random() * userInputs.length)];
    
    addMessage('user', input.text, input.mode as any);
    stopListening();
    
    // Coach responds
    setTimeout(() => {
      respondToUser(input.text, input.mode);
    }, 1000);
  }

  function respondToUser(userInput: string, mode: string) {
    setIsSpeaking(true);
    
    let response = '';
    let category: any = 'general';
    
    if (userInput.toLowerCase().includes('squat')) {
      response = "Perfect! For squats: Stand with feet shoulder-width apart, keep your chest up, push your hips back, and lower until thighs are parallel. Drive through your heels to stand. Keep your core tight and back straight throughout! 💪";
      category = 'workout';
    } else if (userInput.toLowerCase().includes('eat') || userInput.toLowerCase().includes('protein')) {
      response = getRandomResponse('nutrition');
      category = 'nutrition';
    } else if (userInput.toLowerCase().includes('motivation')) {
      response = getRandomResponse('motivation');
      category = 'motivation';
    } else if (userInput.toLowerCase().includes('start')) {
      response = getRandomResponse('workout_start');
      category = 'workout';
      startWorkoutSession();
    } else {
      response = "Great question! I'm here to help you with workouts, nutrition, and motivation. What would you like to know more about?";
    }
    
    addMessage('coach', response, category);
    
    // Simulate text-to-speech
    if (!isMuted) {
      speak(response);
    }
    
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  }

  function speak(text: string) {
    // In production, use Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = isMuted ? 0 : 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  function startWorkoutSession() {
    const session: WorkoutSession = {
      exercise: 'Squats',
      reps: 12,
      sets: 3,
      current_set: 1,
      rest_time: 60
    };
    setWorkoutSession(session);
    setCurrentMode('workout');
  }

  function completeSet() {
    if (!workoutSession) return;
    
    if (workoutSession.current_set < workoutSession.sets) {
      setWorkoutSession({
        ...workoutSession,
        current_set: workoutSession.current_set + 1
      });
      
      const restMessage = getRandomResponse('rest');
      addMessage('coach', restMessage, 'workout');
      if (!isMuted) speak(restMessage);
      
      // Start rest timer
      setTimeout(() => {
        const nextSetMessage = `Set ${workoutSession.current_set + 1} - Let's go! ${workoutSession.reps} reps!`;
        addMessage('coach', nextSetMessage, 'workout');
        if (!isMuted) speak(nextSetMessage);
      }, workoutSession.rest_time * 1000);
      
    } else {
      setWorkoutSession(null);
      const completeMessage = getRandomResponse('complete');
      addMessage('coach', completeMessage, 'workout');
      if (!isMuted) speak(completeMessage);
      
      toast({
        title: "Workout Complete! 🏆",
        description: "Amazing work today!"
      });
    }
  }

  const FloatingOrb = ({ delay = 0, color = "purple" }: any) => (
    <motion.div
      className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${
        color === 'purple' ? 'from-purple-500/20 to-pink-500/20' :
        color === 'blue' ? 'from-blue-500/20 to-cyan-500/20' :
        'from-green-500/20 to-emerald-500/20'
      } blur-3xl`}
      animate={{
        y: [0, -40, 0],
        x: [0, 30, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="purple" />
        <FloatingOrb delay={3} color="blue" />
        <FloatingOrb delay={6} color="green" />
      </div>

      {/* Header */}
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
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-purple-500" />
                  AI Voice Coach
                </h1>
                <p className="text-sm text-muted-foreground">Your personal fitness assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-full"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mode Tabs */}
          <Tabs value={currentMode} onValueChange={(v) => setCurrentMode(v as any)} className="mt-4">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-secondary/50">
              <TabsTrigger value="chat">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="workout">
                <Dumbbell className="w-4 h-4 mr-2" />
                Workout
              </TabsTrigger>
              <TabsTrigger value="nutrition">
                <Apple className="w-4 h-4 mr-2" />
                Nutrition
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Coach Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isSpeaking ? Infinity : 0,
            }}
            className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl shadow-2xl"
          >
            {selectedCoach.avatar}
          </motion.div>
          <h2 className="text-2xl font-bold mb-1">{selectedCoach.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedCoach.description}</p>
        </motion.div>

        {/* Active Workout Session */}
        {workoutSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-blue-500" />
                    {workoutSession.exercise}
                  </h3>
                  <Badge className="text-lg px-4 py-2">
                    Set {workoutSession.current_set}/{workoutSession.sets}
                  </Badge>
                </div>

                <div className="text-center mb-4">
                  <p className="text-5xl font-bold mb-2">{workoutSession.reps}</p>
                  <p className="text-muted-foreground">Reps</p>
                </div>

                <Button
                  onClick={completeSet}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Complete Set
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chat Messages */}
        <Card className="border-0 shadow-2xl mb-6">
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-secondary'
                      }`}
                    >
                      <p className="text-sm mb-1">{message.content}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                        {message.category && (
                          <Badge variant="secondary" className="text-xs">
                            {message.category === 'workout' && <Dumbbell className="w-3 h-3" />}
                            {message.category === 'nutrition' && <Apple className="w-3 h-3" />}
                            {message.category === 'motivation' && <Flame className="w-3 h-3" />}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center">
              {/* Audio Visualization */}
              {isListening && (
                <motion.div
                  className="mb-6 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                      animate={{
                        height: [20, 40 + audioLevel * 60, 20],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Main Control Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl mb-4 mx-auto ${
                  isListening
                    ? 'bg-gradient-to-br from-red-500 to-orange-500'
                    : isSpeaking
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 animate-pulse'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-16 h-16 text-white" />
                ) : isSpeaking ? (
                  <Volume2 className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </motion.button>

              <p className="text-lg font-semibold mb-2">
                {isListening
                  ? "Listening..."
                  : isSpeaking
                  ? "Coach Speaking..."
                  : "Tap to Talk"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentMode === 'workout' && "Ask about exercises, form, and technique"}
                {currentMode === 'nutrition' && "Ask about diet, meals, and supplements"}
                {currentMode === 'chat' && "Chat about anything fitness-related"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  addMessage('user', "Give me motivation!", 'motivation');
                  setTimeout(() => {
                    respondToUser("Give me motivation!", 'chat');
                  }, 500);
                }}
              >
                <Flame className="w-4 h-4 mr-2" />
                Motivate Me
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  addMessage('user', "Start a workout", 'workout');
                  setTimeout(() => {
                    respondToUser("Start leg day workout", 'workout');
                  }, 500);
                }}
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mt-6"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{messages.length}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                {messages.filter(m => m.category === 'workout').length}
              </p>
              <p className="text-xs text-muted-foreground">Workout Tips</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Apple className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">
                {messages.filter(m => m.category === 'nutrition').length}
              </p>
              <p className="text-xs text-muted-foreground">Nutrition Tips</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Coach Settings</DialogTitle>
            <DialogDescription>Customize your coaching experience</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Coach Selection */}
            <div>
              <h3 className="font-bold mb-3">Select Coach</h3>
              <div className="grid grid-cols-2 gap-3">
                {COACH_PERSONALITIES.map((coach) => (
                  <Card
                    key={coach.name}
                    className={`cursor-pointer transition-all ${
                      selectedCoach.name === coach.name
                        ? 'ring-2 ring-primary'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedCoach(coach)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{coach.avatar}</div>
                      <p className="font-semibold text-sm mb-1">{coach.name}</p>
                      <p className="text-xs text-muted-foreground">{coach.style}</p>
                      {selectedCoach.name === coach.name && (
                        <CheckCircle2 className="w-5 h-5 mx-auto mt-2 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Voice Settings */}
            <div>
              <h3 className="font-bold mb-3">Voice Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm">Voice Feedback</span>
                  <Button
                    variant={isMuted ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? "Off" : "On"}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm">Auto-listen</span>
                  <Button variant="outline" size="sm">
                    Off
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowSettings(false)} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

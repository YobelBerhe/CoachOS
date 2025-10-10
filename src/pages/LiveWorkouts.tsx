import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Radio,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Users,
  TrendingUp,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  MoreVertical,
  Send,
  Smile,
  DollarSign,
  Crown,
  Zap,
  Flame,
  Award,
  Calendar,
  Clock,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Plus,
  Search,
  Filter,
  Bell,
  BellOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  streamer: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    is_verified: boolean;
    followers: number;
  };
  thumbnail: string;
  viewer_count: number;
  duration: string;
  category: string;
  tags: string[];
  is_live: boolean;
  scheduled_time?: string;
}

interface ChatMessage {
  id: string;
  user: {
    name: string;
    avatar: string;
    username: string;
    is_premium: boolean;
  };
  message: string;
  timestamp: string;
  type: 'message' | 'tip' | 'subscription' | 'follow';
  amount?: number;
}

// Sample live streams
const SAMPLE_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'INTENSE LEG DAY - Join Me! 💪🔥',
    description: 'Crushing squats, lunges, and more! Come train with me!',
    streamer: {
      id: '1',
      name: 'Sarah Johnson',
      username: 'sarahfitness',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      is_verified: true,
      followers: 125000
    },
    thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=450&fit=crop',
    viewer_count: 3847,
    duration: '45:23',
    category: 'Strength Training',
    tags: ['Legs', 'Squats', 'HIIT', 'Advanced'],
    is_live: true
  },
  {
    id: '2',
    title: 'Morning Yoga Flow ☀️🧘‍♀️',
    description: 'Start your day with energy and peace',
    streamer: {
      id: '2',
      name: 'Emily Rodriguez',
      username: 'emilyeats',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      is_verified: true,
      followers: 89000
    },
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop',
    viewer_count: 2156,
    duration: '32:15',
    category: 'Yoga',
    tags: ['Morning', 'Flexibility', 'Beginner'],
    is_live: true
  },
  {
    id: '3',
    title: '10K Run Training - Let\'s Go! 🏃‍♂️',
    description: 'Outdoor running session with tips and motivation',
    streamer: {
      id: '3',
      name: 'Mike Chen',
      username: 'mikesgains',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      is_verified: false,
      followers: 45000
    },
    thumbnail: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=450&fit=crop',
    viewer_count: 892,
    duration: '28:45',
    category: 'Cardio',
    tags: ['Running', 'Outdoor', 'Endurance'],
    is_live: true
  },
  {
    id: '4',
    title: 'NUTRITION Q&A - AMA! 🥗',
    description: 'Ask me anything about nutrition and meal planning',
    streamer: {
      id: '2',
      name: 'Emily Rodriguez',
      username: 'emilyeats',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      is_verified: true,
      followers: 89000
    },
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=450&fit=crop',
    viewer_count: 0,
    duration: '',
    category: 'Nutrition',
    tags: ['Q&A', 'Nutrition', 'Meal Prep'],
    is_live: false,
    scheduled_time: 'Today at 6:00 PM'
  }
];

const SAMPLE_CHAT: ChatMessage[] = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      username: 'johndoe',
      is_premium: true
    },
    message: 'This workout is insane! 🔥',
    timestamp: '2m ago',
    type: 'message'
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      username: 'janesmith',
      is_premium: false
    },
    message: 'Thanks for the motivation! 💪',
    timestamp: '1m ago',
    type: 'message'
  },
  {
    id: '3',
    user: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      username: 'alexlifts',
      is_premium: true
    },
    message: 'Sent $5.00',
    timestamp: '30s ago',
    type: 'tip',
    amount: 5
  }
];

export default function LiveWorkouts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [streams, setStreams] = useState<LiveStream[]>(SAMPLE_STREAMS);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SAMPLE_CHAT);
  const [newMessage, setNewMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [tipAmount, setTipAmount] = useState('5');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  function openStream(stream: LiveStream) {
    if (!stream.is_live) {
      toast({
        title: "Stream not live yet",
        description: `Scheduled for ${stream.scheduled_time}`
      });
      return;
    }
    setSelectedStream(stream);
    setShowPlayer(true);
  }

  function sendMessage() {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: '',
        username: 'you',
        is_premium: false
      },
      message: newMessage,
      timestamp: 'Just now',
      type: 'message'
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  }

  function sendTip() {
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid amount",
        variant: "destructive"
      });
      return;
    }

    const tipMessage: ChatMessage = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: '',
        username: 'you',
        is_premium: false
      },
      message: `Sent $${amount.toFixed(2)}`,
      timestamp: 'Just now',
      type: 'tip',
      amount
    };

    setChatMessages([...chatMessages, tipMessage]);
    setShowTipDialog(false);
    toast({
      title: "Tip sent! 💰",
      description: `$${amount.toFixed(2)} sent to ${selectedStream?.streamer.name}`
    });
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  }

  const filteredStreams = streams.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.streamer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const liveStreams = filteredStreams.filter(s => s.is_live);
  const scheduledStreams = filteredStreams.filter(s => !s.is_live);

  const FloatingOrb = ({ delay = 0, color = "red" }: any) => (
    <motion.div
      className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${
        color === 'red' ? 'from-red-500/20 to-orange-500/20' :
        color === 'blue' ? 'from-blue-500/20 to-cyan-500/20' :
        'from-purple-500/20 to-pink-500/20'
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

  const StreamCard = ({ stream }: { stream: LiveStream }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => openStream(stream)}
      className="cursor-pointer"
    >
      <Card className="border-0 shadow-2xl overflow-hidden">
        <div className="relative">
          {stream.is_live && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-3 left-3 z-10"
            >
              <Badge className="bg-red-500 text-white border-0 gap-1 px-3">
                <Radio className="w-3 h-3" />
                LIVE
              </Badge>
            </motion.div>
          )}

          <div className="relative h-48 overflow-hidden">
            <img
              src={stream.thumbnail}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {stream.is_live && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/70 backdrop-blur text-white border-0 gap-1">
                  <Eye className="w-3 h-3" />
                  {formatNumber(stream.viewer_count)}
                </Badge>
              </div>
            )}

            {stream.duration && (
              <Badge className="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white border-0">
                {stream.duration}
              </Badge>
            )}

            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold line-clamp-1 mb-1">{stream.title}</h3>
              <Badge variant="secondary" className="text-xs">{stream.category}</Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-border">
              <AvatarImage src={stream.streamer.avatar} />
              <AvatarFallback>{stream.streamer.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm truncate">{stream.streamer.name}</p>
                {stream.streamer.is_verified && (
                  <Star className="w-3 h-3 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stream.streamer.followers)} followers
              </p>
            </div>
          </div>

          {!stream.is_live && stream.scheduled_time && (
            <div className="mt-3 p-2 rounded-lg bg-secondary text-center">
              <p className="text-xs font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                {stream.scheduled_time}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-red-500/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="red" />
        <FloatingOrb delay={3} color="blue" />
        <FloatingOrb delay={6} color="purple" />
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
                  <Radio className="w-6 h-6 text-red-500" />
                  Live Workouts
                </h1>
                <p className="text-sm text-muted-foreground">Train together in real-time</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                Go Live
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search streams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {['all', 'Strength Training', 'Cardio', 'Yoga', 'Nutrition'].map(cat => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(cat)}
                  className="whitespace-nowrap"
                >
                  {cat === 'all' ? 'All' : cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20" />
            <CardContent className="p-6 relative">
              <Radio className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-3xl font-bold mb-1">{liveStreams.length}</p>
              <p className="text-sm text-muted-foreground">Live Now</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            <CardContent className="p-6 relative">
              <Eye className="w-10 h-10 text-blue-500 mb-3" />
              <p className="text-3xl font-bold mb-1">
                {formatNumber(liveStreams.reduce((acc, s) => acc + s.viewer_count, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Total Viewers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            <CardContent className="p-6 relative">
              <Calendar className="w-10 h-10 text-purple-500 mb-3" />
              <p className="text-3xl font-bold mb-1">{scheduledStreams.length}</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Streams */}
        {liveStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-500" />
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StreamCard stream={stream} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Streams */}
        {scheduledStreams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Scheduled Streams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledStreams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StreamCard stream={stream} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filteredStreams.length === 0 && (
          <Card className="border-2 border-dashed p-12 text-center">
            <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">No streams found</p>
            <Button onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Live Stream Player Dialog */}
      <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          {selectedStream && (
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[90vh]">
              {/* Video Player */}
              <div className="lg:col-span-2 bg-black flex flex-col">
                {/* Video */}
                <div className="flex-1 relative flex items-center justify-center">
                  <img
                    src={selectedStream.thumbnail}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Live Badge */}
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 left-4"
                  >
                    <Badge className="bg-red-500 text-white border-0 gap-2 px-4 py-2 text-sm">
                      <Radio className="w-4 h-4" />
                      LIVE
                    </Badge>
                  </motion.div>

                  {/* Viewer Count */}
                  <Badge className="absolute top-4 right-4 bg-black/70 backdrop-blur text-white border-0 gap-2 px-4 py-2">
                    <Eye className="w-4 h-4" />
                    {formatNumber(selectedStream.viewer_count)} watching
                  </Badge>

                  {/* Play/Pause Overlay */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-20 h-20 text-white" />
                    ) : (
                      <Play className="w-20 h-20 text-white" />
                    )}
                  </motion.button>
                </div>

                {/* Controls */}
                <div className="p-4 bg-black/90 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <span className="text-white text-sm">{selectedStream.duration}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4 bg-background border-t">
                  <h3 className="text-xl font-bold mb-2">{selectedStream.title}</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10 cursor-pointer" onClick={() => navigate(`/profile/${selectedStream.streamer.username}`)}>
                      <AvatarImage src={selectedStream.streamer.avatar} />
                      <AvatarFallback>{selectedStream.streamer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/profile/${selectedStream.streamer.username}`)}>
                          {selectedStream.streamer.name}
                        </p>
                        {selectedStream.streamer.is_verified && (
                          <Star className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(selectedStream.streamer.followers)} followers
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Follow</Button>
                    <Button 
                      size="sm" 
                      className="gap-1 bg-gradient-to-r from-yellow-500 to-orange-500"
                      onClick={() => setShowTipDialog(true)}
                    >
                      <Gift className="w-4 h-4" />
                      Tip
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedStream.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="flex flex-col bg-background border-l">
                <div className="p-4 border-b">
                  <h3 className="font-bold">Live Chat</h3>
                  <p className="text-xs text-muted-foreground">{formatNumber(selectedStream.viewer_count)} viewers</p>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {chatMessages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={msg.user.avatar} />
                          <AvatarFallback>{msg.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-semibold text-sm truncate">
                              {msg.user.name}
                            </span>
                            {msg.user.is_premium && (
                              <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          {msg.type === 'tip' ? (
                            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Gift className="w-4 h-4 text-yellow-500" />
                                {msg.message}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm break-words">{msg.message}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Send a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tip Dialog */}
      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send a Tip</DialogTitle>
            <DialogDescription>
              Support {selectedStream?.streamer.name} with a tip
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map(amount => (
                <Button
                  key={amount}
                  variant={tipAmount === amount.toString() ? 'default' : 'outline'}
                  onClick={() => setTipAmount(amount.toString())}
                  className="h-16"
                >
                  <div className="text-center">
                    <DollarSign className="w-5 h-5 mx-auto mb-1" />
                    <span className="font-bold">{amount}</span>
                  </div>
                </Button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Custom Amount</label>
              <Input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTipDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={sendTip}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                Send ${tipAmount}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

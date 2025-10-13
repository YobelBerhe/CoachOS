import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Target,
  Users,
  Clock,
  TrendingUp,
  Award,
  Star,
  Crown,
  Zap,
  Calendar,
  Plus,
  Share2,
  Eye,
  UserPlus,
  CheckCircle2,
  Timer,
  Dumbbell,
  Heart,
  Activity,
  Medal,
  Sparkles,
  Gift,
  DollarSign,
  MapPin,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'workout' | 'steps' | 'calories' | 'weight' | 'streak' | 'custom';
  duration: number; // in days
  goal: number;
  unit: string;
  prize?: string;
  participants: number;
  max_participants?: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  start_date: string;
  end_date: string;
  is_joined: boolean;
  is_featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  current_progress?: number;
  status: 'upcoming' | 'active' | 'completed';
  image: string;
  leaderboard?: LeaderboardEntry[];
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  progress: number;
  completed: boolean;
}

// Sample challenges
const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: '30-Day Squat Challenge',
    description: 'Complete 1000 squats in 30 days! Build stronger legs and glutes. Perfect for all fitness levels.',
    type: 'workout',
    duration: 30,
    goal: 1000,
    unit: 'squats',
    prize: '$100 Amazon Gift Card',
    participants: 2847,
    max_participants: 5000,
    creator: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      username: 'sarahfitness'
    },
    start_date: 'Nov 1, 2024',
    end_date: 'Nov 30, 2024',
    is_joined: true,
    is_featured: true,
    difficulty: 'intermediate',
    category: 'Strength',
    current_progress: 340,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=400&fit=crop',
    leaderboard: [
      {
        rank: 1,
        user: {
          id: '1',
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          username: 'mikesgains'
        },
        progress: 95,
        completed: false
      },
      {
        rank: 2,
        user: {
          id: '2',
          name: 'Emily Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
          username: 'emilyeats'
        },
        progress: 89,
        completed: false
      },
      {
        rank: 3,
        user: {
          id: '3',
          name: 'You',
          avatar: '',
          username: 'you'
        },
        progress: 34,
        completed: false
      }
    ]
  },
  {
    id: '2',
    title: '10K Steps Daily Challenge',
    description: 'Walk 10,000 steps every day for 7 days straight. Build the habit of daily movement!',
    type: 'steps',
    duration: 7,
    goal: 70000,
    unit: 'steps',
    participants: 5421,
    creator: {
      id: '2',
      name: 'DayAI Team',
      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
      username: 'fittrack'
    },
    start_date: 'Nov 10, 2024',
    end_date: 'Nov 17, 2024',
    is_joined: false,
    is_featured: true,
    difficulty: 'beginner',
    category: 'Cardio',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=400&fit=crop'
  },
  {
    id: '3',
    title: 'Plant-Based November',
    description: 'Try eating plant-based for 30 days! Track your meals and see how you feel.',
    type: 'custom',
    duration: 30,
    goal: 30,
    unit: 'days',
    prize: 'Nutrition Coaching Session',
    participants: 1234,
    max_participants: 2000,
    creator: {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      username: 'emilyeats'
    },
    start_date: 'Nov 1, 2024',
    end_date: 'Nov 30, 2024',
    is_joined: true,
    is_featured: false,
    difficulty: 'intermediate',
    category: 'Nutrition',
    current_progress: 12,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop'
  },
  {
    id: '4',
    title: 'Push-Up Mastery',
    description: 'Complete 500 push-ups in 14 days. Build upper body strength and endurance!',
    type: 'workout',
    duration: 14,
    goal: 500,
    unit: 'push-ups',
    prize: '3 Months Premium Free',
    participants: 3891,
    creator: {
      id: '4',
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      username: 'alexlifts'
    },
    start_date: 'Nov 15, 2024',
    end_date: 'Nov 29, 2024',
    is_joined: false,
    is_featured: false,
    difficulty: 'advanced',
    category: 'Strength',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=400&fit=crop'
  },
  {
    id: '5',
    title: 'Water Challenge',
    description: 'Drink 8 glasses of water daily for 21 days. Build a healthy hydration habit!',
    type: 'custom',
    duration: 21,
    goal: 168,
    unit: 'glasses',
    participants: 6234,
    creator: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      username: 'sarahfitness'
    },
    start_date: 'Nov 5, 2024',
    end_date: 'Nov 26, 2024',
    is_joined: true,
    is_featured: false,
    difficulty: 'beginner',
    category: 'Wellness',
    current_progress: 56,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&h=400&fit=crop'
  }
];

export default function Challenges() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [challenges, setChallenges] = useState<Challenge[]>(SAMPLE_CHALLENGES);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>(SAMPLE_CHALLENGES);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeDetail, setShowChallengeDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    filterChallenges();
  }, [activeTab, searchQuery, filterDifficulty, filterCategory]);

  function filterChallenges() {
    let filtered = challenges;

    // Filter by tab
    if (activeTab === 'joined') {
      filtered = filtered.filter(c => c.is_joined);
    } else if (activeTab === 'active') {
      filtered = filtered.filter(c => c.status === 'active');
    } else if (activeTab === 'upcoming') {
      filtered = filtered.filter(c => c.status === 'upcoming');
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === filterDifficulty);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category === filterCategory);
    }

    setFilteredChallenges(filtered);
  }

  function joinChallenge(challengeId: string) {
    setChallenges(challenges.map(c =>
      c.id === challengeId ? { ...c, is_joined: true, participants: c.participants + 1 } : c
    ));
    toast({
      title: "Challenge joined! 🎉",
      description: "Good luck! You got this! 💪"
    });
  }

  function leaveChallenge(challengeId: string) {
    setChallenges(challenges.map(c =>
      c.id === challengeId ? { ...c, is_joined: false, participants: c.participants - 1 } : c
    ));
    toast({ title: "Left challenge" });
  }

  function openChallengeDetail(challenge: Challenge) {
    setSelectedChallenge(challenge);
    setShowChallengeDetail(true);
  }

  function shareChallenge(challenge: Challenge) {
    const url = `${window.location.origin}/challenges/${challenge.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied! 🔗" });
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  }

  const FloatingOrb = ({ delay = 0, color = "orange" }: any) => (
    <motion.div
      className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${
        color === 'orange' ? 'from-orange-500/20 to-red-500/20' :
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

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const progress = challenge.current_progress ? (challenge.current_progress / challenge.goal) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        onClick={() => openChallengeDetail(challenge)}
        className="cursor-pointer"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          {challenge.is_featured && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 gap-1">
                <Star className="w-3 h-3" />
                Featured
              </Badge>
            </div>
          )}

          <div className="relative h-48 overflow-hidden">
            <img
              src={challenge.image}
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4">
              <Badge className="mb-2">{challenge.category}</Badge>
              <h3 className="text-xl font-bold text-white mb-1">{challenge.title}</h3>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>{challenge.duration} days</span>
                <span>•</span>
                <Users className="w-4 h-4" />
                <span>{formatNumber(challenge.participants)} joined</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {challenge.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={challenge.creator.avatar} />
                  <AvatarFallback>{challenge.creator.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{challenge.creator.name}</p>
                  <p className="text-xs text-muted-foreground">Creator</p>
                </div>
              </div>

              <Badge
                variant="secondary"
                className={
                  challenge.difficulty === 'beginner'
                    ? 'bg-green-500/10 text-green-600'
                    : challenge.difficulty === 'intermediate'
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-red-500/10 text-red-600'
                }
              >
                {challenge.difficulty}
              </Badge>
            </div>

            {challenge.is_joined && challenge.current_progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {challenge.current_progress} / {challenge.goal} {challenge.unit}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
              </div>
            )}

            {challenge.prize && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-4">
                <Gift className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Prize: {challenge.prize}</span>
              </div>
            )}

            <div className="flex gap-2">
              {challenge.is_joined ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      leaveChallenge(challenge.id);
                    }}
                  >
                    Leave Challenge
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      openChallengeDetail(challenge);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    joinChallenge(challenge.id);
                  }}
                  disabled={challenge.status === 'completed'}
                >
                  {challenge.status === 'upcoming' ? (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Join Challenge
                    </>
                  ) : challenge.status === 'completed' ? (
                    <>Completed</>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Challenge
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-500/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="orange" />
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
                  <Trophy className="w-6 h-6 text-orange-500" />
                  Challenges
                </h1>
                <p className="text-sm text-muted-foreground">Compete, achieve, win!</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateChallenge(true)}
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="w-4 h-4" />
                Create Challenge
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Strength">Strength</SelectItem>
                <SelectItem value="Cardio">Cardio</SelectItem>
                <SelectItem value="Nutrition">Nutrition</SelectItem>
                <SelectItem value="Wellness">Wellness</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
              <CardContent className="p-6 relative">
                <Trophy className="w-10 h-10 text-orange-500 mb-3" />
                <p className="text-3xl font-bold mb-1">
                  {challenges.filter(c => c.is_joined).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <CardContent className="p-6 relative">
                <Award className="w-10 h-10 text-blue-500 mb-3" />
                <p className="text-3xl font-bold mb-1">12</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
              <CardContent className="p-6 relative">
                <Crown className="w-10 h-10 text-yellow-500 mb-3" />
                <p className="text-3xl font-bold mb-1">5</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }}>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
              <CardContent className="p-6 relative">
                <Flame className="w-10 h-10 text-orange-500 mb-3" />
                <p className="text-3xl font-bold mb-1">28</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-secondary/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ChallengeCard challenge={challenge} />
            </motion.div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <Card className="border-2 border-dashed p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">No challenges found</p>
            <Button onClick={() => {
              setSearchQuery('');
              setFilterDifficulty('all');
              setFilterCategory('all');
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Challenge Detail Dialog */}
      <Dialog open={showChallengeDetail} onOpenChange={setShowChallengeDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedChallenge && (
            <div className="space-y-6">
              <div className="relative h-64 -m-6 mb-6 rounded-t-lg overflow-hidden">
                <img
                  src={selectedChallenge.image}
                  alt={selectedChallenge.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="mb-2">{selectedChallenge.category}</Badge>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedChallenge.title}</h2>
                  <div className="flex items-center gap-4 text-white/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedChallenge.duration} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {formatNumber(selectedChallenge.participants)} participants
                    </span>
                    <Badge className="bg-white/20">{selectedChallenge.difficulty}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2">About This Challenge</h3>
                    <p className="text-muted-foreground">{selectedChallenge.description}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3">Challenge Goal</h3>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-bold">{selectedChallenge.goal}</p>
                            <p className="text-muted-foreground">{selectedChallenge.unit}</p>
                          </div>
                          <Target className="w-12 h-12 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedChallenge.leaderboard && (
                    <div>
                      <h3 className="font-bold text-lg mb-3">Leaderboard</h3>
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            {selectedChallenge.leaderboard.map((entry) => (
                              <div
                                key={entry.rank}
                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold">
                                  {entry.rank}
                                </div>
                                <Avatar>
                                  <AvatarImage src={entry.user.avatar} />
                                  <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-semibold">{entry.user.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.progress}% complete
                                  </p>
                                </div>
                                {entry.rank === 1 && (
                                  <Crown className="w-6 h-6 text-yellow-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-4">Challenge Info</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Start Date</span>
                          <span className="font-medium">{selectedChallenge.start_date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">End Date</span>
                          <span className="font-medium">{selectedChallenge.end_date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium">{selectedChallenge.duration} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Difficulty</span>
                          <Badge>{selectedChallenge.difficulty}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedChallenge.prize && (
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20" />
                      <CardContent className="p-6 relative">
                        <Gift className="w-10 h-10 text-yellow-500 mb-3" />
                        <p className="font-bold mb-1">Prize</p>
                        <p className="text-sm">{selectedChallenge.prize}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-4">Creator</h3>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedChallenge.creator.avatar} />
                          <AvatarFallback>{selectedChallenge.creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{selectedChallenge.creator.name}</p>
                          <p className="text-sm text-muted-foreground">
                            @{selectedChallenge.creator.username}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => navigate(`/profile/${selectedChallenge.creator.username}`)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => shareChallenge(selectedChallenge)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    {selectedChallenge.is_joined ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          leaveChallenge(selectedChallenge.id);
                          setShowChallengeDetail(false);
                        }}
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                        onClick={() => {
                          joinChallenge(selectedChallenge.id);
                          setShowChallengeDetail(false);
                        }}
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Challenge Dialog */}
      <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a Challenge</DialogTitle>
            <DialogDescription>
              Create a custom challenge for the community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Challenge Title</label>
              <Input placeholder="e.g., 30-Day Plank Challenge" />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your challenge..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (days)</label>
                <Input type="number" placeholder="30" />
              </div>
              <div>
                <label className="text-sm font-medium">Goal</label>
                <Input type="number" placeholder="1000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Prize (Optional)</label>
              <Input placeholder="e.g., $50 Amazon Gift Card" />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateChallenge(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowCreateChallenge(false);
                  toast({
                    title: "Challenge created! 🎉",
                    description: "Your challenge is now live!"
                  });
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
              >
                Create Challenge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Plus,
  Search,
  Users,
  TrendingUp,
  Flame,
  Award,
  Target,
  Dumbbell,
  Apple,
  Image as ImageIcon,
  Send,
  Globe,
  UserPlus,
  UserCheck,
  Sparkles,
  Crown,
  ArrowLeft,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Flag = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" x2="4" y1="22" y2="15"/>
  </svg>
);

interface Post {
  id: string;
  user_id: string;
  user: {
    name: string;
    avatar: string;
    username: string;
    is_verified?: boolean;
  };
  type: 'workout' | 'meal' | 'achievement' | 'progress' | 'text';
  content: string;
  images?: string[];
  workout_data?: any;
  meal_data?: any;
  achievement_data?: any;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  location?: string;
}

const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    user_id: '1',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      username: 'sarahfitness',
      is_verified: true
    },
    type: 'workout',
    content: 'Crushed leg day! 💪 New PR on squats: 140kg x 5 reps. Feeling unstoppable!',
    images: ['https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop'],
    workout_data: {
      exercise: 'Squats',
      weight: 140,
      reps: 5,
      duration: 75
    },
    likes_count: 234,
    comments_count: 45,
    is_liked: false,
    is_bookmarked: false,
    created_at: '2h ago',
    location: 'Gold\'s Gym'
  },
  {
    id: '2',
    user_id: '2',
    user: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      username: 'mikesgains',
      is_verified: false
    },
    type: 'achievement',
    content: '🎉 Just hit my goal weight! Down 15kg in 3 months. Consistency is KEY! Thank you all for the support! 🙏',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'],
    achievement_data: {
      type: 'Weight Loss',
      amount: 15,
      duration: '3 months'
    },
    likes_count: 892,
    comments_count: 156,
    is_liked: true,
    is_bookmarked: true,
    created_at: '5h ago'
  },
  {
    id: '3',
    user_id: '3',
    user: {
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      username: 'emilyeats',
      is_verified: true
    },
    type: 'meal',
    content: 'Meal prep Sunday! 🍱 Made 5 days worth of high-protein lunches. Recipe in comments!',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop'
    ],
    meal_data: {
      name: 'Chicken & Rice Bowl',
      calories: 520,
      protein: 45
    },
    likes_count: 567,
    comments_count: 89,
    is_liked: false,
    is_bookmarked: false,
    created_at: '1d ago'
  },
  {
    id: '4',
    user_id: '4',
    user: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      username: 'alexlifts',
      is_verified: false
    },
    type: 'progress',
    content: '3 months transformation! Same weight, completely different body composition. Proof that the scale isn\'t everything! 📊',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop'
    ],
    likes_count: 1243,
    comments_count: 234,
    is_liked: true,
    is_bookmarked: true,
    created_at: '2d ago'
  },
  {
    id: '5',
    user_id: '5',
    user: {
      name: 'Jessica Martinez',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
      username: 'jessicafit',
      is_verified: true
    },
    type: 'text',
    content: 'Reminder: Rest days are just as important as training days! 💤 Your muscles grow when you recover, not when you train. Listen to your body! 🙏',
    likes_count: 456,
    comments_count: 67,
    is_liked: false,
    is_bookmarked: false,
    created_at: '3d ago'
  }
];

const SUGGESTED_USERS = [
  {
    id: '1',
    name: 'David Kim',
    username: 'davidkimfitness',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    followers: '12.5k',
    is_following: false,
    bio: 'Bodybuilder | Coach'
  },
  {
    id: '2',
    name: 'Lisa Wang',
    username: 'lisawellness',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    followers: '8.2k',
    is_following: false,
    bio: 'Yoga & Nutrition'
  },
  {
    id: '3',
    name: 'Chris Brown',
    username: 'chrisbrown_pt',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop',
    followers: '15.7k',
    is_following: true,
    bio: 'Personal Trainer'
  }
];

export default function Social() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState(SUGGESTED_USERS);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
  }

  async function toggleLike(postId: string) {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_liked: !post.is_liked,
          likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
        };
      }
      return post;
    }));

    toast({
      title: posts.find(p => p.id === postId)?.is_liked ? "Removed like" : "Liked! ❤️",
    });
  }

  async function toggleBookmark(postId: string) {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_bookmarked: !post.is_bookmarked
        };
      }
      return post;
    }));

    toast({
      title: posts.find(p => p.id === postId)?.is_bookmarked ? "Removed from saved" : "Saved! 🔖",
    });
  }

  async function toggleFollow(userId: string) {
    setSuggestedUsers(suggestedUsers.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          is_following: !user.is_following
        };
      }
      return user;
    }));

    toast({
      title: suggestedUsers.find(u => u.id === userId)?.is_following ? "Unfollowed" : "Following! 👥",
    });
  }

  async function createPost() {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      user_id: userId,
      user: {
        name: 'You',
        avatar: '',
        username: 'yourname',
        is_verified: false
      },
      type: 'text',
      content: newPostContent,
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      is_bookmarked: false,
      created_at: 'Just now'
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);

    toast({
      title: "Posted! 🎉",
      description: "Your post is live!"
    });
  }

  const FloatingOrb = ({ delay = 0, color = "blue" }: any) => (
    <motion.div
      className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${
        color === 'blue' ? 'from-blue-500/20 to-cyan-500/20' :
        color === 'purple' ? 'from-purple-500/20 to-pink-500/20' :
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

  const PostCard = ({ post }: { post: Post }) => {
    const [showComments, setShowComments] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-xl backdrop-blur-xl bg-background/95 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                  <Avatar className="w-12 h-12 border-2 border-border cursor-pointer">
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold hover:underline cursor-pointer">
                      {post.user.name}
                    </p>
                    {post.user.is_verified && (
                      <Badge className="h-5 px-1.5 bg-blue-500">
                        <Sparkles className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>@{post.user.username}</span>
                    <span>•</span>
                    <span>{post.created_at}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {post.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save Post
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {post.type !== 'text' && (
              <div className="px-4 pb-2">
                <Badge variant="secondary" className="gap-1">
                  {post.type === 'workout' && <><Dumbbell className="w-3 h-3" /> Workout</>}
                  {post.type === 'meal' && <><Apple className="w-3 h-3" /> Meal</>}
                  {post.type === 'achievement' && <><Award className="w-3 h-3" /> Achievement</>}
                  {post.type === 'progress' && <><TrendingUp className="w-3 h-3" /> Progress</>}
                </Badge>
              </div>
            )}

            <div className="px-4 pb-3">
              <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.workout_data && (
              <div className="px-4 pb-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{post.workout_data.weight}kg</p>
                      <p className="text-xs text-muted-foreground">Weight</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{post.workout_data.reps}</p>
                      <p className="text-xs text-muted-foreground">Reps</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-pink-600">{post.workout_data.duration}m</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {post.meal_data && (
              <div className="px-4 pb-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xl font-bold">{post.meal_data.calories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-xl font-bold">{post.meal_data.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {post.achievement_data && (
              <div className="px-4 pb-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center"
                >
                  <Award className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                  <p className="text-lg font-bold">{post.achievement_data.type}</p>
                  <p className="text-2xl font-bold text-yellow-600 my-2">
                    {post.achievement_data.amount}kg
                  </p>
                  <p className="text-sm text-muted-foreground">in {post.achievement_data.duration}</p>
                </motion.div>
              </div>
            )}

            {post.images && post.images.length > 0 && (
              <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
                {post.images.map((image, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square overflow-hidden cursor-pointer"
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-2 group"
                  >
                    <motion.div
                      animate={post.is_liked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart
                        className={`w-6 h-6 transition-colors ${
                          post.is_liked
                            ? 'fill-red-500 text-red-500'
                            : 'text-muted-foreground group-hover:text-red-500'
                        }`}
                      />
                    </motion.div>
                    <span className={`text-sm font-medium ${post.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {post.likes_count}
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 group"
                  >
                    <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {post.comments_count}
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-2 group"
                  >
                    <Share2 className="w-6 h-6 text-muted-foreground group-hover:text-green-500 transition-colors" />
                  </motion.button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleBookmark(post.id)}
                >
                  <Bookmark
                    className={`w-6 h-6 transition-colors ${
                      post.is_bookmarked
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground hover:text-yellow-500'
                    }`}
                  />
                </motion.button>
              </div>

              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 border-t border-border/50"
                  >
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" />
                        </Avatar>
                        <div className="flex-1 p-3 rounded-lg bg-secondary">
                          <p className="text-sm font-semibold mb-1">John Smith</p>
                          <p className="text-sm">Amazing progress! Keep it up! 💪</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                        <Input
                          placeholder="Add a comment..."
                          className="flex-1"
                        />
                        <Button size="icon">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="blue" />
        <FloatingOrb delay={3} color="purple" />
        <FloatingOrb delay={6} color="green" />
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
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  Community
                </h1>
                <p className="text-sm text-muted-foreground">Connect with fitness enthusiasts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            </div>
          </div>

          <div className="mt-4 relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users, posts, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-12 bg-secondary/50">
                <TabsTrigger value="feed" className="data-[state=active]:bg-background">
                  <Flame className="w-4 h-4 mr-2" />
                  Feed
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-background">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="following" className="data-[state=active]:bg-background">
                  <Users className="w-4 h-4 mr-2" />
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6 mt-6">
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Button variant="outline" size="lg">
                    Load More Posts
                  </Button>
                </motion.div>
              </TabsContent>

              <TabsContent value="trending" className="space-y-6 mt-6">
                <Card className="border-0 shadow-xl p-6 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-bold mb-2">Trending Content</h3>
                  <p className="text-muted-foreground">
                    See what's popular in the community
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="following" className="space-y-6 mt-6">
                <Card className="border-0 shadow-xl p-6 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-bold mb-2">Following Feed</h3>
                  <p className="text-muted-foreground">
                    Posts from people you follow
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="relative h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      background: [
                        'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                        'linear-gradient(90deg, #8b5cf6, #ec4899)',
                        'linear-gradient(135deg, #ec4899, #3b82f6)',
                        'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                      ]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                  />
                </div>
                <CardContent className="pt-8 pb-6 -mt-12 relative">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-background bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                  >
                    <Crown className="w-12 h-12 text-white" />
                  </motion.div>

                  <h3 className="text-center font-bold text-lg mb-1">Your Profile</h3>
                  <p className="text-center text-sm text-muted-foreground mb-4">@yourname</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">234</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">1.2k</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">456</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    Suggested For You
                  </h3>

                  <div className="space-y-4">
                    {suggestedUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-3"
                      >
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                          <Avatar className="w-12 h-12 border-2 border-border cursor-pointer">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate hover:underline cursor-pointer">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                          <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                        </div>

                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            variant={user.is_following ? "outline" : "default"}
                            onClick={() => toggleFollow(user.id)}
                            className="h-8 px-3"
                          >
                            {user.is_following ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>

                  <Button variant="ghost" className="w-full mt-4">
                    See All Suggestions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Trending Now
                  </h3>

                  <div className="space-y-3">
                    {[
                      { tag: '#TransformationTuesday', posts: '12.5k' },
                      { tag: '#FitnessGoals2025', posts: '8.2k' },
                      { tag: '#HealthyEating', posts: '15.7k' },
                      { tag: '#GymMotivation', posts: '22.1k' },
                      { tag: '#MealPrep', posts: '9.8k' }
                    ].map((hashtag, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ x: 5 }}
                        className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <p className="font-semibold text-sm text-blue-500">{hashtag.tag}</p>
                        <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Share your fitness journey with the community</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Add Photos
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Dumbbell className="w-4 h-4" />
                Log Workout
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Apple className="w-4 h-4" />
                Log Meal
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Everyone can see this</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={createPost}
                  disabled={!newPostContent.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

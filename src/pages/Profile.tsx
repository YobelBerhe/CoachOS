import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ArrowLeft,
  Settings,
  UserPlus,
  UserCheck,
  MessageCircle,
  MoreVertical,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Award,
  TrendingUp,
  Flame,
  Target,
  Dumbbell,
  Apple,
  Heart,
  Bookmark,
  Camera,
  Edit,
  Check,
  X,
  Crown,
  Sparkles,
  Users,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  username: string;
  name: string;
  avatar: string;
  cover_photo: string;
  bio: string;
  location: string;
  website: string;
  joined_date: string;
  is_verified: boolean;
  stats: {
    posts: number;
    followers: number;
    following: number;
    achievements: number;
  };
  fitness_stats: {
    workouts_completed: number;
    current_streak: number;
    total_weight_lifted: string;
    favorite_exercise: string;
  };
  goals: {
    current_goal: string;
    progress: number;
  };
}

interface Post {
  id: string;
  type: string;
  content: string;
  images?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

// Sample profile data
const SAMPLE_PROFILE: ProfileData = {
  id: '1',
  username: 'sarahfitness',
  name: 'Sarah Johnson',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  cover_photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop',
  bio: '💪 Fitness enthusiast | 🏋️ Certified PT | 🥗 Nutrition coach\nHelping people transform their lives one rep at a time!\n📍 Los Angeles, CA',
  location: 'Los Angeles, CA',
  website: 'sarahfitness.com',
  joined_date: 'January 2024',
  is_verified: true,
  stats: {
    posts: 234,
    followers: 12500,
    following: 456,
    achievements: 47
  },
  fitness_stats: {
    workouts_completed: 342,
    current_streak: 28,
    total_weight_lifted: '2.4M lbs',
    favorite_exercise: 'Deadlifts'
  },
  goals: {
    current_goal: 'Lose 10kg',
    progress: 65
  }
};

const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    type: 'workout',
    content: 'Crushed leg day! 💪 New PR on squats: 140kg x 5 reps',
    images: ['https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop'],
    likes_count: 234,
    comments_count: 45,
    created_at: '2h ago'
  },
  {
    id: '2',
    type: 'meal',
    content: 'Meal prep Sunday! 🍱 High-protein lunches for the week',
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'],
    likes_count: 567,
    comments_count: 89,
    created_at: '1d ago'
  },
  {
    id: '3',
    type: 'progress',
    content: '3 months transformation! Same weight, different body 📊',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop'
    ],
    likes_count: 1243,
    comments_count: 234,
    created_at: '2d ago'
  }
];

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>(SAMPLE_PROFILE);
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(SAMPLE_PROFILE);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    init();
  }, [username]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
    
    // Check if viewing own profile
    const isOwn = username === 'me' || username === 'yourname';
    setIsOwnProfile(isOwn);
    
    // In production, load actual profile data
    setProfile(SAMPLE_PROFILE);
    setEditedProfile(SAMPLE_PROFILE);
    setPosts(SAMPLE_POSTS);
    setLoading(false);
  }

  async function toggleFollow() {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following! 👥",
      description: isFollowing ? "" : `You're now following ${profile.name}`
    });
  }

  async function saveProfile() {
    setProfile(editedProfile);
    setShowEditProfile(false);
    toast({
      title: "Profile updated! ✅",
      description: "Your changes have been saved"
    });
  }

  const FloatingOrb = ({ delay = 0, color = "purple" }: any) => (
    <motion.div
      className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${
        color === 'purple' ? 'from-purple-500/20 to-pink-500/20' :
        color === 'blue' ? 'from-blue-500/20 to-cyan-500/20' :
        'from-orange-500/20 to-red-500/20'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Users className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="purple" />
        <FloatingOrb delay={3} color="blue" />
        <FloatingOrb delay={6} color="orange" />
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
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">{profile.stats.posts} posts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10">
        {/* Cover Photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 overflow-hidden"
        >
          <img
            src={profile.cover_photo}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur"
            >
              <Camera className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>

        {/* Profile Info */}
        <div className="container mx-auto px-4 -mt-20 relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-32 h-32 rounded-full border-4 border-background shadow-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                )}
                {profile.is_verified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-blue-500 border-4 border-background flex items-center justify-center"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Profile Stats & Actions */}
              <div className="flex-1">
                <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                      <p className="text-muted-foreground">@{profile.username}</p>
                    </div>

                    {isOwnProfile ? (
                      <Button
                        onClick={() => setShowEditProfile(true)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={toggleFollow}
                          className={isFollowing ? '' : 'bg-gradient-to-r from-blue-500 to-purple-500'}
                          variant={isFollowing ? 'outline' : 'default'}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{profile.stats.posts}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{profile.stats.followers.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{profile.stats.following}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{profile.stats.achievements}</p>
                      <p className="text-xs text-muted-foreground">Achievements</p>
                    </motion.div>
                  </div>

                  {/* Bio */}
                  <p className="whitespace-pre-wrap mb-3">{profile.bio}</p>

                  {/* Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      
                        href={`https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>{profile.website}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profile.joined_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fitness Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
                  <CardContent className="p-6 relative">
                    <Flame className="w-10 h-10 text-orange-500 mb-3" />
                    <p className="text-2xl font-bold mb-1">{profile.fitness_stats.current_streak}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                  <CardContent className="p-6 relative">
                    <Dumbbell className="w-10 h-10 text-blue-500 mb-3" />
                    <p className="text-2xl font-bold mb-1">{profile.fitness_stats.workouts_completed}</p>
                    <p className="text-sm text-muted-foreground">Workouts Done</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                  <CardContent className="p-6 relative">
                    <TrendingUp className="w-10 h-10 text-green-500 mb-3" />
                    <p className="text-2xl font-bold mb-1">{profile.fitness_stats.total_weight_lifted}</p>
                    <p className="text-sm text-muted-foreground">Total Lifted</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                  <CardContent className="p-6 relative">
                    <Award className="w-10 h-10 text-purple-500 mb-3" />
                    <p className="text-xl font-bold mb-1">{profile.fitness_stats.favorite_exercise}</p>
                    <p className="text-sm text-muted-foreground">Favorite</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Current Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">Current Goal</h3>
                    </div>
                    <Badge>{profile.goals.progress}% Complete</Badge>
                  </div>
                  <p className="mb-3">{profile.goals.current_goal}</p>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.goals.progress}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 h-12 bg-secondary/50 mb-6">
                  <TabsTrigger value="posts" className="data-[state=active]:bg-background">
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="about" className="data-[state=active]:bg-background">
                    About
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="data-[state=active]:bg-background">
                    Saved
                  </TabsTrigger>
                </TabsList>

                {/* Posts Tab */}
                <TabsContent value="posts">
                  <div className="grid grid-cols-3 gap-1">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative aspect-square overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={post.images?.[0] || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <div className="flex items-center gap-1 text-white">
                            <Heart className="w-5 h-5 fill-white" />
                            <span className="font-semibold">{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white">
                            <MessageCircle className="w-5 h-5 fill-white" />
                            <span className="font-semibold">{post.comments_count}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {posts.length === 0 && (
                    <Card className="border-2 border-dashed p-12 text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No posts yet</p>
                    </Card>
                  )}
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about">
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">About</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Bio</p>
                            <p className="whitespace-pre-wrap">{profile.bio}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Location</p>
                            <p>{profile.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Website</p>
                            
                              href={`https://${profile.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {profile.website}
                            </a>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Joined</p>
                            <p>{profile.joined_date}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">Fitness Journey</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                            <span className="text-sm">Current Streak</span>
                            <Badge>{profile.fitness_stats.current_streak} days</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                            <span className="text-sm">Workouts Completed</span>
                            <Badge>{profile.fitness_stats.workouts_completed}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                            <span className="text-sm">Total Weight Lifted</span>
                            <Badge>{profile.fitness_stats.total_weight_lifted}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                            <span className="text-sm">Favorite Exercise</span>
                            <Badge>{profile.fitness_stats.favorite_exercise}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Saved Tab */}
                <TabsContent value="saved">
                  <Card className="border-2 border-dashed p-12 text-center">
                    <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {isOwnProfile ? 'No saved posts yet' : 'Saved posts are private'}
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cover & Avatar */}
            <div className="space-y-4">
              <div className="relative h-32 rounded-lg overflow-hidden bg-secondary">
                <img
                  src={editedProfile.cover_photo}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Cover
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={editedProfile.avatar} />
                  <AvatarFallback>{editedProfile.name[0]}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={editedProfile.username}
                  onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={editedProfile.website}
                  onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                  placeholder="yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditProfile(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveProfile}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

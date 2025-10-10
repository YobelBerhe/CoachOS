import { useState, useEffect, useRef } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Share2,
  QrCode,
  ShieldBan,
  UserX,
  Flag,
  Facebook,
  Twitter,
  Mail,
  Copy,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  UserCircle,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

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
    total_weight_lifted: number;
    favorite_exercise: string;
  };
  goals: {
    current_goal: string;
    progress: number;
  };
  is_online: boolean;
  last_active: string;
  profile_views: number;
  mutual_friends: number;
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

interface Highlight {
  id: string;
  title: string;
  cover: string;
  count: number;
}

// Sample highlights
const SAMPLE_HIGHLIGHTS: Highlight[] = [
  {
    id: '1',
    title: 'Workouts',
    cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
    count: 24
  },
  {
    id: '2',
    title: 'Meals',
    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
    count: 18
  },
  {
    id: '3',
    title: 'Progress',
    cover: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    count: 12
  }
];

// Sample profile data with realistic numbers
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
    followers: 12543,
    following: 456,
    achievements: 47
  },
  fitness_stats: {
    workouts_completed: 342,
    current_streak: 28,
    total_weight_lifted: 2400000, // in lbs
    favorite_exercise: 'Deadlifts'
  },
  goals: {
    current_goal: 'Lose 10kg',
    progress: 65
  },
  is_online: true,
  last_active: 'Active now',
  profile_views: 1234,
  mutual_friends: 12
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
  },
  {
    id: '4',
    type: 'workout',
    content: 'Morning cardio session ☀️',
    images: ['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop'],
    likes_count: 189,
    comments_count: 23,
    created_at: '3d ago'
  },
  {
    id: '5',
    type: 'meal',
    content: 'Post-workout protein shake 🥤',
    images: ['https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=600&fit=crop'],
    likes_count: 145,
    comments_count: 18,
    created_at: '4d ago'
  },
  {
    id: '6',
    type: 'achievement',
    content: 'Hit 100 workouts this year! 🎉',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
    likes_count: 892,
    comments_count: 123,
    created_at: '5d ago'
  }
];

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>(SAMPLE_PROFILE);
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [highlights, setHighlights] = useState<Highlight[]>(SAMPLE_HIGHLIGHTS);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(SAMPLE_PROFILE);
  const [activeTab, setActiveTab] = useState('posts');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);

  useEffect(() => {
    init();
  }, [username]);

  useEffect(() => {
    if (showQRCode) {
      generateQRCode();
    }
  }, [showQRCode]);

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
    
    // In production, load actual profile data from Supabase
    // const { data, error } = await supabase
    //   .from('profiles')
    //   .select('*, posts(*), followers(*), following(*)')
    //   .eq('username', username)
    //   .single();
    
    setProfile(SAMPLE_PROFILE);
    setEditedProfile(SAMPLE_PROFILE);
    setPosts(SAMPLE_POSTS);
    setLoading(false);
  }

  // Format numbers with K/M
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  // Format weight lifted
  function formatWeight(lbs: number): string {
    if (lbs >= 1000000) {
      return (lbs / 1000000).toFixed(1).replace(/\.0$/, '') + 'M lbs';
    }
    if (lbs >= 1000) {
      return (lbs / 1000).toFixed(1).replace(/\.0$/, '') + 'K lbs';
    }
    return lbs + ' lbs';
  }

  async function toggleFollow() {
    setIsFollowing(!isFollowing);
    
    // Update follower count
    setProfile({
      ...profile,
      stats: {
        ...profile.stats,
        followers: isFollowing ? profile.stats.followers - 1 : profile.stats.followers + 1
      }
    });

    // In production, update in Supabase
    // await supabase.from('user_follows').insert({ follower_id: userId, following_id: profile.id });

    toast({
      title: isFollowing ? "Unfollowed" : "Following! 👥",
      description: isFollowing ? "" : `You're now following ${profile.name}`
    });
  }

  async function handleMessage() {
    toast({
      title: "Opening messages...",
      description: `Starting conversation with ${profile.name}`
    });
    // Navigate to messages page
    navigate(`/messages/${profile.username}`);
  }

  async function handleShare(platform?: string) {
    const url = `${window.location.origin}/profile/${profile.username}`;
    const text = `Check out ${profile.name}'s profile on FitTrack!`;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied! 🔗" });
    }
    setShowShareDialog(false);
  }

  async function generateQRCode() {
    try {
      const url = `${window.location.origin}/profile/${profile.username}`;
      const qr = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qr);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }

  async function downloadQRCode() {
    const link = document.createElement('a');
    link.download = `${profile.username}-qrcode.png`;
    link.href = qrCodeUrl;
    link.click();
    toast({ title: "QR Code downloaded! 📥" });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);

    try {
      // In production, upload to Supabase Storage
      // const { data, error } = await supabase.storage
      //   .from('covers')
      //   .upload(`${userId}/cover-${Date.now()}.jpg`, file);

      // For demo, use FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, cover_photo: reader.result as string });
        setEditedProfile({ ...editedProfile, cover_photo: reader.result as string });
        toast({ title: "Cover photo updated! 📸" });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: "Failed to upload cover photo", variant: "destructive" });
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      // In production, upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
        setEditedProfile({ ...editedProfile, avatar: reader.result as string });
        toast({ title: "Profile picture updated! 👤" });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: "Failed to upload avatar", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveProfile() {
    // In production, save to Supabase
    // await supabase.from('profiles').update(editedProfile).eq('id', userId);
    
    setProfile(editedProfile);
    setShowEditProfile(false);
    toast({
      title: "Profile updated! ✅",
      description: "Your changes have been saved"
    });
  }

  async function handleRestrict() {
    toast({
      title: "User restricted",
      description: `${profile.name} has been restricted`
    });
  }

  async function handleBlock() {
    // In production, update in Supabase
    setShowBlockDialog(false);
    toast({
      title: "User blocked",
      description: `${profile.name} has been blocked`
    });
  }

  async function handleReport() {
    setShowReportDialog(false);
    toast({
      title: "Report submitted",
      description: "Thank you for keeping our community safe"
    });
  }

  function openPost(postId: string) {
    navigate(`/post/${postId}`);
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

      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

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
                <p className="text-sm text-muted-foreground">{formatNumber(profile.stats.posts)} posts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-5 h-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setShowQRCode(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Profile Link
                  </DropdownMenuItem>
                  {!isOwnProfile && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleRestrict} className="text-destructive focus:text-destructive">
                        <ShieldBan className="w-4 h-4 mr-2" />
                        Restrict
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive focus:text-destructive">
                        <UserX className="w-4 h-4 mr-2" />
                        Block
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-destructive focus:text-destructive">
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-background/80 backdrop-blur shadow-lg hover:bg-background transition-colors disabled:opacity-50"
            >
              {uploadingCover ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Camera className="w-5 h-5" />
                </motion.div>
              ) : (
                <Camera className="w-5 h-5" />
              )}
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
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Camera className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
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
                {profile.is_online && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-green-500 border-2 border-background"
                  />
                )}
              </motion.div>

              {/* Profile Stats & Actions */}
              <div className="flex-1">
                <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                        {!isOwnProfile && profile.mutual_friends > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {profile.mutual_friends} mutual
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">@{profile.username}</p>
                      {profile.is_online && (
                        <div className="flex items-center gap-1 text-sm text-green-500">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{profile.last_active}</span>
                        </div>
                      )}
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
                        <Button variant="outline" onClick={handleMessage}>
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
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{formatNumber(profile.stats.posts)}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      onClick={() => setShowFollowersList(true)}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{formatNumber(profile.stats.followers)}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      onClick={() => setShowFollowingList(true)}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{formatNumber(profile.stats.following)}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <p className="text-2xl font-bold">{formatNumber(profile.stats.achievements)}</p>
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
                    {isOwnProfile && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(profile.profile_views)} profile views</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {isOwnProfile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 flex flex-col items-center gap-2"
                    >
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-secondary/50">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">New</span>
                    </motion.button>
                  )}
                  {highlights.map((highlight, index) => (
                    <motion.button
                      key={highlight.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 flex flex-col items-center gap-2"
                    >
                      <div className="w-20 h-20 rounded-full border-4 border-gradient-to-br from-purple-500 to-pink-500 p-0.5 bg-background">
                        <div className="w-full h-full rounded-full overflow-hidden">
                          <img
                            src={highlight.cover}
                            alt={highlight.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <span className="text-xs max-w-[80px] truncate">{highlight.title}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

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
                    <p className="text-2xl font-bold mb-1">{formatNumber(profile.fitness_stats.workouts_completed)}</p>
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
                    <p className="text-xl font-bold mb-1">{formatWeight(profile.fitness_stats.total_weight_lifted)}</p>
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
                    <p className="text-lg font-bold mb-1 line-clamp-1">{profile.fitness_stats.favorite_exercise}</p>
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
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      {profile.goals.progress}% Complete
                    </Badge>
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
                        onClick={() => openPost(post.id)}
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
                            <span className="font-semibold">{formatNumber(post.likes_count)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white">
                            <MessageCircle className="w-5 h-5 fill-white" />
                            <span className="font-semibold">{formatNumber(post.comments_count)}</span>
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
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {profile.website}
                              <ExternalLink className="w-3 h-3" />
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
                            <Badge>{formatNumber(profile.fitness_stats.workouts_completed)}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                            <span className="text-sm">Total Weight Lifted</span>
                            <Badge>{formatWeight(profile.fitness_stats.total_weight_lifted)}</Badge>
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Profile</DialogTitle>
            <DialogDescription>Share {profile.name}'s profile</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              Share on Facebook
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="w-5 h-5 text-sky-500" />
              Share on Twitter
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => handleShare('copy')}
            >
              <Copy className="w-5 h-5" />
              Copy Profile Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile QR Code</DialogTitle>
            <DialogDescription>Scan to view profile</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-6">
            {qrCodeUrl && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-white rounded-2xl shadow-xl"
              >
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              </motion.div>
            )}
            <div className="text-center">
              <p className="font-semibold mb-1">{profile.name}</p>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
            <Button onClick={downloadQRCode} className="gap-2">
              <Download className="w-4 h-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {profile.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to see your profile, posts, or message you. They won't be notified that you blocked them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive hover:bg-destructive/90">
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {profile.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              We'll review this profile and take appropriate action if it violates our community guidelines.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport} className="bg-destructive hover:bg-destructive/90">
              Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog - same as before but with real save */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                  onClick={() => coverInputRef.current?.click()}
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
            </div>

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

      {/* Followers List Dialog */}
      <Dialog open={showFollowersList} onOpenChange={setShowFollowersList}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
            <DialogDescription>{formatNumber(profile.stats.followers)} followers</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">User {i}</p>
                      <p className="text-xs text-muted-foreground">@user{i}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Following List Dialog */}
      <Dialog open={showFollowingList} onOpenChange={setShowFollowingList}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <DialogDescription>{formatNumber(profile.stats.following)} following</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://images.unsplash.com/photo-${1600000000000 + i}?w=100&h=100&fit=crop`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">User {i}</p>
                      <p className="text-xs text-muted-foreground">@user{i}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Following</Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

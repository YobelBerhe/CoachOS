import { useState, useEffect, useRef } from 'react';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  Camera,
  Image as ImageIcon,
  Send,
  Globe,
  Lock,
  UserPlus,
  UserCheck,
  Sparkles,
  Zap,
  Crown,
  ArrowLeft,
  Filter,
  Bell,
  X,
  Check,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Mail,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  created_at: string;
  likes: number;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'achievement';
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  read: boolean;
}

// Sample data (same as before)
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
];

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: '1',
    user: {
      name: 'John Smith',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      username: 'johnsmith'
    },
    content: 'Amazing progress! Keep it up! 💪',
    created_at: '1h ago',
    likes: 12
  },
  {
    id: '2',
    user: {
      name: 'Lisa Wang',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      username: 'lisawang'
    },
    content: 'This is so inspiring! What\'s your routine?',
    created_at: '45m ago',
    likes: 8
  }
];

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    content: 'liked your post',
    time: '5m ago',
    read: false
  },
  {
    id: '2',
    type: 'comment',
    user: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    content: 'commented: "Great workout!"',
    time: '1h ago',
    read: false
  },
  {
    id: '3',
    type: 'follow',
    user: {
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    content: 'started following you',
    time: '2h ago',
    read: true
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
  },
  {
    id: '4',
    name: 'Jessica Lee',
    username: 'jessicalee_fit',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
    followers: '22.1k',
    is_following: false,
    bio: 'Fitness Influencer'
  }
];

export default function Social() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState(SUGGESTED_USERS);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [postComments, setPostComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedHashtag]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserId(user.id);
  }

  function handleSearch() {
    let filtered = posts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.user.name.toLowerCase().includes(query) ||
        post.user.username.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.location && post.location.toLowerCase().includes(query))
      );
    }

    if (selectedHashtag) {
      filtered = filtered.filter(post =>
        post.content.includes(selectedHashtag)
      );
    }

    setFilteredPosts(filtered);
  }

  function handleHashtagClick(hashtag: string) {
    setSelectedHashtag(hashtag);
    setSearchQuery(hashtag);
    toast({
      title: "Filtering by hashtag",
      description: hashtag
    });
  }

  function clearHashtagFilter() {
    setSelectedHashtag(null);
    setSearchQuery('');
  }

  async function loadMorePosts() {
    setLoading(true);
    // Simulate loading more posts
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Duplicate first 3 posts for demo
    const morePosts = SAMPLE_POSTS.slice(0, 3).map(post => ({
      ...post,
      id: `${post.id}-${Date.now()}`,
      created_at: '1w ago'
    }));
    
    setPosts([...posts, ...morePosts]);
    setFilteredPosts([...filteredPosts, ...morePosts]);
    setLoading(false);
    
    toast({
      title: "Loaded more posts! 📜",
    });
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
    setFilteredPosts(filteredPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_liked: !post.is_liked,
          likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
        };
      }
      return post;
    }));
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
    setFilteredPosts(filteredPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_bookmarked: !post.is_bookmarked
        };
      }
      return post;
    }));
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
  }

  function openPostDetail(post: Post) {
    setSelectedPost(post);
    setShowPostDetail(true);
  }

  function openShare(post: Post) {
    setSharePost(post);
    setShowShareDialog(true);
  }

  async function shareToSocial(platform: string) {
    const url = `${window.location.origin}/post/${sharePost?.id}`;
    const text = sharePost?.content.slice(0, 100) + '...';

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied! 🔗" });
        setShowShareDialog(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareDialog(false);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: '',
        username: 'you'
      },
      content: newComment,
      created_at: 'Just now',
      likes: 0
    };

    setPostComments([comment, ...postComments]);
    setNewComment('');

    // Update comment count
    if (selectedPost) {
      setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, comments_count: p.comments_count + 1 } : p));
      setFilteredPosts(filteredPosts.map(p => p.id === selectedPost.id ? { ...p, comments_count: p.comments_count + 1 } : p));
    }

    toast({ title: "Comment added! 💬" });
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
    setFilteredPosts([newPost, ...filteredPosts]);
    setNewPostContent('');
    setShowCreatePost(false);

    toast({
      title: "Posted! 🎉",
      description: "Your post is live!"
    });
  }

  function handleAddPhotos() {
    fileInputRef.current?.click();
  }

  function handleLogWorkout() {
    setShowCreatePost(false);
    navigate('/workout');
    toast({
      title: "Opening workout logger...",
      description: "Log your workout and share it!"
    });
  }

  function handleLogMeal() {
    setShowCreatePost(false);
    navigate('/dashboard');
    toast({
      title: "Opening food diary...",
      description: "Log your meal and share it!"
    });
  }

  function markNotificationsRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const PostCard = ({ post, onPostClick }: { post: Post; onPostClick: () => void }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-xl backdrop-blur-xl bg-background/95 overflow-hidden">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${post.user.username}`)}
              >
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                  <Avatar className="w-12 h-12 border-2 border-border cursor-pointer">
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold hover:underline">
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
                  <DropdownMenuItem onClick={() => toggleBookmark(post.id)}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    {post.is_bookmarked ? 'Remove from saved' : 'Save Post'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openShare(post)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Type Badge */}
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

            {/* Post Content - Click to open detail */}
            <div className="px-4 pb-3 cursor-pointer" onClick={onPostClick}>
              <p className="text-base leading-relaxed whitespace-pre-wrap line-clamp-4">{post.content}</p>
              {post.content.length > 200 && (
                <p className="text-sm text-primary mt-2">Read more...</p>
              )}
            </div>

            {/* Workout/Meal/Achievement Data */}
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

            {/* Post Images - Click to open detail */}
            {post.images && post.images.length > 0 && (
              <div 
                className={`grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 cursor-pointer`}
                onClick={onPostClick}
              >
                {post.images.map((image, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square overflow-hidden"
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

            {/* Post Actions */}
            <div className="p-4">
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
                    onClick={onPostClick}
                    className="flex items-center gap-2 group"
                  >
                    <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {post.comments_count}
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openShare(post)}
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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="blue" />
        <FloatingOrb delay={3} color="purple" />
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
                  <Users className="w-6 h-6 text-blue-500" />
                  Community
                </h1>
                <p className="text-sm text-muted-foreground">Connect with fitness enthusiasts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                  >
                    {unreadCount}
                  </motion.div>
                )}
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

          {/* Search Bar with hashtag filter */}
          <div className="mt-4">
            {selectedHashtag && (
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="gap-2">
                  {selectedHashtag}
                  <button onClick={clearHashtagFilter}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users, posts, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
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
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PostCard post={post} onPostClick={() => openPostDetail(post)} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={loadMorePosts}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Posts'}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats Card */}
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
                    onClick={() => navigate('/profile/me')}
                    className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-background bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl cursor-pointer"
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

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/profile/me')}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Suggested Users */}
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
                    {suggestedUsers.slice(0, 3).map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-3"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          onClick={() => navigate(`/profile/${user.username}`)}
                        >
                          <Avatar className="w-12 h-12 border-2 border-border cursor-pointer">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                        </motion.div>

                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => navigate(`/profile/${user.username}`)}
                        >
                          <p className="font-semibold text-sm truncate hover:underline">
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

                  <Button 
                    variant="ghost" 
                    className="w-full mt-4"
                    onClick={() => setShowAllSuggestions(true)}
                  >
                    See All Suggestions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trending Hashtags */}
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
                        onClick={() => handleHashtagClick(hashtag.tag)}
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

      {/* Create Post Dialog */}
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
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  toast({ title: "Photos selected! 📸" });
                }}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleAddPhotos}
              >
                <ImageIcon className="w-4 h-4" />
                Add Photos
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleLogWorkout}
              >
                <Dumbbell className="w-4 h-4" />
                Log Workout
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleLogMeal}
              >
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

      {/* Post Detail Dialog */}
      <Dialog open={showPostDetail} onOpenChange={setShowPostDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedPost && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Image */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div className="bg-black flex items-center justify-center">
                  <img
                    src={selectedPost.images[0]}
                    alt=""
                    className="w-full h-auto max-h-[90vh] object-contain"
                  />
                </div>
              )}

              {/* Right: Content & Comments */}
              <div className="flex flex-col max-h-[90vh]">
                {/* Post Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      setShowPostDetail(false);
                      navigate(`/profile/${selectedPost.user.username}`);
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedPost.user.avatar} />
                      <AvatarFallback>{selectedPost.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedPost.user.name}</p>
                      <p className="text-xs text-muted-foreground">@{selectedPost.user.username}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPostDetail(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="p-4 border-b">
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{selectedPost.created_at}</p>
                </div>

                {/* Post Stats */}
                <div className="p-4 border-b">
                  <div className="flex gap-6 text-sm">
                    <span><strong>{selectedPost.likes_count}</strong> likes</span>
                    <span><strong>{selectedPost.comments_count}</strong> comments</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-b flex justify-around">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleLike(selectedPost.id)}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${selectedPost.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Comment
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openShare(selectedPost)}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Comments List */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {postComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-secondary rounded-lg p-3">
                            <p className="font-semibold text-sm">{comment.user.name}</p>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{comment.created_at}</span>
                            <button className="hover:text-foreground">{comment.likes} likes</button>
                            <button className="hover:text-foreground">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Add Comment */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addComment();
                        }
                      }}
                    />
                    <Button 
                      size="icon"
                      onClick={addComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>Share this post with your friends</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => shareToSocial('facebook')}
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              Share on Facebook
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => shareToSocial('twitter')}
            >
              <Twitter className="w-5 h-5 text-sky-500" />
              Share on Twitter
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => shareToSocial('copy')}
            >
              <Copy className="w-5 h-5" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Sheet */}
      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markNotificationsRead}>
                  Mark all read
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-100px)] mt-6">
            <div className="space-y-2">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  whileHover={{ x: 5 }}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    notif.read ? 'bg-secondary/30' : 'bg-blue-500/10'
                  }`}
                >
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notif.user.avatar} />
                      <AvatarFallback>{notif.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>{notif.user.name}</strong> {notif.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* All Suggestions Dialog */}
      <Dialog open={showAllSuggestions} onOpenChange={setShowAllSuggestions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suggested For You</DialogTitle>
            <DialogDescription>People you might want to follow</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    onClick={() => {
                      setShowAllSuggestions(false);
                      navigate(`/profile/${user.username}`);
                    }}
                  >
                    <Avatar className="w-12 h-12 border-2 border-border cursor-pointer">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      setShowAllSuggestions(false);
                      navigate(`/profile/${user.username}`);
                    }}
                  >
                    <p className="font-semibold truncate hover:underline">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.bio} • {user.followers} followers</p>
                  </div>

                  <Button
                    size="sm"
                    variant={user.is_following ? "outline" : "default"}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {user.is_following ? 'Following' : 'Follow'}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

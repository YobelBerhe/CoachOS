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
import { Slider } from '@/components/ui/slider';
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
  MapPin,
  Users,
  Target,
  Calendar,
  Clock,
  Dumbbell,
  Heart,
  MessageCircle,
  Star,
  Navigation,
  Search,
  Filter,
  UserPlus,
  CheckCircle2,
  X,
  Zap,
  Award,
  Flame,
  TrendingUp,
  Map,
  Crosshair,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkoutBuddy {
  id: string;
  name: string;
  username: string;
  avatar: string;
  age: number;
  gender: string;
  bio: string;
  distance: number; // in km
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  workout_preferences: string[];
  availability: string[];
  goals: string[];
  favorite_exercises: string[];
  gym?: string;
  rating: number;
  match_score: number;
  is_online: boolean;
  last_active: string;
  verified_workouts: number;
  mutual_friends: number;
}

interface WorkoutSession {
  id: string;
  buddy: WorkoutBuddy;
  date: string;
  time: string;
  location: string;
  type: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// Sample buddies
const SAMPLE_BUDDIES: WorkoutBuddy[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: 'sarahfitness',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    age: 28,
    gender: 'Female',
    bio: 'Fitness enthusiast | Love morning workouts | Always up for a challenge! 💪',
    distance: 1.2,
    location: {
      lat: 37.7749,
      lng: -122.4194,
      city: 'San Francisco, CA'
    },
    fitness_level: 'advanced',
    workout_preferences: ['Strength Training', 'HIIT', 'Running'],
    availability: ['Morning', 'Weekend'],
    goals: ['Build Muscle', 'Lose Weight', 'Increase Endurance'],
    favorite_exercises: ['Squats', 'Deadlifts', 'Pull-ups'],
    gym: "Gold's Gym Downtown",
    rating: 4.9,
    match_score: 95,
    is_online: true,
    last_active: 'Active now',
    verified_workouts: 142,
    mutual_friends: 3
  },
  {
    id: '2',
    name: 'Mike Chen',
    username: 'mikesgains',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    age: 32,
    gender: 'Male',
    bio: 'Powerlifter | Gym owner | Let\'s push some heavy weight! 🏋️',
    distance: 2.5,
    location: {
      lat: 37.7849,
      lng: -122.4094,
      city: 'San Francisco, CA'
    },
    fitness_level: 'elite',
    workout_preferences: ['Powerlifting', 'Strength Training', 'CrossFit'],
    availability: ['Evening', 'Weekend'],
    goals: ['Build Strength', 'Compete'],
    favorite_exercises: ['Bench Press', 'Squats', 'Deadlifts'],
    gym: 'Iron Paradise Gym',
    rating: 5.0,
    match_score: 88,
    is_online: false,
    last_active: '2h ago',
    verified_workouts: 287,
    mutual_friends: 1
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    username: 'emilyeats',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    age: 26,
    gender: 'Female',
    bio: 'Yoga instructor | Runner | Healthy living advocate 🧘‍♀️',
    distance: 3.8,
    location: {
      lat: 37.7649,
      lng: -122.4294,
      city: 'San Francisco, CA'
    },
    fitness_level: 'intermediate',
    workout_preferences: ['Yoga', 'Running', 'Pilates'],
    availability: ['Morning', 'Afternoon'],
    goals: ['Flexibility', 'Mental Health', 'Endurance'],
    favorite_exercises: ['Sun Salutation', '5K Run', 'Core Work'],
    rating: 4.8,
    match_score: 82,
    is_online: true,
    last_active: 'Active now',
    verified_workouts: 98,
    mutual_friends: 5
  },
  {
    id: '4',
    name: 'Alex Thompson',
    username: 'alexlifts',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    age: 30,
    gender: 'Male',
    bio: 'Bodybuilder | Nutrition coach | Beast mode 24/7 🔥',
    distance: 5.2,
    location: {
      lat: 37.7949,
      lng: -122.3994,
      city: 'San Francisco, CA'
    },
    fitness_level: 'advanced',
    workout_preferences: ['Bodybuilding', 'Strength Training'],
    availability: ['Evening'],
    goals: ['Build Muscle', 'Compete', 'Aesthetics'],
    favorite_exercises: ['Bicep Curls', 'Lat Pulldown', 'Chest Press'],
    gym: 'Muscle Factory',
    rating: 4.7,
    match_score: 78,
    is_online: false,
    last_active: '5h ago',
    verified_workouts: 201,
    mutual_friends: 0
  }
];

const SAMPLE_SESSIONS: WorkoutSession[] = [
  {
    id: '1',
    buddy: SAMPLE_BUDDIES[0],
    date: 'Nov 15, 2024',
    time: '7:00 AM',
    location: "Gold's Gym Downtown",
    type: 'Leg Day',
    duration: 90,
    status: 'confirmed'
  }
];

export default function WorkoutBuddy() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [buddies, setBuddies] = useState<WorkoutBuddy[]>(SAMPLE_BUDDIES);
  const [filteredBuddies, setFilteredBuddies] = useState<WorkoutBuddy[]>(SAMPLE_BUDDIES);
  const [sessions, setSessions] = useState<WorkoutSession[]>(SAMPLE_SESSIONS);
  const [selectedBuddy, setSelectedBuddy] = useState<WorkoutBuddy | null>(null);
  const [showBuddyDetail, setShowBuddyDetail] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [maxDistance, setMaxDistance] = useState([10]);
  const [fitnessLevel, setFitnessLevel] = useState('all');
  const [workoutType, setWorkoutType] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    filterBuddies();
  }, [maxDistance, fitnessLevel, workoutType, availability, searchQuery]);

  async function getUserLocation() {
    setIsLoadingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
          toast({ title: "Location detected! 📍" });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          toast({
            title: "Location access denied",
            description: "Please enable location services",
            variant: "destructive"
          });
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Location not supported",
        variant: "destructive"
      });
    }
  }

  function filterBuddies() {
    let filtered = buddies;

    // Distance filter
    filtered = filtered.filter(b => b.distance <= maxDistance[0]);

    // Fitness level filter
    if (fitnessLevel !== 'all') {
      filtered = filtered.filter(b => b.fitness_level === fitnessLevel);
    }

    // Workout type filter
    if (workoutType !== 'all') {
      filtered = filtered.filter(b => 
        b.workout_preferences.some(pref => pref.toLowerCase().includes(workoutType.toLowerCase()))
      );
    }

    // Availability filter
    if (availability !== 'all') {
      filtered = filtered.filter(b => b.availability.includes(availability));
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by match score
    filtered.sort((a, b) => b.match_score - a.match_score);

    setFilteredBuddies(filtered);
  }

  function openBuddyDetail(buddy: WorkoutBuddy) {
    setSelectedBuddy(buddy);
    setShowBuddyDetail(true);
  }

  function sendWorkoutRequest() {
    if (!selectedBuddy) return;

    toast({
      title: "Request sent! 💪",
      description: `${selectedBuddy.name} will be notified`
    });

    setShowRequestDialog(false);
    setShowBuddyDetail(false);
  }

  function getDistanceColor(distance: number) {
    if (distance < 2) return 'text-green-500';
    if (distance < 5) return 'text-yellow-500';
    return 'text-orange-500';
  }

  function getMatchColor(score: number) {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  }

  const FloatingOrb = ({ delay = 0, color = "blue" }: any) => (
    <motion.div
      className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${
        color === 'blue' ? 'from-blue-500/20 to-cyan-500/20' :
        color === 'green' ? 'from-green-500/20 to-emerald-500/20' :
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

  const BuddyCard = ({ buddy }: { buddy: WorkoutBuddy }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => openBuddyDetail(buddy)}
      className="cursor-pointer"
    >
      <Card className="border-0 shadow-2xl overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={buddy.avatar}
            alt={buddy.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Match Score */}
          <div className="absolute top-3 right-3">
            <Badge className={`bg-gradient-to-r ${getMatchColor(buddy.match_score)} text-white border-0 gap-1`}>
              <Star className="w-3 h-3" />
              {buddy.match_score}% Match
            </Badge>
          </div>

          {/* Online Status */}
          {buddy.is_online && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-green-500 text-white border-0 gap-1">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Online
              </Badge>
            </div>
          )}

          {/* Distance */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-black/70 backdrop-blur text-white border-0 gap-1">
              <MapPin className="w-3 h-3" />
              <span className={getDistanceColor(buddy.distance)}>
                {buddy.distance.toFixed(1)} km away
              </span>
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{buddy.name}</h3>
                {buddy.mutual_friends > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {buddy.mutual_friends} mutual
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {buddy.age} • {buddy.gender}
              </p>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{buddy.rating}</span>
                <span className="text-muted-foreground text-sm">
                  ({buddy.verified_workouts} workouts)
                </span>
              </div>
            </div>

            <Badge
              className={
                buddy.fitness_level === 'elite'
                  ? 'bg-purple-500/10 text-purple-600'
                  : buddy.fitness_level === 'advanced'
                  ? 'bg-blue-500/10 text-blue-600'
                  : buddy.fitness_level === 'intermediate'
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-yellow-500/10 text-yellow-600'
              }
            >
              {buddy.fitness_level}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{buddy.bio}</p>

          {/* Workout Preferences */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Workout Preferences</p>
            <div className="flex flex-wrap gap-1">
              {buddy.workout_preferences.slice(0, 3).map(pref => (
                <Badge key={pref} variant="secondary" className="text-xs">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Available</p>
            <div className="flex flex-wrap gap-1">
              {buddy.availability.map(time => (
                <Badge key={time} variant="outline" className="text-xs gap-1">
                  <Clock className="w-3 h-3" />
                  {time}
                </Badge>
              ))}
            </div>
          </div>

          {buddy.gym && (
            <div className="mb-4 p-2 rounded-lg bg-secondary text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="truncate">{buddy.gym}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/messages/${buddy.username}`);
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBuddy(buddy);
                setShowRequestDialog(true);
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="blue" />
        <FloatingOrb delay={3} color="green" />
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
                  <Users className="w-6 h-6 text-blue-500" />
                  Find Workout Buddies
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userLocation ? `${filteredBuddies.length} buddies nearby` : 'Enable location to find buddies'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              className="gap-2"
            >
              {isLoadingLocation ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Crosshair className="w-4 h-4" />
                  </motion.div>
                  Locating...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Refresh Location
                </>
              )}
            </Button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  Filters
                </h3>

                <div className="space-y-6">
                  {/* Distance */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Distance: {maxDistance[0]} km
                    </label>
                    <Slider
                      value={maxDistance}
                      onValueChange={setMaxDistance}
                      max={50}
                      min={1}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>

                  {/* Fitness Level */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fitness Level</label>
                    <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Workout Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Workout Type</label>
                    <Select value={workoutType} onValueChange={setWorkoutType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="hiit">HIIT</SelectItem>
                        <SelectItem value="crossfit">CrossFit</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Availability</label>
                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Afternoon">Afternoon</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Weekend">Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMaxDistance([10]);
                      setFitnessLevel('all');
                      setWorkoutType('all');
                      setAvailability('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buddies Grid */}
          <div className="lg:col-span-3">
            {/* My Sessions */}
            {sessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
                <div className="space-y-4">
                  {sessions.map(session => (
                    <Card key={session.id} className="border-0 shadow-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={session.buddy.avatar} />
                            <AvatarFallback>{session.buddy.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold">{session.type} with {session.buddy.name}</h3>
                              <Badge className="bg-green-500">Confirmed</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {session.date} at {session.time} • {session.duration} min
                            </p>
                            <p className="text-sm flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {session.location}
                            </p>
                          </div>
                          <Button variant="outline">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Buddies Grid */}
            <h2 className="text-xl font-bold mb-4">Available Workout Buddies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBuddies.map((buddy, index) => (
                <motion.div
                  key={buddy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BuddyCard buddy={buddy} />
                </motion.div>
              ))}
            </div>

            {filteredBuddies.length === 0 && (
              <Card className="border-2 border-dashed p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No workout buddies found</p>
                <Button onClick={() => {
                  setMaxDistance([50]);
                  setFitnessLevel('all');
                  setWorkoutType('all');
                  setAvailability('all');
                  setSearchQuery('');
                }}>
                  Expand Search
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Buddy Detail Dialog */}
      <Dialog open={showBuddyDetail} onOpenChange={setShowBuddyDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBuddy && (
            <div className="space-y-6">
              {/* Header */}
              <div className="relative h-48 -m-6 mb-6 rounded-t-lg overflow-hidden">
                <img
                  src={selectedBuddy.avatar}
                  alt={selectedBuddy.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-3xl font-bold text-white">{selectedBuddy.name}</h2>
                      {selectedBuddy.is_online && (
                        <Badge className="bg-green-500">Online</Badge>
                      )}
                    </div>
                    <p className="text-white/80">@{selectedBuddy.username}</p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${getMatchColor(selectedBuddy.match_score)} text-white text-lg px-4 py-2`}>
                    <Star className="w-5 h-5 mr-2" />
                    {selectedBuddy.match_score}% Match
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="font-bold text-lg mb-2">About</h3>
                    <p className="text-muted-foreground">{selectedBuddy.bio}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <p className="text-2xl font-bold">{selectedBuddy.rating}</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{selectedBuddy.verified_workouts}</p>
                        <p className="text-xs text-muted-foreground">Workouts</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <MapPin className={`w-8 h-8 mx-auto mb-2 ${getDistanceColor(selectedBuddy.distance)}`} />
                        <p className="text-2xl font-bold">{selectedBuddy.distance}</p>
                        <p className="text-xs text-muted-foreground">km away</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Workout Preferences */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Workout Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBuddy.workout_preferences.map(pref => (
                        <Badge key={pref} variant="secondary" className="text-sm">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Fitness Goals</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBuddy.goals.map(goal => (
                        <Badge key={goal} variant="outline" className="text-sm gap-1">
                          <Target className="w-3 h-3" />
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Favorite Exercises */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Favorite Exercises</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBuddy.favorite_exercises.map(exercise => (
                        <Badge key={exercise} className="text-sm gap-1">
                          <Dumbbell className="w-3 h-3" />
                          {exercise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Info Card */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-4">Details</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Age</span>
                          <span className="font-medium">{selectedBuddy.age}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Gender</span>
                          <span className="font-medium">{selectedBuddy.gender}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Level</span>
                          <Badge>{selectedBuddy.fitness_level}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span className="font-medium text-right">{selectedBuddy.location.city}</span>
                        </div>
                        {selectedBuddy.gym && (
                          <div className="pt-3 border-t">
                            <p className="text-muted-foreground mb-1">Home Gym</p>
                            <p className="font-medium">{selectedBuddy.gym}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Availability */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-4">Availability</h3>
                      <div className="space-y-2">
                        {selectedBuddy.availability.map(time => (
                          <div key={time} className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                      onClick={() => {
                        setShowBuddyDetail(false);
                        setShowRequestDialog(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Workout Request
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/messages/${selectedBuddy.username}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/profile/${selectedBuddy.username}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Workout Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Workout Request</DialogTitle>
            <DialogDescription>
              Request to workout with {selectedBuddy?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Workout Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Date</label>
              <Input type="date" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Time</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (6AM-12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM-6PM)</SelectItem>
                  <SelectItem value="evening">Evening (6PM-10PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input placeholder={selectedBuddy?.gym || "Enter location"} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
              <Input placeholder="Add a message..." />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={sendWorkoutRequest}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

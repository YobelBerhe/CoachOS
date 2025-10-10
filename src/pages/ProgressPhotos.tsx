import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Camera,
  Upload,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Target,
  Zap,
  Eye,
  EyeOff,
  Download,
  Share2,
  Trash2,
  Plus,
  Lock,
  Globe,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  LayoutGrid,
  Sparkles,
  Award,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProgressPhoto {
  id: string;
  date: string;
  image_url: string;
  angle: 'front' | 'side' | 'back';
  is_private: boolean;
  measurements?: {
    weight: number;
    body_fat?: number;
    muscle_mass?: number;
  };
  notes?: string;
}

interface Measurement {
  id: string;
  date: string;
  weight: number;
  body_fat?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  calves?: number;
}

interface Comparison {
  before: ProgressPhoto;
  after: ProgressPhoto;
  days_apart: number;
  weight_change: number;
  body_fat_change?: number;
}

// Sample data
const SAMPLE_PHOTOS: ProgressPhoto[] = [
  {
    id: '1',
    date: 'Nov 1, 2024',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
    angle: 'front',
    is_private: false,
    measurements: {
      weight: 82.5,
      body_fat: 18.5,
      muscle_mass: 67.2
    },
    notes: 'Starting my transformation journey!'
  },
  {
    id: '2',
    date: 'Oct 1, 2024',
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=600&fit=crop',
    angle: 'front',
    is_private: false,
    measurements: {
      weight: 85.0,
      body_fat: 20.5,
      muscle_mass: 65.5
    }
  },
  {
    id: '3',
    date: 'Sep 1, 2024',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop',
    angle: 'side',
    is_private: false,
    measurements: {
      weight: 87.5,
      body_fat: 22.0,
      muscle_mass: 64.0
    }
  }
];

const SAMPLE_MEASUREMENTS: Measurement[] = [
  {
    id: '1',
    date: 'Nov 1, 2024',
    weight: 82.5,
    body_fat: 18.5,
    muscle_mass: 67.2,
    chest: 102,
    waist: 85,
    hips: 98,
    arms: 38,
    thighs: 58,
    calves: 38
  },
  {
    id: '2',
    date: 'Oct 1, 2024',
    weight: 85.0,
    body_fat: 20.5,
    muscle_mass: 65.5,
    chest: 100,
    waist: 88,
    hips: 100,
    arms: 37,
    thighs: 57,
    calves: 37
  },
  {
    id: '3',
    date: 'Sep 1, 2024',
    weight: 87.5,
    body_fat: 22.0,
    muscle_mass: 64.0,
    chest: 99,
    waist: 92,
    hips: 102,
    arms: 36,
    thighs: 56,
    calves: 36
  }
];

export default function ProgressPhotos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<ProgressPhoto[]>(SAMPLE_PHOTOS);
  const [measurements, setMeasurements] = useState<Measurement[]>(SAMPLE_MEASUREMENTS);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPhotos, setComparisonPhotos] = useState<ProgressPhoto[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [filterAngle, setFilterAngle] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  const filteredPhotos = filterAngle === 'all' 
    ? photos 
    : photos.filter(p => p.angle === filterAngle);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ProgressPhoto = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          image_url: reader.result as string,
          angle: 'front',
          is_private: false,
          measurements: {
            weight: 82.5
          }
        };
        setPhotos([newPhoto, ...photos]);
        setUploading(false);
        setShowAddPhoto(true);
        toast({ title: "Photo uploaded! 📸" });
      };
      reader.readAsDataURL(file);
    }, 1000);
  }

  function deletePhoto(photoId: string) {
    setPhotos(photos.filter(p => p.id !== photoId));
    setShowPhotoDetail(false);
    toast({ title: "Photo deleted" });
  }

  function togglePrivacy(photoId: string) {
    setPhotos(photos.map(p =>
      p.id === photoId ? { ...p, is_private: !p.is_private } : p
    ));
  }

  function startComparison() {
    if (comparisonPhotos.length === 2) {
      setShowComparison(true);
    } else {
      toast({
        title: "Select 2 photos",
        description: "Choose 2 photos to compare",
        variant: "destructive"
      });
    }
  }

  function toggleComparisonPhoto(photo: ProgressPhoto) {
    if (comparisonPhotos.find(p => p.id === photo.id)) {
      setComparisonPhotos(comparisonPhotos.filter(p => p.id !== photo.id));
    } else if (comparisonPhotos.length < 2) {
      setComparisonPhotos([...comparisonPhotos, photo]);
    } else {
      toast({
        title: "Maximum 2 photos",
        description: "Remove a photo before adding another",
        variant: "destructive"
      });
    }
  }

  const calculateProgress = () => {
    if (measurements.length < 2) return null;
    
    const latest = measurements[0];
    const oldest = measurements[measurements.length - 1];
    
    return {
      weight_change: latest.weight - oldest.weight,
      body_fat_change: latest.body_fat && oldest.body_fat 
        ? latest.body_fat - oldest.body_fat 
        : null,
      muscle_change: latest.muscle_mass && oldest.muscle_mass
        ? latest.muscle_mass - oldest.muscle_mass
        : null,
      days: Math.floor((new Date(latest.date).getTime() - new Date(oldest.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const progress = calculateProgress();

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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
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
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Camera className="w-6 h-6 text-purple-500" />
                  Progress Photos
                </h1>
                <p className="text-sm text-muted-foreground">Track your transformation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comparisonPhotos.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {comparisonPhotos.length} selected
                </Badge>
              )}
              
              {comparisonPhotos.length === 2 ? (
                <Button
                  onClick={startComparison}
                  variant="outline"
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Compare
                </Button>
              ) : comparisonPhotos.length > 0 ? (
                <Button
                  onClick={() => setComparisonPhotos([])}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              ) : null}

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {uploading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Camera className="w-4 h-4" />
                    </motion.div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Photo
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-3">
            <Select value={filterAngle} onValueChange={setFilterAngle}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by angle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Angles</SelectItem>
                <SelectItem value="front">Front</SelectItem>
                <SelectItem value="side">Side</SelectItem>
                <SelectItem value="back">Back</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('timeline')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Progress Overview */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Your Progress
                  </h2>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {progress.days} Days
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Weight className="w-8 h-8 text-blue-500" />
                          {progress.weight_change < 0 ? (
                            <TrendingDown className="w-6 h-6 text-green-500" />
                          ) : progress.weight_change > 0 ? (
                            <TrendingUp className="w-6 h-6 text-orange-500" />
                          ) : (
                            <Minus className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-3xl font-bold mb-1">
                          {progress.weight_change > 0 ? '+' : ''}{progress.weight_change.toFixed(1)} kg
                        </p>
                        <p className="text-sm text-muted-foreground">Weight Change</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {progress.body_fat_change !== null && (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Activity className="w-8 h-8 text-orange-500" />
                            {progress.body_fat_change < 0 ? (
                              <TrendingDown className="w-6 h-6 text-green-500" />
                            ) : (
                              <TrendingUp className="w-6 h-6 text-orange-500" />
                            )}
                          </div>
                          <p className="text-3xl font-bold mb-1">
                            {progress.body_fat_change > 0 ? '+' : ''}{progress.body_fat_change.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Body Fat</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {progress.muscle_change !== null && (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Zap className="w-8 h-8 text-green-500" />
                            {progress.muscle_change > 0 ? (
                              <TrendingUp className="w-6 h-6 text-green-500" />
                            ) : (
                              <TrendingDown className="w-6 h-6 text-orange-500" />
                            )}
                          </div>
                          <p className="text-3xl font-bold mb-1">
                            {progress.muscle_change > 0 ? '+' : ''}{progress.muscle_change.toFixed(1)} kg
                          </p>
                          <p className="text-sm text-muted-foreground">Muscle Mass</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Photos Grid/Timeline */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
                onClick={() => {
                  if (comparisonPhotos.length > 0) {
                    toggleComparisonPhoto(photo);
                  } else {
                    setSelectedPhoto(photo);
                    setShowPhotoDetail(true);
                  }
                }}
              >
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={photo.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Date Badge */}
                    <Badge className="absolute top-2 left-2">
                      {photo.date}
                    </Badge>

                    {/* Angle Badge */}
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      {photo.angle}
                    </Badge>

                    {/* Privacy Icon */}
                    {photo.is_private && (
                      <Lock className="absolute bottom-2 left-2 w-4 h-4 text-white" />
                    )}

                    {/* Comparison Selection */}
                    {comparisonPhotos.find(p => p.id === photo.id) && (
                      <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </div>
                    )}

                    {/* Hover Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.measurements && (
                        <div className="text-white text-sm space-y-1">
                          <p className="font-bold">{photo.measurements.weight} kg</p>
                          {photo.measurements.body_fat && (
                            <p>{photo.measurements.body_fat}% BF</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-64 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={photo.image_url}
                          alt=""
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setShowPhotoDetail(true);
                          }}
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{photo.date}</h3>
                            <div className="flex items-center gap-2">
                              <Badge>{photo.angle}</Badge>
                              {photo.is_private && (
                                <Badge variant="secondary" className="gap-1">
                                  <Lock className="w-3 h-3" />
                                  Private
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleComparisonPhoto(photo)}
                          >
                            {comparisonPhotos.find(p => p.id === photo.id) ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-500" />
                            ) : (
                              <TrendingUp className="w-5 h-5" />
                            )}
                          </Button>
                        </div>

                        {photo.measurements && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 rounded-lg bg-secondary">
                              <Weight className="w-5 h-5 mb-2 text-blue-500" />
                              <p className="text-2xl font-bold">{photo.measurements.weight}</p>
                              <p className="text-xs text-muted-foreground">kg</p>
                            </div>
                            {photo.measurements.body_fat && (
                              <div className="p-3 rounded-lg bg-secondary">
                                <Activity className="w-5 h-5 mb-2 text-orange-500" />
                                <p className="text-2xl font-bold">{photo.measurements.body_fat}</p>
                                <p className="text-xs text-muted-foreground">% BF</p>
                              </div>
                            )}
                            {photo.measurements.muscle_mass && (
                              <div className="p-3 rounded-lg bg-secondary">
                                <Zap className="w-5 h-5 mb-2 text-green-500" />
                                <p className="text-2xl font-bold">{photo.measurements.muscle_mass}</p>
                                <p className="text-xs text-muted-foreground">kg Muscle</p>
                              </div>
                            )}
                          </div>
                        )}

                        {photo.notes && (
                          <div className="p-4 rounded-lg bg-secondary">
                            <p className="text-sm">{photo.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredPhotos.length === 0 && (
          <Card className="border-2 border-dashed p-12 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">No progress photos yet</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Photo
            </Button>
          </Card>
        )}
      </div>

      {/* Photo Detail Dialog */}
      <Dialog open={showPhotoDetail} onOpenChange={setShowPhotoDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPhoto && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedPhoto.image_url}
                  alt=""
                  className="w-full rounded-lg"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedPhoto.date}</h2>
                  <div className="flex items-center gap-2">
                    <Badge>{selectedPhoto.angle}</Badge>
                    {selectedPhoto.is_private ? (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedPhoto.measurements && (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-3">Measurements</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Weight</span>
                          <span className="font-bold">{selectedPhoto.measurements.weight} kg</span>
                        </div>
                        {selectedPhoto.measurements.body_fat && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Body Fat</span>
                            <span className="font-bold">{selectedPhoto.measurements.body_fat}%</span>
                          </div>
                        )}
                        {selectedPhoto.measurements.muscle_mass && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Muscle Mass</span>
                            <span className="font-bold">{selectedPhoto.measurements.muscle_mass} kg</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedPhoto.notes && (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2">Notes</h3>
                      <p className="text-sm text-muted-foreground">{selectedPhoto.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => togglePrivacy(selectedPhoto.id)}
                  >
                    {selectedPhoto.is_private ? (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Make Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Make Private
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive"
                    onClick={() => deletePhoto(selectedPhoto.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {comparisonPhotos.length === 2 && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">Progress Comparison</DialogTitle>
                <DialogDescription>
                  Compare your transformation between these photos
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comparisonPhotos.map((photo, idx) => (
                  <div key={photo.id} className="space-y-4">
                    <div className="relative">
                      <Badge className="absolute top-2 left-2 z-10">
                        {idx === 0 ? 'Before' : 'After'}
                      </Badge>
                      <img
                        src={photo.image_url}
                        alt=""
                        className="w-full rounded-lg"
                      />
                    </div>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-4">
                        <p className="font-bold mb-2">{photo.date}</p>
                        {photo.measurements && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Weight</span>
                              <span className="font-medium">{photo.measurements.weight} kg</span>
                            </div>
                            {photo.measurements.body_fat && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Body Fat</span>
                                <span className="font-medium">{photo.measurements.body_fat}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Changes */}
              {comparisonPhotos[0].measurements && comparisonPhotos[1].measurements && (
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                  <CardContent className="p-6 relative">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-6 h-6 text-green-500" />
                      Your Progress
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-background">
                        <p className="text-3xl font-bold text-green-600">
                          {(comparisonPhotos[1].measurements.weight - comparisonPhotos[0].measurements.weight).toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">kg Changed</p>
                      </div>
                      {comparisonPhotos[0].measurements.body_fat && comparisonPhotos[1].measurements.body_fat && (
                        <div className="text-center p-4 rounded-lg bg-background">
                          <p className="text-3xl font-bold text-blue-600">
                            {(comparisonPhotos[1].measurements.body_fat - comparisonPhotos[0].measurements.body_fat).toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Body Fat</p>
                        </div>
                      )}
                      <div className="text-center p-4 rounded-lg bg-background">
                        <p className="text-3xl font-bold text-purple-600">
                          {Math.abs(Math.floor((new Date(comparisonPhotos[1].date).getTime() - new Date(comparisonPhotos[0].date).getTime()) / (1000 * 60 * 60 * 24)))}
                        </p>
                        <p className="text-sm text-muted-foreground">Days Apart</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowComparison(false);
                    setComparisonPhotos([]);
                  }}
                >
                  Close
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Comparison
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

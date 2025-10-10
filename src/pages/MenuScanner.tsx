import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronRight,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { menuAnalyzer } from '@/services/menuAnalyzerService';
import confetti from 'canvas-confetti';
import Tesseract from 'tesseract.js';

interface AnalyzedDish {
  name: string;
  description?: string;
  price?: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  health_score: number;
  approved: boolean;
  red_flags: string[];
  positives: string[];
  modifications: string[];
  reasoning: string;
  betterAlternatives?: string[];
}

export default function MenuScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [analyzedDishes, setAnalyzedDishes] = useState<AnalyzedDish[]>([]);
  const [selectedDish, setSelectedDish] = useState<AnalyzedDish | null>(null);
  const [showDishDetail, setShowDishDetail] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsScanning(true);

    try {
      // Upload image to get URL
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(`${user.id}/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(`${user.id}/${fileName}`);

      setImageUrl(publicUrl);

      // OCR Processing
      toast({
        title: "Scanning menu... 📸",
        description: "Reading text from image"
      });

      const { data: { text } } = await Tesseract.recognize(file, 'eng');

      setOcrText(text);

      // Parse menu text
      const dishes = menuAnalyzer.parseMenuText(text);

      // Get user goal
      const { data: goals } = await supabase
        .from('goals')
        .select('type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // Analyze dishes
      const analyzed = await menuAnalyzer.analyzeMenu(dishes, goals?.type || 'maintenance');

      setAnalyzedDishes(analyzed);

      // Save to database
      await menuAnalyzer.saveMenuScan(
        restaurantName || 'Unknown Restaurant',
        analyzed,
        publicUrl,
        text
      );

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Menu analyzed! 🎉",
        description: `Found ${analyzed.length} dishes`
      });

    } catch (error) {
      console.error('Error scanning menu:', error);
      toast({
        title: "Error scanning menu",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
    disabled: isScanning
  });

  function viewDishDetails(dish: AnalyzedDish) {
    setSelectedDish(dish);
    setShowDishDetail(true);
  }

  async function addToDiary(dish: AnalyzedDish) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      await supabase.from('food_logs').insert({
        user_id: user.id,
        food_name: dish.name,
        calories: dish.calories,
        protein_g: dish.protein,
        carbs_g: dish.carbs,
        fats_g: dish.fats,
        meal_type: 'lunch',
        date: today,
        time: new Date().toTimeString().split(' ')[0]
      });

      await menuAnalyzer.saveOrderToHistory(
        restaurantName,
        {
          ...dish,
          better_alternatives: dish.betterAlternatives || []
        },
        'lunch',
        dish.modifications.join(', ')
      );

      toast({
        title: "Added to diary! ✅",
        description: `${dish.name} logged`
      });

      setShowDishDetail(false);
    } catch (error) {
      console.error('Error adding to diary:', error);
      toast({
        title: "Error adding to diary",
        variant: "destructive"
      });
    }
  }

  // Group dishes by approval status
  const approvedDishes = analyzedDishes.filter(d => d.approved);
  const cautionDishes = analyzedDishes.filter(d => !d.approved && d.health_score >= 50);
  const avoidDishes = analyzedDishes.filter(d => !d.approved && d.health_score < 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b"
      >
        <div className="container mx-auto px-4 py-4">
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
                Menu Decoder AI
              </h1>
              <p className="text-sm text-muted-foreground">
                Scan menus, get instant health analysis
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Upload Area */}
        {analyzedDishes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-2xl mb-6">
              <CardContent className="p-6">
                {/* Restaurant Name Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Restaurant Name (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Chipotle, McDonald's, etc."
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-border hover:border-purple-500/50'
                  } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getInputProps()} />
                  
                  {isScanning ? (
                    <div className="space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-20 h-20 mx-auto text-purple-500" />
                      </motion.div>
                      <h3 className="text-2xl font-bold">Analyzing Menu...</h3>
                      <p className="text-muted-foreground">
                        Reading dishes and calculating health scores
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-20 h-20 mx-auto mb-4 text-purple-500" />
                      <h3 className="text-2xl font-bold mb-2">
                        {isDragActive ? 'Drop it!' : 'Scan Restaurant Menu'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Take a photo or upload an image of any menu
                      </p>
                      <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500">
                        <Upload className="w-4 h-4" />
                        Upload Menu Photo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {[
                    { icon: CheckCircle2, label: 'AI Health Scores', color: 'text-green-500' },
                    { icon: Zap, label: 'Smart Modifications', color: 'text-blue-500' },
                    { icon: Sparkles, label: 'Better Alternatives', color: 'text-purple-500' }
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 rounded-lg bg-secondary"
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      <span className="font-medium text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {analyzedDishes.length > 0 && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                      {restaurantName || 'Restaurant Menu'}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAnalyzedDishes([]);
                        setOcrText('');
                        setImageUrl('');
                      }}
                    >
                      Scan Another
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-3xl font-bold text-green-600">{approvedDishes.length}</p>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-3xl font-bold text-yellow-600">{cautionDishes.length}</p>
                      <p className="text-sm text-muted-foreground">Caution</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-3xl font-bold text-red-600">{avoidDishes.length}</p>
                      <p className="text-sm text-muted-foreground">Avoid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Approved Dishes */}
            {approvedDishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <h3 className="text-xl font-bold">✅ Approved Dishes</h3>
                      <Badge className="bg-green-500">{approvedDishes.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {approvedDishes.map((dish, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => viewDishDetails(dish)}
                          className="cursor-pointer"
                        >
                          <Card className="border-2 border-green-500 hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-green-500 text-lg px-3 py-1">
                                  {dish.health_score}
                                </Badge>
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                              </div>

                              <h4 className="font-bold text-lg mb-2 line-clamp-2">
                                {dish.name}
                              </h4>

                              {dish.price && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {dish.price}
                                </p>
                              )}

                              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.calories}</p>
                                  <p className="text-muted-foreground">cal</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.protein}g</p>
                                  <p className="text-muted-foreground">protein</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.carbs}g</p>
                                  <p className="text-muted-foreground">carbs</p>
                                </div>
                              </div>

                              {dish.positives.length > 0 && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    {dish.positives[0]}
                                  </p>
                                </div>
                              )}

                              <Button 
                                variant="ghost" 
                                className="w-full mt-3 gap-2 text-xs"
                              >
                                View Details
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Caution Dishes */}
            {cautionDishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-bold">⚠️ Caution - Can Be Modified</h3>
                      <Badge className="bg-yellow-500">{cautionDishes.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cautionDishes.map((dish, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => viewDishDetails(dish)}
                          className="cursor-pointer"
                        >
                          <Card className="border-2 border-yellow-500 hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-yellow-500 text-lg px-3 py-1">
                                  {dish.health_score}
                                </Badge>
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                              </div>

                              <h4 className="font-bold text-lg mb-2 line-clamp-2">
                                {dish.name}
                              </h4>

                              {dish.price && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {dish.price}
                                </p>
                              )}

                              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.calories}</p>
                                  <p className="text-muted-foreground">cal</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.protein}g</p>
                                  <p className="text-muted-foreground">protein</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.carbs}g</p>
                                  <p className="text-muted-foreground">carbs</p>
                                </div>
                              </div>

                              {dish.modifications.length > 0 && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-blue-700 dark:text-blue-300">
                                    {dish.modifications[0]}
                                  </p>
                                </div>
                              )}

                              <Button 
                                variant="ghost" 
                                className="w-full mt-3 gap-2 text-xs"
                              >
                                View Modifications
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Avoid Dishes */}
            {avoidDishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <h3 className="text-xl font-bold">❌ Not Recommended</h3>
                      <Badge className="bg-red-500">{avoidDishes.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {avoidDishes.map((dish, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => viewDishDetails(dish)}
                          className="cursor-pointer"
                        >
                          <Card className="border-2 border-red-500 hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-red-500 text-lg px-3 py-1">
                                  {dish.health_score}
                                </Badge>
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                              </div>

                              <h4 className="font-bold text-lg mb-2 line-clamp-2">
                                {dish.name}
                              </h4>

                              {dish.price && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {dish.price}
                                </p>
                              )}

                              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold text-red-600">{dish.calories}</p>
                                  <p className="text-muted-foreground">cal</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.protein}g</p>
                                  <p className="text-muted-foreground">protein</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold text-red-600">{dish.fats}g</p>
                                  <p className="text-muted-foreground">fats</p>
                                </div>
                              </div>

                              {dish.red_flags.length > 0 && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-red-700 dark:text-red-300">
                                    {dish.red_flags[0]}
                                  </p>
                                </div>
                              )}

                              <Button 
                                variant="ghost" 
                                className="w-full mt-3 gap-2 text-xs"
                              >
                                View Alternatives
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Dish Detail Dialog */}
      <Dialog open={showDishDetail} onOpenChange={setShowDishDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDish && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">{selectedDish.name}</DialogTitle>
                  <Badge className={`text-xl px-4 py-2 ${
                    selectedDish.approved ? 'bg-green-500' :
                    selectedDish.health_score >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    Score: {selectedDish.health_score}
                  </Badge>
                </div>
                {selectedDish.description && (
                  <DialogDescription className="text-base">
                    {selectedDish.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Status Banner */}
              {selectedDish.approved ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <div>
                      <h3 className="text-xl font-bold text-green-600 mb-1">✅ APPROVED!</h3>
                      <p className="text-sm">{selectedDish.reasoning}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-xl border-2 ${
                    selectedDish.health_score >= 50
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500'
                      : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <AlertTriangle className={`w-12 h-12 ${
                      selectedDish.health_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                    <div>
                      <h3 className={`text-xl font-bold mb-1 ${
                        selectedDish.health_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedDish.health_score >= 50 ? '⚠️ CAUTION' : '❌ NOT RECOMMENDED'}
                      </h3>
                      <p className="text-sm">{selectedDish.reasoning}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Nutrition Facts */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Nutrition Facts (Estimated)</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold">{selectedDish.calories}</p>
                      <p className="text-sm text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold text-blue-600">{selectedDish.protein}g</p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold text-orange-600">{selectedDish.carbs}g</p>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold text-yellow-600">{selectedDish.fats}g</p>
                      <p className="text-sm text-muted-foreground">Fats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Red Flags */}
              {selectedDish.red_flags.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Red Flags
                    </h3>
                    <ul className="space-y-2">
                      {selectedDish.red_flags.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Positives */}
              {selectedDish.positives.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      What's Good
                    </h3>
                    <ul className="space-y-2">
                      {selectedDish.positives.map((positive, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>{positive}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Modifications */}
              {selectedDish.modifications.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      Smart Modifications
                    </h3>
                    <ul className="space-y-2">
                      {selectedDish.modifications.map((mod, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Better Alternatives */}
              {selectedDish.betterAlternatives && selectedDish.betterAlternatives.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Better Alternatives on Menu
                    </h3>
                    <ul className="space-y-2">
                      {selectedDish.betterAlternatives.map((alt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-500">•</span>
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDishDetail(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    addToDiary(selectedDish);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Add to Diary
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

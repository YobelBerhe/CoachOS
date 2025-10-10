import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import {
  ArrowLeft,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Zap,
  ChevronRight,
  Search,
  MapPin,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { menuAnalyzer } from '@/services/menuAnalyzerService';
import confetti from 'canvas-confetti';

interface AnalyzedDish {
  name: string;
  description?: string;
  price?: string;
  category: string;
  health_score: number;
  approved: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  red_flags: string[];
  positives: string[];
  modifications: string[];
  better_alternatives: string[];
  reasoning: string;
}

export default function MenuScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [restaurantName, setRestaurantName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzedMenu, setAnalyzedMenu] = useState<AnalyzedDish[]>([]);
  const [selectedDish, setSelectedDish] = useState<AnalyzedDish | null>(null);
  const [showDishDetail, setShowDishDetail] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processMenu(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.heic'] },
    maxFiles: 1
  });

  async function processMenu(file: File) {
    if (!restaurantName.trim()) {
      toast({
        title: "Restaurant name required",
        description: "Please enter the restaurant name first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setOcrProgress(0);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // OCR processing
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 50)); // 0-50%
            }
          }
        }
      );

      setOcrProgress(60);

      // Parse menu
      const dishes = menuAnalyzer.parseMenuText(result.data.text);
      
      setOcrProgress(70);

      // Analyze dishes
      const analyzed = await menuAnalyzer.analyzeMenu(dishes);
      
      setOcrProgress(90);

      // Save to database
      await menuAnalyzer.saveMenuScan(restaurantName, analyzed, uploadedImage, result.data.text);

      setOcrProgress(100);
      setAnalyzedMenu(analyzed);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "🎉 Menu analyzed!",
        description: `Found ${analyzed.length} dishes`
      });

    } catch (error) {
      console.error('Error processing menu:', error);
      toast({
        title: "Error processing menu",
        description: "Please try again with a clearer image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function viewDishDetails(dish: AnalyzedDish) {
    setSelectedDish(dish);
    setShowDishDetail(true);
  }

  const approvedDishes = analyzedMenu.filter(d => d.approved);
  const cautionDishes = analyzedMenu.filter(d => !d.approved && d.health_score >= 50);
  const avoidDishes = analyzedMenu.filter(d => d.health_score < 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b"
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
                  Menu Decoder AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  World's first real-time menu analyzer
                </p>
              </div>
            </div>

            {analyzedMenu.length > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                {approvedDishes.length} Approved
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {analyzedMenu.length === 0 ? (
          /* UPLOAD SECTION */
          <div className="space-y-6">
            {/* Restaurant Name Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <Label className="text-lg mb-3 block">Restaurant Name *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="e.g., Chipotle, McDonald's, The Cheesecake Factory"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="pl-10 h-14 text-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-8">
                  {!isProcessing ? (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                        isDragActive
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-border hover:border-purple-500/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6"
                      >
                        <Camera className="w-12 h-12 text-white" />
                      </motion.div>

                      <h3 className="text-2xl font-bold mb-2">
                        {isDragActive ? 'Drop it here!' : 'Scan Restaurant Menu'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Take a photo of any menu and get instant health analysis
                      </p>

                      <div className="flex items-center justify-center gap-3">
                        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500">
                          <Camera className="w-4 h-4" />
                          Take Photo
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full mb-6"
                      />
                      <h3 className="text-xl font-bold mb-2">Analyzing Menu...</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {ocrProgress < 60 ? 'Reading text from image' :
                         ocrProgress < 80 ? 'Analyzing dishes' :
                         'Calculating health scores'}
                      </p>
                      <Progress value={ocrProgress} className="h-2 max-w-xs mx-auto" />
                      <p className="text-xs text-muted-foreground mt-2">{ocrProgress}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: Sparkles, title: 'AI Powered', desc: 'GPT-4 analysis' },
                { icon: CheckCircle2, title: 'Instant Results', desc: 'Under 10 seconds' },
                { icon: TrendingUp, title: 'Health Scores', desc: '0-100 rating' },
                { icon: Zap, title: 'Smart Swaps', desc: 'Better alternatives' }
              ].map((feature, idx) => (
                <Card key={idx} className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <feature.icon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="font-semibold text-sm mb-1">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* RESULTS SECTION */
          <div className="space-y-6">
            {/* Header with Restaurant */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{restaurantName}</h2>
                      <p className="text-sm text-muted-foreground">
                        {analyzedMenu.length} dishes analyzed
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setAnalyzedMenu([]);
                      setRestaurantName('');
                      setUploadedImage(null);
                    }}
                    variant="outline"
                  >
                    Scan New Menu
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-2xl font-bold text-green-600">{approvedDishes.length}</p>
                    <p className="text-xs text-muted-foreground">✅ Approved</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-2xl font-bold text-yellow-600">{cautionDishes.length}</p>
                    <p className="text-xs text-muted-foreground">⚠️ Caution</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-600">{avoidDishes.length}</p>
                    <p className="text-xs text-muted-foreground">❌ Avoid</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DISHES GRID CONTINUES IN NEXT MESSAGE! */}
          </div>
        )}
      </div>

      {/* Dish Detail Dialog - COMING NEXT! */}
    </div>
  );
}

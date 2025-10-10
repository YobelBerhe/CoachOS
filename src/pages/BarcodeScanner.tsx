import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Camera,
  Scan,
  Zap,
  Flame,
  Apple,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Plus,
  History,
  Search,
  Scale,
  Activity,
  Droplet,
  Wheat,
  Beef,
  ShoppingCart,
  TrendingUp,
  Shield,
  Ban,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Heart,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ScanMode = 'grocery' | 'calorie';

interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  image: string;
  serving_size: string;
  servings_per_container: number;
  
  // Nutrition
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  
  // Health Analysis (Bobby-style)
  health_analysis: {
    approved: boolean;
    health_score: number; // 0-100
    processing_level: 'minimal' | 'processed' | 'ultra-processed';
    warnings: string[];
    red_flags: string[];
    positives: string[];
  };
  
  // Ingredients
  ingredients: string[];
  harmful_ingredients: string[];
  allergens: string[];
  
  // Alternatives
  alternatives?: Array<{
    name: string;
    brand: string;
    image: string;
    health_score: number;
    price_diff: string;
  }>;
}

// Enhanced sample products with health analysis
const SAMPLE_PRODUCTS: { [key: string]: ScannedProduct } = {
  '123456789': {
    barcode: '123456789',
    name: 'Organic Protein Bar',
    brand: 'FitFuel',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4cda81ff?w=400&h=400&fit=crop',
    serving_size: '1 bar (60g)',
    servings_per_container: 1,
    nutrition: {
      calories: 220,
      protein: 20,
      carbs: 24,
      fats: 8,
      fiber: 3,
      sugar: 2,
      sodium: 180,
    },
    health_analysis: {
      approved: true,
      health_score: 85,
      processing_level: 'minimal',
      warnings: [],
      red_flags: [],
      positives: [
        'High in protein (20g)',
        'Low sugar (2g)',
        'Good fiber content',
        'No artificial sweeteners',
        'Organic ingredients'
      ]
    },
    ingredients: [
      'Organic Whey Protein',
      'Organic Almonds',
      'Organic Dates',
      'Organic Coconut Oil',
      'Sea Salt',
      'Natural Vanilla'
    ],
    harmful_ingredients: [],
    allergens: ['Milk', 'Tree Nuts'],
    alternatives: []
  },
  '987654321': {
    barcode: '987654321',
    name: 'Chocolate Protein Bar',
    brand: 'QuickFuel',
    image: 'https://images.unsplash.com/photo-1604480133435-25b9f2c3b290?w=400&h=400&fit=crop',
    serving_size: '1 bar (60g)',
    servings_per_container: 1,
    nutrition: {
      calories: 280,
      protein: 15,
      carbs: 35,
      fats: 12,
      fiber: 1,
      sugar: 22,
      sodium: 250,
    },
    health_analysis: {
      approved: false,
      health_score: 35,
      processing_level: 'ultra-processed',
      warnings: [
        'High in added sugar (22g)',
        'Contains artificial sweeteners',
        'Low fiber content',
        'High sodium'
      ],
      red_flags: [
        'Sucralose (artificial sweetener)',
        'Soybean oil (seed oil)',
        'Natural flavors (vague ingredient)',
        'Maltodextrin (blood sugar spike)'
      ],
      positives: [
        'Contains protein (15g)'
      ]
    },
    ingredients: [
      'Soy Protein Isolate',
      'Corn Syrup',
      'Sugar',
      'Soybean Oil',
      'Cocoa Powder',
      'Maltodextrin',
      'Natural & Artificial Flavors',
      'Sucralose',
      'Soy Lecithin'
    ],
    harmful_ingredients: [
      'Sucralose',
      'Soybean Oil',
      'Maltodextrin',
      'Corn Syrup'
    ],
    allergens: ['Soy'],
    alternatives: [
      {
        name: 'Organic Protein Bar',
        brand: 'FitFuel',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4cda81ff?w=200&h=200&fit=crop',
        health_score: 85,
        price_diff: '+$0.50'
      }
    ]
  },
  '111222333': {
    barcode: '111222333',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
    serving_size: '1 container (170g)',
    servings_per_container: 1,
    nutrition: {
      calories: 100,
      protein: 17,
      carbs: 6,
      fats: 0,
      fiber: 0,
      sugar: 4,
      sodium: 65,
    },
    health_analysis: {
      approved: true,
      health_score: 95,
      processing_level: 'minimal',
      warnings: [],
      red_flags: [],
      positives: [
        'Excellent protein source (17g)',
        'Low fat (0g)',
        'Contains probiotics',
        'Minimal ingredients',
        'Low sugar',
        'No additives'
      ]
    },
    ingredients: [
      'Cultured Nonfat Milk',
      'Live Active Cultures'
    ],
    harmful_ingredients: [],
    allergens: ['Milk']
  }
};

export default function BarcodeScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [scanMode, setScanMode] = useState<ScanMode>('grocery');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setIsScanning(true);
        
        toast({ title: "Camera activated! 📸" });
        
        // Simulate barcode detection
        setTimeout(() => {
          const randomProduct = Object.keys(SAMPLE_PRODUCTS)[
            Math.floor(Math.random() * Object.keys(SAMPLE_PRODUCTS).length)
          ];
          simulateScan(randomProduct);
        }, 3000);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera access denied",
        description: "Please enable camera permissions",
        variant: "destructive"
      });
    }
  }

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setIsScanning(false);
    }
  }

  function simulateScan(barcode: string) {
    const product = SAMPLE_PRODUCTS[barcode];
    
    if (product) {
      setScannedProduct(product);
      setShowProductDetail(true);
      stopCamera();
      
      // Different reactions based on mode and approval
      if (scanMode === 'grocery') {
        if (product.health_analysis.approved) {
          toast({
            title: "✅ APPROVED!",
            description: `${product.name} is a great choice!`,
          });
        } else {
          toast({
            title: "❌ NOT APPROVED",
            description: `${product.name} has health concerns`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Product found! 📊",
          description: `${product.nutrition.calories} calories`,
        });
      }
    } else {
      toast({
        title: "Product not found",
        variant: "destructive"
      });
    }
  }

  function addToFoodDiary() {
    if (!scannedProduct) return;
    
    toast({
      title: "Added to food diary! 📝",
      description: `${scannedProduct.name} logged`
    });
    
    setShowProductDetail(false);
  }

  function getHealthScoreColor(score: number) {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  }

  function getHealthScoreGradient(score: number) {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
  }

  const FloatingOrb = ({ delay = 0, color = "green" }: any) => (
    <motion.div
      className={`absolute w-96 h-96 rounded-full bg-gradient-to-br ${
        color === 'green' ? 'from-green-500/20 to-emerald-500/20' :
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-500/5 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} color="green" />
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
                  <Scan className="w-6 h-6 text-green-500" />
                  Smart Scanner
                </h1>
                <p className="text-sm text-muted-foreground">
                  {scanMode === 'grocery' ? 'Health checker for shopping' : 'Quick calorie lookup'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/scan-history')}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
          </div>

          {/* Mode Switcher */}
          <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as ScanMode)} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-secondary/50">
              <TabsTrigger value="grocery" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Grocery Mode
              </TabsTrigger>
              <TabsTrigger value="calorie" className="gap-2">
                <Flame className="w-4 h-4" />
                Calorie Mode
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Mode Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className={`absolute inset-0 ${
              scanMode === 'grocery' 
                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10'
                : 'bg-gradient-to-br from-orange-500/10 to-red-500/10'
            }`} />
            <CardContent className="p-6 relative">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                  scanMode === 'grocery'
                    ? 'from-green-500 to-emerald-500'
                    : 'from-orange-500 to-red-500'
                } flex items-center justify-center flex-shrink-0`}>
                  {scanMode === 'grocery' ? (
                    <ShoppingCart className="w-8 h-8 text-white" />
                  ) : (
                    <Flame className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {scanMode === 'grocery' ? '🛒 Grocery Scanner' : '📊 Calorie Scanner'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {scanMode === 'grocery' 
                      ? 'Scan products while shopping to see if they\'re approved! Get instant health scores, ingredient warnings, and better alternatives.'
                      : 'Quick nutrition lookup! Scan any food to see calories and macros. Perfect for tracking your meals.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scanMode === 'grocery' ? (
                      <>
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved/Not Approved
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Ingredient Warnings
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Better Alternatives
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="gap-1">
                          <Flame className="w-3 h-3" />
                          Instant Calories
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Activity className="w-3 h-3" />
                          Macros Breakdown
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Plus className="w-3 h-3" />
                          Quick Log
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scanner Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              {/* Camera View */}
              <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Scanning Overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-64 h-64">
                          <div className="absolute inset-0 border-4 border-green-500 rounded-lg">
                            <motion.div
                              className="absolute inset-x-0 top-0 h-1 bg-green-500"
                              animate={{ y: [0, 256, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                          </div>
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-white bg-black/70 px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap">
                            {scanMode === 'grocery' ? '🛒 Scanning for health...' : '📊 Reading nutrition...'}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-12">
                    <Scan className="w-24 h-24 mx-auto mb-6 text-green-500" />
                    <h2 className="text-2xl font-bold mb-2">Ready to Scan</h2>
                    <p className="text-muted-foreground mb-6">
                      {scanMode === 'grocery' 
                        ? 'Point your camera at a product barcode while shopping'
                        : 'Scan any food barcode for instant nutrition info'
                      }
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button
                        size="lg"
                        onClick={startCamera}
                        className={`${
                          scanMode === 'grocery'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                        }`}
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Start Scanning
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowManualEntry(true)}
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Enter Barcode Manually
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              {cameraActive && (
                <div className="p-4 bg-black/90 backdrop-blur flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={stopCamera}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowManualEntry(true)}
                    className="text-white hover:bg-white/20"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Manual Entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {scannedProduct && (
            <div className="space-y-6">
              {/* Product Header with Approval Status */}
              <div className="relative -m-6 mb-6">
                {scanMode === 'grocery' && (
                  <div className={`absolute inset-0 ${
                    scannedProduct.health_analysis.approved
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                      : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'
                  }`} />
                )}
                
                <div className="relative p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 aspect-square rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <img
                      src={scannedProduct.image}
                      alt={scannedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-1">{scannedProduct.name}</h2>
                        <p className="text-lg text-muted-foreground mb-2">{scannedProduct.brand}</p>
                        <Badge variant="secondary">{scannedProduct.serving_size}</Badge>
                      </div>
                      
                      {/* Health Score (Grocery Mode) or Calories (Calorie Mode) */}
                      {scanMode === 'grocery' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                          className={`w-24 h-24 rounded-full bg-gradient-to-br ${getHealthScoreGradient(scannedProduct.health_analysis.health_score)} flex flex-col items-center justify-center text-white shadow-xl`}
                        >
                          <p className="text-3xl font-bold">{scannedProduct.health_analysis.health_score}</p>
                          <p className="text-xs">SCORE</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex flex-col items-center justify-center text-white shadow-xl"
                        >
                          <p className="text-3xl font-bold">{scannedProduct.nutrition.calories}</p>
                          <p className="text-xs">CALORIES</p>
                        </motion.div>
                      )}
                    </div>

                    {/* Approval Status (Grocery Mode Only) */}
                    {scanMode === 'grocery' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 ${
                          scannedProduct.health_analysis.approved
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-red-500/10 border-red-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {scannedProduct.health_analysis.approved ? (
                            <>
                              <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                              <div>
                                <p className="font-bold text-lg text-green-600">✅ APPROVED!</p>
                                <p className="text-sm text-muted-foreground">This is a great healthy choice</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                              <div>
                                <p className="font-bold text-lg text-red-600">❌ NOT APPROVED</p>
                                <p className="text-sm text-muted-foreground">Contains unhealthy ingredients</p>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Continue with nutrition, warnings, etc... */}
              {/* I'll add the rest in the next message! */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

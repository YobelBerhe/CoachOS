// Smart Barcode Scanner - Integrates with Open Food Facts API
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
  X,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchProductByBarcode } from '@/services/barcodeApi';
import { ScannedProduct, ScanHistory } from '@/types/barcode';

type ScanMode = 'grocery' | 'calorie';

// Enhanced sample products with Bobby-style analysis
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
      cholesterol: 0,
      saturated_fat: 2,
      trans_fat: 0
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
        'Good fiber content (3g)',
        'No artificial sweeteners',
        'Organic ingredients',
        'No seed oils'
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
    allergens: ['Milk', 'Tree Nuts (Almonds)'],
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
      cholesterol: 5,
      saturated_fat: 4,
      trans_fat: 0
    },
    health_analysis: {
      approved: false,
      health_score: 35,
      processing_level: 'ultra-processed',
      warnings: [
        'High in added sugar (22g)',
        'Contains artificial sweeteners',
        'Very low fiber content',
        'High sodium (250mg)'
      ],
      red_flags: [
        'Sucralose (artificial sweetener - may affect gut bacteria)',
        'Soybean Oil (inflammatory seed oil)',
        'Natural Flavors (vague ingredient - could be anything)',
        'Maltodextrin (spikes blood sugar)',
        'Corn Syrup (added sugar)'
      ],
      positives: [
        'Contains some protein (15g)'
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
      cholesterol: 5,
      saturated_fat: 0,
      trans_fat: 0
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
        'Contains probiotics for gut health',
        'Minimal ingredients',
        'Low natural sugar (4g)',
        'No additives or preservatives'
      ]
    },
    ingredients: [
      'Cultured Nonfat Milk',
      'Live Active Cultures (L. Bulgaricus, S. Thermophilus)'
    ],
    harmful_ingredients: [],
    allergens: ['Milk']
  },
  '444555666': {
    barcode: '444555666',
    name: 'Granola Bar',
    brand: 'Nature Valley',
    image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ccf?w=400&h=400&fit=crop',
    serving_size: '2 bars (42g)',
    servings_per_container: 1,
    nutrition: {
      calories: 190,
      protein: 4,
      carbs: 29,
      fats: 7,
      fiber: 2,
      sugar: 11,
      sodium: 160,
      cholesterol: 0,
      saturated_fat: 1,
      trans_fat: 0
    },
    health_analysis: {
      approved: false,
      health_score: 45,
      processing_level: 'processed',
      warnings: [
        'High sugar content (11g)',
        'Low protein (4g)',
        'Contains refined oils'
      ],
      red_flags: [
        'Canola Oil (inflammatory seed oil)',
        'High Fructose Corn Syrup',
        'Soy Lecithin'
      ],
      positives: [
        'Contains whole grain oats',
        'Some fiber content'
      ]
    },
    ingredients: [
      'Whole Grain Oats',
      'Sugar',
      'Canola Oil',
      'High Fructose Corn Syrup',
      'Honey',
      'Salt',
      'Soy Lecithin',
      'Natural Flavor'
    ],
    harmful_ingredients: [
      'Canola Oil',
      'High Fructose Corn Syrup'
    ],
    allergens: ['Soy', 'May contain tree nuts'],
    alternatives: [
      {
        name: 'Organic Granola Bar',
        brand: 'KIND',
        image: 'https://images.unsplash.com/photo-1560717845-968905b32b0b?w=200&h=200&fit=crop',
        health_score: 78,
        price_diff: '+$0.75'
      }
    ]
  }
};

const SAMPLE_HISTORY: ScanHistory[] = [
  {
    id: '1',
    product: SAMPLE_PRODUCTS['123456789'],
    scanned_at: '2h ago',
    added_to_diary: true
  },
  {
    id: '2',
    product: SAMPLE_PRODUCTS['987654321'],
    scanned_at: '5h ago',
    added_to_diary: false
  }
];

export default function BarcodeScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [scanMode, setScanMode] = useState<ScanMode>('grocery');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>(SAMPLE_HISTORY);
  const [showHistory, setShowHistory] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
        
        // Simulate barcode detection - randomly pick a product
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

  async function simulateScan(barcode: string) {
    setIsScanning(true);
    
    try {
      // First try real API
      let product = await fetchProductByBarcode(barcode);
      
      // Fallback to sample data if not found
      if (!product) {
        product = SAMPLE_PRODUCTS[barcode];
      }
      
      if (product) {
        setScannedProduct(product);
        setShowProductDetail(true);
        stopCamera();
        
        // Add to history
        const historyItem: ScanHistory = {
          id: Date.now().toString(),
          product,
          scanned_at: 'Just now',
          added_to_diary: false
        };
        setScanHistory([historyItem, ...scanHistory]);
        
        // Save to database
        await saveToDatabase(product);
        
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
            description: `${product.nutrition.calories} calories per serving`,
          });
        }
      } else {
        toast({
          title: "Product not found",
          description: "Try another barcode or enter manually",
          variant: "destructive"
        });
        stopCamera();
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Error scanning product",
        description: "Please try again",
        variant: "destructive"
      });
      stopCamera();
    } finally {
      setIsScanning(false);
    }
  }

  async function saveToDatabase(product: ScannedProduct) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('scanned_products').insert({
        user_id: user.id,
        barcode: product.barcode,
        product_name: product.name,
        brand: product.brand,
        nutrition_data: product.nutrition,
        health_score: product.health_analysis.health_score,
        approved: product.health_analysis.approved
      });
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  }

  function manualScan() {
    if (!manualBarcode.trim()) return;
    simulateScan(manualBarcode);
    setManualBarcode('');
    setShowManualEntry(false);
  }

  function addToDiary() {
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
              onClick={() => setShowHistory(true)}
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

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm font-medium mb-1">Instant Results</p>
                <p className="text-xs text-muted-foreground">Get info in seconds</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium mb-1">Smart Analysis</p>
                <p className="text-xs text-muted-foreground">AI-powered scoring</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium mb-1">Quick Logging</p>
                <p className="text-xs text-muted-foreground">Add to diary instantly</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Product Detail Dialog - CONTINUED IN NEXT MESSAGE */}
    </div>
  );
}
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
                              <div className="flex-shrink-0">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </motion.div>
                              </div>
                              <div>
                                <p className="font-bold text-xl text-green-600">✅ APPROVED!</p>
                                <p className="text-sm">This is a great healthy choice for your cart</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-shrink-0">
                                <XCircle className="w-10 h-10 text-red-500" />
                              </div>
                              <div>
                                <p className="font-bold text-xl text-red-600">❌ NOT APPROVED</p>
                                <p className="text-sm">Contains unhealthy ingredients - check alternatives below</p>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Processing Level (Grocery Mode) */}
                    {scanMode === 'grocery' && (
                      <div className="mt-4">
                        <Badge
                          className={
                            scannedProduct.health_analysis.processing_level === 'minimal'
                              ? 'bg-green-500'
                              : scannedProduct.health_analysis.processing_level === 'processed'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }
                        >
                          {scannedProduct.health_analysis.processing_level.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Positives (Grocery Mode) */}
              {scanMode === 'grocery' && scannedProduct.health_analysis.positives.length > 0 && (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                  <CardContent className="p-6 relative">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-500" />
                      What's Good
                    </h3>
                    <div className="space-y-2">
                      {scannedProduct.health_analysis.positives.map((positive, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{positive}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Red Flags (Grocery Mode) */}
              {scanMode === 'grocery' && scannedProduct.health_analysis.red_flags.length > 0 && (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10" />
                  <CardContent className="p-6 relative">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Ban className="w-5 h-5 text-red-500" />
                      Red Flags
                    </h3>
                    <div className="space-y-3">
                      {scannedProduct.health_analysis.red_flags.map((flag, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                        >
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{flag}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warnings (Grocery Mode) */}
              {scanMode === 'grocery' && scannedProduct.health_analysis.warnings.length > 0 && (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10" />
                  <CardContent className="p-6 relative">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Health Warnings
                    </h3>
                    <div className="space-y-2">
                      {scannedProduct.health_analysis.warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nutrition Facts */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-4">Nutrition Facts</h3>
                  
                  <div className="space-y-4">
                    {/* Macros */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                        <Flame className="w-8 h-8 text-orange-500 mb-2" />
                        <p className="text-2xl font-bold">{scannedProduct.nutrition.calories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <Beef className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{scannedProduct.nutrition.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <Wheat className="w-8 h-8 text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">{scannedProduct.nutrition.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                        <Droplet className="w-8 h-8 text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold">{scannedProduct.nutrition.fats}g</p>
                        <p className="text-xs text-muted-foreground">Fats</p>
                      </div>
                    </div>

                    {/* Detailed Nutrition */}
                    <div className="pt-4 border-t space-y-2 text-sm">
                      {[
                        { label: 'Fiber', value: scannedProduct.nutrition.fiber, unit: 'g' },
                        { label: 'Sugar', value: scannedProduct.nutrition.sugar, unit: 'g' },
                        { label: 'Sodium', value: scannedProduct.nutrition.sodium, unit: 'mg' },
                        { label: 'Cholesterol', value: scannedProduct.nutrition.cholesterol, unit: 'mg' },
                        { label: 'Saturated Fat', value: scannedProduct.nutrition.saturated_fat, unit: 'g' },
                        { label: 'Trans Fat', value: scannedProduct.nutrition.trans_fat, unit: 'g' }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-bold">{item.value}{item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Ingredients</h3>
                  <div className="space-y-2">
                    {scannedProduct.ingredients.map((ingredient, idx) => {
                      const isHarmful = scannedProduct.harmful_ingredients.includes(ingredient);
                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-sm ${
                            isHarmful
                              ? 'bg-red-500/10 border border-red-500/20 text-red-600 font-medium'
                              : 'bg-secondary'
                          }`}
                        >
                          {isHarmful && <Ban className="w-3 h-3 inline mr-2" />}
                          {ingredient}
                          {isHarmful && ' ⚠️'}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Allergens */}
              {scannedProduct.allergens.length > 0 && (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10" />
                  <CardContent className="p-6 relative">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Allergen Information
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {scannedProduct.allergens.map(allergen => (
                        <Badge key={allergen} variant="destructive" className="text-sm">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Better Alternatives (Grocery Mode) */}
              {scanMode === 'grocery' && scannedProduct.alternatives && scannedProduct.alternatives.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Better Alternatives
                    </h3>
                    <div className="space-y-3">
                      {scannedProduct.alternatives.map((alt, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
                            <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{alt.name}</p>
                            <p className="text-sm text-muted-foreground">{alt.brand}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alt.price_diff} more</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`bg-gradient-to-r ${getHealthScoreGradient(alt.health_score)} text-white mb-2`}>
                              {alt.health_score}
                            </Badge>
                            <p className="text-xs text-green-500 font-medium">Better Choice!</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowProductDetail(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {scanMode === 'calorie' && (
                  <Button
                    onClick={addToDiary}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Diary
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copied! 🔗" });
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Barcode Manually</DialogTitle>
            <DialogDescription>Type or paste the product barcode</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="e.g., 123456789"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    manualScan();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Usually found below the barcode on the package
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-600 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Try scanning: 123456789, 987654321, 111222333, or 444555666</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowManualEntry(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={manualScan}
                disabled={!manualBarcode.trim()}
                className="flex-1"
              >
                Search
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scan History</DialogTitle>
            <DialogDescription>Recently scanned products</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3">
              {scanHistory.map(item => (
                <Card
                  key={item.id}
                  className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => {
                    setScannedProduct(item.product);
                    setShowHistory(false);
                    setShowProductDetail(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.scanned_at}</p>
                      </div>
                      <div className="text-right">
                        {item.product.health_analysis.approved ? (
                          <Badge className="bg-green-500 mb-2">✅ Approved</Badge>
                        ) : (
                          <Badge className="bg-red-500 mb-2">❌ Not Approved</Badge>
                        )}
                        <p className="text-xs">
                          Score: <span className={`font-bold ${getHealthScoreColor(item.product.health_analysis.health_score)}`}>
                            {item.product.health_analysis.health_score}
                          </span>
                        </p>
                        {item.added_to_diary && (
                          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            In diary
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

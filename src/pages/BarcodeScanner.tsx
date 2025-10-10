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
  TrendingUp,
  TrendingDown,
  Sparkles,
  Award,
  AlertTriangle,
  Info,
  Plus,
  History,
  Search,
  BookOpen,
  Scale,
  Activity,
  Droplet,
  Wheat,
  Beef
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  image: string;
  serving_size: string;
  servings_per_container: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
    saturated_fat: number;
    trans_fat: number;
  };
  ingredients: string[];
  allergens: string[];
  health_score: number;
  warnings: string[];
  benefits: string[];
  alternatives?: {
    name: string;
    brand: string;
    image: string;
    health_score: number;
  }[];
}

interface ScanHistory {
  id: string;
  product: ScannedProduct;
  scanned_at: string;
  added_to_diary: boolean;
}

// Sample product data
const SAMPLE_PRODUCTS: { [key: string]: ScannedProduct } = {
  '123456789': {
    barcode: '123456789',
    name: 'Protein Bar',
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
    ingredients: [
      'Protein Blend (Whey Protein Isolate, Milk Protein Isolate)',
      'Soluble Corn Fiber',
      'Almonds',
      'Water',
      'Natural Flavors',
      'Sea Salt',
      'Stevia Extract'
    ],
    allergens: ['Milk', 'Tree Nuts (Almonds)'],
    health_score: 85,
    warnings: ['Contains artificial sweeteners'],
    benefits: [
      'High protein content (20g)',
      'Low sugar (2g)',
      'Good source of fiber',
      'No trans fats'
    ],
    alternatives: [
      {
        name: 'Organic Protein Bar',
        brand: 'Nature\'s Best',
        image: 'https://images.unsplash.com/photo-1614963326505-842876a57732?w=200&h=200&fit=crop',
        health_score: 92
      }
    ]
  },
  '987654321': {
    barcode: '987654321',
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
    ingredients: [
      'Cultured Nonfat Milk',
      'Live and Active Cultures',
      'Natural Flavors'
    ],
    allergens: ['Milk'],
    health_score: 95,
    warnings: [],
    benefits: [
      'Excellent protein source (17g)',
      'Low fat (0g)',
      'Contains probiotics',
      'Low calories (100)'
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        
        // Simulate barcode detection after 3 seconds
        setTimeout(() => {
          simulateScan('123456789');
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
      
      // Add to history
      const historyItem: ScanHistory = {
        id: Date.now().toString(),
        product,
        scanned_at: 'Just now',
        added_to_diary: false
      };
      setScanHistory([historyItem, ...scanHistory]);
      
      toast({
        title: "Product scanned! ✅",
        description: product.name
      });
    } else {
      toast({
        title: "Product not found",
        description: "Try scanning again or enter manually",
        variant: "destructive"
      });
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
    return 'text-red-500';
  }

  function getHealthScoreGradient(score: number) {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-orange-500';
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
                  Barcode Scanner
                </h1>
                <p className="text-sm text-muted-foreground">Scan food products instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                History
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-6">
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
                    <canvas ref={canvasRef} className="hidden" />
                    
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
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white bg-black/70 px-4 py-2 rounded-full text-sm">
                            Scanning...
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
                      Point your camera at a product barcode
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button
                        size="lg"
                        onClick={startCamera}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
                    <XCircle className="w-5 h-5 mr-2" />
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
                <p className="text-xs text-muted-foreground">Get nutrition info in seconds</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium mb-1">AI Analysis</p>
                <p className="text-xs text-muted-foreground">Smart health scoring</p>
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

      {/* Product Detail Dialog */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {scannedProduct && (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex flex-col md:flex-row gap-6">
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
                    
                    {/* Health Score */}
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                        className={`w-24 h-24 rounded-full bg-gradient-to-br ${getHealthScoreGradient(scannedProduct.health_score)} flex items-center justify-center text-white shadow-xl`}
                      >
                        <div>
                          <p className="text-3xl font-bold">{scannedProduct.health_score}</p>
                          <p className="text-xs">Score</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Benefits & Warnings */}
                  <div className="space-y-2">
                    {scannedProduct.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                    {scannedProduct.warnings.map((warning, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
                  <p className="text-sm text-muted-foreground">
                    {scannedProduct.ingredients.join(', ')}
                  </p>
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
                        <Badge key={allergen} variant="destructive">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alternatives */}
              {scannedProduct.alternatives && scannedProduct.alternatives.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Healthier Alternatives</h3>
                    <div className="space-y-3">
                      {scannedProduct.alternatives.map((alt, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-background">
                            <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{alt.name}</p>
                            <p className="text-sm text-muted-foreground">{alt.brand}</p>
                          </div>
                          <Badge className={`bg-gradient-to-r ${getHealthScoreGradient(alt.health_score)} text-white`}>
                            {alt.health_score} Score
                          </Badge>
                        </div>
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
                <Button
                  onClick={addToDiary}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Food Diary
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
                        <Badge className={`bg-gradient-to-r ${getHealthScoreGradient(item.product.health_score)} text-white mb-2`}>
                          {item.product.health_score}
                        </Badge>
                        {item.added_to_diary && (
                          <p className="text-xs text-green-500 flex items-center gap-1">
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

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
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { barcodeCache } from '@/services/barcodeCache';
import { fetchProductByBarcode } from '@/services/barcodeApi';
import { ScannedProduct, ScanHistory } from '@/types/barcode';
import { soundManager } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';

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

  // Use real barcode scanner hook
  const {
    videoRef,
    isScanning: isCameraScanning,
    detectedBarcode,
    error: cameraError,
    startScanning,
    stopScanning
  } = useBarcodeScanner(async (barcode) => {
    await handleBarcodeDetected(barcode);
  });

  const [scanMode, setScanMode] = useState<ScanMode>('grocery');
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Shopping mode state
  const [shoppingMode, setShoppingMode] = useState(false);
  const [activeShoppingList, setActiveShoppingList] = useState<any>(null);
  const [matchedListItem, setMatchedListItem] = useState<any>(null);

  // Load cache stats, history, and shopping list on mount
  useEffect(() => {
    loadCacheStats();
    loadScanHistory();
    loadActiveShoppingList();
  }, []);

  async function loadCacheStats() {
    const stats = await barcodeCache.getStats();
    setCacheStats(stats);
  }

  async function loadScanHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('scanned_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Load full product data from cache for history items
      const historyWithProducts = await Promise.all(
        (data || []).map(async (item) => {
          const product = await barcodeCache.get(item.barcode);
          if (product) {
            return {
              id: item.id,
              product,
              scanned_at: new Date(item.created_at).toLocaleString(),
              added_to_diary: item.added_to_diary || false
            };
          }
          return null;
        })
      );

      setScanHistory(historyWithProducts.filter(Boolean) as ScanHistory[]);
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  }

  async function loadActiveShoppingList() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setActiveShoppingList({
          ...data,
          items: data.items as any
        });
        setShoppingMode(true);
        console.log('📋 Active shopping list loaded:', data.name);
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  }

  function findMatchingListItem(product: ScannedProduct, listItems: any[]) {
    const productNameLower = product.name.toLowerCase();
    const productBrand = product.brand.toLowerCase();
    
    for (const item of listItems) {
      if (item.checked) continue;
      
      const itemNameLower = item.name.toLowerCase();
      
      if (itemNameLower === productNameLower) {
        return item;
      }
      
      if (itemNameLower.includes(productNameLower) || productNameLower.includes(itemNameLower)) {
        return item;
      }
      
      if (productNameLower.includes(itemNameLower) || itemNameLower.includes(productBrand)) {
        return item;
      }
    }
    
    return null;
  }

  async function checkOffListItem(itemId: string) {
    if (!activeShoppingList) return;
    
    try {
      const updatedItems = activeShoppingList.items.map((item: any) =>
        item.id === itemId ? { ...item, checked: true } : item
      );
      
      const completedCount = updatedItems.filter((i: any) => i.checked).length;
      
      await supabase
        .from('shopping_lists')
        .update({
          items: updatedItems as any,
          completed_items: completedCount
        })
        .eq('id', activeShoppingList.id);
      
      setActiveShoppingList({
        ...activeShoppingList,
        items: updatedItems,
        completed_items: completedCount
      });
      
      soundManager.play('checkOff');
      
      if (completedCount === updatedItems.length) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
        
        soundManager.play('complete');
        
        toast({
          title: "🎉 Shopping Complete!",
          description: "All items checked off!",
        });
      }
    } catch (error) {
      console.error('Error checking off item:', error);
    }
  }

  async function startCamera() {
    try {
      setCameraActive(true);
      await startScanning();
      
      toast({ 
        title: "📸 Camera activated!",
        description: "Point at a barcode to scan"
      });
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera access denied",
        description: "Please enable camera permissions",
        variant: "destructive"
      });
      setCameraActive(false);
    }
  }

  function stopCamera() {
    stopScanning();
    setCameraActive(false);
  }

  async function handleBarcodeDetected(barcode: string) {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔍 Processing barcode:', barcode);
      
      let product = await fetchProductByBarcode(barcode);
      
      if (!product) {
        product = SAMPLE_PRODUCTS[barcode];
      }
      
      if (product) {
        // Check if item is on shopping list
        let listItemMatched = null;
        if (shoppingMode && activeShoppingList) {
          listItemMatched = findMatchingListItem(product, activeShoppingList.items);
          
          if (listItemMatched) {
            await checkOffListItem(listItemMatched.id);
            setMatchedListItem(listItemMatched);
            
            toast({
              title: "✅ Item checked off!",
              description: `${product.name} removed from your list`,
            });
          }
        }
        
        setScannedProduct(product);
        setShowProductDetail(true);
        stopCamera();
        
        const historyItem: ScanHistory = {
          id: Date.now().toString(),
          product,
          scanned_at: 'Just now',
          added_to_diary: false
        };
        setScanHistory([historyItem, ...scanHistory]);
        
        await saveToDatabase(product);
        await loadCacheStats();
        
        // Show health warnings or approval
        if (product.health_analysis.approved) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
          
          soundManager.play('approved');
          
          toast({
            title: "✅ APPROVED!",
            description: `${product.name} is a great choice!`,
          });
        } else {
          soundManager.play('warning');
          
          toast({
            title: "❌ NOT APPROVED",
            description: `${product.name} has ${product.health_analysis.red_flags.length} red flags`,
            variant: "destructive",
            duration: 5000
          });
        }
      } else {
        toast({
          title: "Product not found",
          description: "Try another barcode",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Error scanning product",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    handleBarcodeDetected(manualBarcode);
    setManualBarcode('');
    setShowManualEntry(false);
  }

  async function addToDiary() {
    if (!scannedProduct) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Add to food logs
      await supabase.from('food_logs').insert({
        user_id: user.id,
        food_name: scannedProduct.name,
        calories: scannedProduct.nutrition.calories,
        protein_g: scannedProduct.nutrition.protein,
        carbs_g: scannedProduct.nutrition.carbs,
        fats_g: scannedProduct.nutrition.fats,
        meal_type: 'snack',
        date: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Added to food diary! 📝",
        description: `${scannedProduct.name} logged`
      });
      
      setShowProductDetail(false);
    } catch (error) {
      console.error('Error adding to diary:', error);
      toast({
        title: "Error",
        description: "Failed to add to diary",
        variant: "destructive"
      });
    }
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
        {/* Cache Stats Banner */}
        {cacheStats && cacheStats.totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Fast Cache Active</p>
                      <p className="text-xs text-muted-foreground">
                        {cacheStats.totalItems} products cached • Instant results
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await barcodeCache.clear();
                      await loadCacheStats();
                      toast({ title: "Cache cleared! 🗑️" });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Shopping Mode Banner */}
        {shoppingMode && activeShoppingList && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">🛒 Shopping Mode Active</p>
                      <p className="text-xs text-muted-foreground">
                        {activeShoppingList.completed_items}/{activeShoppingList.items.length} items checked off
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">
                      {Math.round((activeShoppingList.completed_items / activeShoppingList.items.length) * 100)}% Complete
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/shopping-list')}
                    >
                      View List
                    </Button>
                  </div>
                </div>

                <Progress 
                  value={(activeShoppingList.completed_items / activeShoppingList.items.length) * 100} 
                  className="h-2 mt-3"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-64 h-64">
                        {/* Scanning frame */}
                        <div className="absolute inset-0 border-4 border-green-500 rounded-lg">
                          {/* Animated scanning line */}
                          <motion.div
                            className="absolute inset-x-0 top-0 h-1 bg-green-500 shadow-lg shadow-green-500/50"
                            animate={{ y: [0, 256, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                          
                          {/* Corner decorations */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-500" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-500" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-500" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-500" />
                        </div>
                        
                        {/* Status text */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-white bg-black/70 px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap backdrop-blur">
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Loading...
                            </div>
                          ) : (
                            <>
                              {scanMode === 'grocery' ? '🛒 Scanning for health...' : '📊 Reading nutrition...'}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Error message */}
                    {cameraError && (
                      <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/90 text-white rounded-lg text-sm">
                        {cameraError}
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

      {/* Product Detail Dialog */}
      <Dialog open={showProductDetail} onOpenChange={() => {
        setShowProductDetail(false);
        setMatchedListItem(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {scannedProduct && (
            <div className="space-y-6">
              {/* SHOPPING LIST MATCH NOTIFICATION */}
              {matchedListItem && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative -m-6 mb-6"
                >
                  <Card className="border-0 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                    <CardContent className="p-6 relative">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">✅ Found on Your List!</h3>
                          <p className="text-sm text-muted-foreground">
                            "{matchedListItem.name}" has been automatically checked off
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/shopping-list')}
                          className="gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          View List
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* BOBBY-STYLE HEALTH WARNING (If not approved) */}
              {!scannedProduct.health_analysis.approved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative -m-6 mb-6"
                >
                  <Card className="border-2 border-red-500 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20" />
                    <CardContent className="p-6 relative">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, -5, 5, 0]
                          }}
                          transition={{ 
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0"
                        >
                          <AlertTriangle className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-red-600 mb-2">
                            ⚠️ HEALTH WARNING
                          </h3>
                          <p className="text-lg font-semibold mb-3">
                            This product has {scannedProduct.health_analysis.red_flags.length} red flags
                          </p>
                          <div className="space-y-2">
                            {scannedProduct.health_analysis.red_flags.slice(0, 3).map((flag, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                                <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{flag}</span>
                              </div>
                            ))}
                          </div>
                          {scannedProduct.health_analysis.red_flags.length > 3 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              + {scannedProduct.health_analysis.red_flags.length - 3} more concerns
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm font-semibold text-green-600 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Recommendation: Look for alternatives with no seed oils, artificial sweeteners, or ultra-processed ingredients
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* BOBBY-STYLE APPROVAL (If approved) */}
              {scannedProduct.health_analysis.approved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative -m-6 mb-6"
                >
                  <Card className="border-2 border-green-500 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                    <CardContent className="p-6 relative">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0"
                        >
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-green-600 mb-2">
                            ✅ APPROVED!
                          </h3>
                          <p className="text-lg font-semibold mb-3">
                            Great choice! This product is healthy
                          </p>
                          <div className="space-y-2">
                            {scannedProduct.health_analysis.positives.slice(0, 3).map((positive, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{positive}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className={`text-center p-4 rounded-lg bg-gradient-to-br ${getHealthScoreGradient(scannedProduct.health_analysis.health_score)}`}>
                          <p className="text-4xl font-bold text-white mb-1">
                            {scannedProduct.health_analysis.health_score}
                          </p>
                          <p className="text-xs text-white/80">Health Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Product Header (simplified) */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 aspect-square rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={scannedProduct.image}
                    alt={scannedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-1">{scannedProduct.name}</h2>
                  <p className="text-lg text-muted-foreground mb-2">{scannedProduct.brand}</p>
                  <Badge variant="secondary">{scannedProduct.serving_size}</Badge>
                  
                  <div className="mt-3">
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

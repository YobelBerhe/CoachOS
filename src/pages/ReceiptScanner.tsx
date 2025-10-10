import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import {
  ArrowLeft,
  Receipt,
  Camera,
  Upload,
  TrendingDown,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

interface ProcessedReceipt {
  id: string;
  date: string;
  store: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  estimated_total?: number;
  difference?: number;
  savings?: number;
}

export default function ReceiptScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedReceipt, setProcessedReceipt] = useState<ProcessedReceipt | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processReceipt(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic']
    },
    maxFiles: 1
  });

  async function processReceipt(file: File) {
    setIsProcessing(true);
    setOcrProgress(0);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const receipt = parseReceiptText(result.data.text);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: shoppingList } = await supabase
          .from('shopping_lists')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (shoppingList) {
          receipt.estimated_total = shoppingList.total_estimated_cost;
          receipt.difference = receipt.total - shoppingList.total_estimated_cost;
          receipt.savings = receipt.difference < 0 ? Math.abs(receipt.difference) : 0;
        }
      }

      setProcessedReceipt(receipt);
      setShowResults(true);

      await saveReceipt(receipt);

      if (receipt.savings && receipt.savings > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast({
          title: "🎉 Great job!",
          description: `You saved $${receipt.savings.toFixed(2)}!`
        });
      } else {
        toast({
          title: "Receipt processed! ✅",
          description: `Total: $${receipt.total.toFixed(2)}`
        });
      }

    } catch (error) {
      console.error('Error processing receipt:', error);
      toast({
        title: "Error processing receipt",
        description: "Please try again with a clearer image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function parseReceiptText(text: string): ProcessedReceipt {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    const store = lines.slice(0, 3).find(l => l.length > 3 && l.length < 30) || 'Unknown Store';
    
    const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    const date = dateMatch ? dateMatch[0] : new Date().toLocaleDateString();
    
    const items: ReceiptItem[] = [];
    const pricePattern = /\$?\d+\.\d{2}/g;
    
    for (const line of lines) {
      const prices = line.match(pricePattern);
      if (prices && line.length > 5 && !line.toLowerCase().includes('total') && !line.toLowerCase().includes('tax')) {
        const price = parseFloat(prices[prices.length - 1].replace('$', ''));
        const name = line.replace(pricePattern, '').trim().substring(0, 50);
        
        if (name && price > 0 && price < 500) {
          items.push({ name, price });
        }
      }
    }
    
    let total = 0;
    let tax = 0;
    let subtotal = 0;
    
    const totalMatch = text.match(/total[:\s]*\$?(\d+\.\d{2})/i);
    if (totalMatch) {
      total = parseFloat(totalMatch[1]);
    }
    
    const taxMatch = text.match(/tax[:\s]*\$?(\d+\.\d{2})/i);
    if (taxMatch) {
      tax = parseFloat(taxMatch[1]);
    }
    
    if (total === 0 && items.length > 0) {
      total = items.reduce((sum, item) => sum + item.price, 0);
    }
    
    subtotal = total - tax;

    return {
      id: Date.now().toString(),
      date,
      store,
      items: items.slice(0, 20),
      subtotal,
      tax,
      total
    };
  }

  async function saveReceipt(receipt: ProcessedReceipt) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('receipts').insert({
        user_id: user.id,
        store_name: receipt.store,
        receipt_date: receipt.date,
        items: receipt.items as any,
        subtotal: receipt.subtotal,
        tax: receipt.tax,
        total: receipt.total,
        estimated_total: receipt.estimated_total,
        savings: receipt.savings
      } as any);
    } catch (error) {
      console.error('Error saving receipt:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background">
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
                onClick={() => navigate('/shopping-list')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-purple-500" />
                  Receipt Scanner
                </h1>
                <p className="text-sm text-muted-foreground">
                  Compare actual vs estimated costs
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
                }`}
              >
                <input {...getInputProps()} />
                
                {!isProcessing ? (
                  <>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6"
                    >
                      <Receipt className="w-12 h-12 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-2">
                      {isDragActive ? 'Drop it here!' : 'Scan Your Receipt'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Drag & drop a receipt image, or click to browse
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

                    <p className="text-xs text-muted-foreground mt-6">
                      Supports: JPG, PNG, HEIC • Max size: 10MB
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full mb-6"
                    />
                    <h3 className="text-xl font-bold mb-2">Processing Receipt...</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Reading text from image using AI
                    </p>
                    <Progress value={ocrProgress} className="h-2 max-w-xs mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">{ocrProgress}%</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Camera, title: 'Clear Photo', desc: 'Take a well-lit, focused image' },
                  { icon: Receipt, title: 'Full Receipt', desc: 'Capture entire receipt including totals' },
                  { icon: TrendingDown, title: 'Auto-Compare', desc: 'We compare with your shopping list' }
                ].map((tip, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary text-center">
                    <tip.icon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="font-semibold text-sm mb-1">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {uploadedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3">Receipt Preview</h3>
                <img
                  src={uploadedImage}
                  alt="Receipt"
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {processedReceipt && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">Receipt Processed! ✅</DialogTitle>
                <DialogDescription>
                  {processedReceipt.store} • {processedReceipt.date}
                </DialogDescription>
              </DialogHeader>

              {processedReceipt.savings && processedReceipt.savings > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="border-0 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                    <CardContent className="p-6 relative">
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4"
                        >
                          <TrendingDown className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-green-600 mb-2">
                          You Saved ${processedReceipt.savings.toFixed(2)}!
                        </h3>
                        <p className="text-muted-foreground">
                          Spent less than estimated 🎉
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {processedReceipt.estimated_total && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Estimated</p>
                      <p className="text-2xl font-bold">
                        ${processedReceipt.estimated_total.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Actual</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${processedReceipt.total.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Receipt Details</h3>
                  
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {processedReceipt.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                        <span className="text-sm">{item.name}</span>
                        <span className="font-bold">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-semibold">${processedReceipt.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Tax</span>
                      <span className="font-semibold">${processedReceipt.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-purple-600">${processedReceipt.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResults(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => navigate('/shopping-list')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

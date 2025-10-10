import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  Camera,
  Upload,
  Plus,
  Sparkles,
  DollarSign,
  Leaf
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCarbonFootprint, getEstimatedCost, getShelfLife } from '@/data/carbonFootprint';
import confetti from 'canvas-confetti';

export default function FridgeScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('produce');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('unit');
  const [location, setLocation] = useState('fridge');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    toast({
      title: "Image uploaded! 📸",
      description: "AI recognition coming soon!"
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  function handleCategoryChange(newCategory: string) {
    setCategory(newCategory);
    const shelfLife = getShelfLife(newCategory, itemName);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + shelfLife);
    setExpirationDate(expDate.toISOString().split('T')[0]);
  }

  async function addItem() {
    if (!itemName.trim()) {
      toast({
        title: "Item name required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const qty = parseFloat(quantity) || 1;
      const carbonFootprint = getCarbonFootprint(itemName, qty);
      const estimatedCost = getEstimatedCost(category, qty);

      const { error } = await supabase
        .from('food_inventory')
        .insert({
          user_id: user.id,
          item_name: itemName,
          category,
          quantity: qty,
          unit,
          purchase_date: purchaseDate,
          expiration_date: expirationDate,
          estimated_cost: estimatedCost,
          location,
          status: 'fresh',
          carbon_footprint: carbonFootprint
        });

      if (error) throw error;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      toast({
        title: "Item added! ✅",
        description: `${itemName} added to inventory`
      });

      setItemName('');
      setQuantity('1');
      
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error adding item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/food-waste')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Camera className="w-6 h-6 text-purple-500" />
                Fridge Scanner
              </h1>
              <p className="text-sm text-muted-foreground">
                Add items to your inventory
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-2xl mb-6">
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-border hover:border-purple-500/50'
                }`}
              >
                <input {...getInputProps()} />
                <Camera className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-bold mb-2">
                  {isDragActive ? 'Drop it!' : 'Scan Your Fridge'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo or upload an image (Coming soon with AI!)
                </p>
                <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Add Item Manually
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Item Name *</Label>
                  <Input
                    placeholder="e.g., Chicken Breast"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produce">🥬 Produce</SelectItem>
                        <SelectItem value="meat">🥩 Meat</SelectItem>
                        <SelectItem value="seafood">🐟 Seafood</SelectItem>
                        <SelectItem value="dairy">🥛 Dairy</SelectItem>
                        <SelectItem value="pantry">🥫 Pantry</SelectItem>
                        <SelectItem value="frozen">❄️ Frozen</SelectItem>
                        <SelectItem value="beverages">🥤 Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fridge">🧊 Fridge</SelectItem>
                        <SelectItem value="freezer">❄️ Freezer</SelectItem>
                        <SelectItem value="pantry">🗄️ Pantry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit">Unit</SelectItem>
                        <SelectItem value="lb">Pounds (lb)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Expiration Date</Label>
                    <Input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                {itemName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20"
                  >
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      Impact Preview
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>~${getEstimatedCost(category, parseFloat(quantity) || 1).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-blue-500" />
                        <span>~{getCarbonFootprint(itemName, parseFloat(quantity) || 1).toFixed(2)}kg CO2</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={addItem}
                  disabled={isSubmitting || !itemName.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 h-12 text-lg"
                >
                  {isSubmitting ? 'Adding...' : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Inventory
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Quick Add Common Items</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { name: 'Milk', emoji: '🥛', category: 'dairy' },
                  { name: 'Eggs', emoji: '🥚', category: 'dairy' },
                  { name: 'Chicken', emoji: '🍗', category: 'meat' },
                  { name: 'Lettuce', emoji: '🥬', category: 'produce' },
                  { name: 'Tomatoes', emoji: '🍅', category: 'produce' },
                  { name: 'Cheese', emoji: '🧀', category: 'dairy' },
                  { name: 'Bread', emoji: '🍞', category: 'pantry' },
                  { name: 'Yogurt', emoji: '🥛', category: 'dairy' }
                ].map((item) => (
                  <Button
                    key={item.name}
                    variant="outline"
                    onClick={() => {
                      setItemName(item.name);
                      setCategory(item.category);
                      handleCategoryChange(item.category);
                    }}
                    className="gap-2"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-xs">{item.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

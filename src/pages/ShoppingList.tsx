import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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
  ShoppingCart,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Scan,
  Receipt,
  DollarSign,
  Apple,
  Beef,
  Milk,
  Wheat,
  Carrot,
  Fish,
  Egg,
  Coffee,
  Zap,
  TrendingUp,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  checked: boolean;
  isHealthy: boolean;
  estimatedPrice: number;
  alternatives?: string[];
  reason?: string; // Why this item is needed
}

interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: ShoppingItem[];
  created_at: string;
  goal_type: string;
  total_estimated_cost: number;
  completed_items: number;
}

const CATEGORIES = [
  { id: 'proteins', name: 'Proteins', icon: Beef, color: 'from-red-500 to-pink-500' },
  { id: 'vegetables', name: 'Vegetables', icon: Carrot, color: 'from-green-500 to-emerald-500' },
  { id: 'fruits', name: 'Fruits', icon: Apple, color: 'from-orange-500 to-yellow-500' },
  { id: 'dairy', name: 'Dairy', icon: Milk, color: 'from-blue-500 to-cyan-500' },
  { id: 'grains', name: 'Grains', icon: Wheat, color: 'from-yellow-500 to-orange-500' },
  { id: 'seafood', name: 'Seafood', icon: Fish, color: 'from-cyan-500 to-blue-500' },
  { id: 'eggs', name: 'Eggs', icon: Egg, color: 'from-yellow-400 to-orange-400' },
  { id: 'beverages', name: 'Beverages', icon: Coffee, color: 'from-purple-500 to-pink-500' },
  { id: 'other', name: 'Other', icon: ShoppingCart, color: 'from-gray-500 to-gray-600' }
];

// Sample shopping list based on goals
const GOAL_BASED_LISTS = {
  'Lose Weight': [
    { name: 'Chicken Breast', category: 'proteins', quantity: '2', unit: 'lbs', isHealthy: true, estimatedPrice: 8.99, reason: 'Lean protein for muscle maintenance' },
    { name: 'Greek Yogurt', category: 'dairy', quantity: '4', unit: 'containers', isHealthy: true, estimatedPrice: 5.99, reason: 'High protein, low calorie' },
    { name: 'Spinach', category: 'vegetables', quantity: '1', unit: 'bag', isHealthy: true, estimatedPrice: 2.99, reason: 'Low calorie, nutrient dense' },
    { name: 'Broccoli', category: 'vegetables', quantity: '2', unit: 'heads', isHealthy: true, estimatedPrice: 3.99, reason: 'High fiber, low calorie' },
    { name: 'Eggs', category: 'eggs', quantity: '12', unit: 'count', isHealthy: true, estimatedPrice: 3.49, reason: 'Complete protein source' },
    { name: 'Salmon', category: 'seafood', quantity: '1', unit: 'lb', isHealthy: true, estimatedPrice: 12.99, reason: 'Omega-3, high protein' },
    { name: 'Sweet Potatoes', category: 'vegetables', quantity: '3', unit: 'lbs', isHealthy: true, estimatedPrice: 4.99, reason: 'Complex carbs, fiber' },
    { name: 'Berries', category: 'fruits', quantity: '2', unit: 'containers', isHealthy: true, estimatedPrice: 6.99, reason: 'Antioxidants, low sugar' },
    { name: 'Oatmeal', category: 'grains', quantity: '1', unit: 'container', isHealthy: true, estimatedPrice: 4.99, reason: 'Slow-release energy' },
    { name: 'Almonds', category: 'other', quantity: '1', unit: 'bag', isHealthy: true, estimatedPrice: 8.99, reason: 'Healthy fats, protein' }
  ],
  'Gain Muscle': [
    { name: 'Chicken Breast', category: 'proteins', quantity: '4', unit: 'lbs', isHealthy: true, estimatedPrice: 17.99, reason: 'High protein for muscle building' },
    { name: 'Ground Turkey', category: 'proteins', quantity: '2', unit: 'lbs', isHealthy: true, estimatedPrice: 9.99, reason: 'Lean protein source' },
    { name: 'Greek Yogurt', category: 'dairy', quantity: '6', unit: 'containers', isHealthy: true, estimatedPrice: 8.99, reason: 'Protein + probiotics' },
    { name: 'Eggs', category: 'eggs', quantity: '24', unit: 'count', isHealthy: true, estimatedPrice: 6.49, reason: 'Complete protein, affordable' },
    { name: 'Brown Rice', category: 'grains', quantity: '2', unit: 'bags', isHealthy: true, estimatedPrice: 5.99, reason: 'Complex carbs for energy' },
    { name: 'Quinoa', category: 'grains', quantity: '1', unit: 'bag', isHealthy: true, estimatedPrice: 6.99, reason: 'Complete protein grain' },
    { name: 'Salmon', category: 'seafood', quantity: '2', unit: 'lbs', isHealthy: true, estimatedPrice: 24.99, reason: 'Omega-3, high quality protein' },
    { name: 'Bananas', category: 'fruits', quantity: '6', unit: 'count', isHealthy: true, estimatedPrice: 2.99, reason: 'Quick carbs post-workout' },
    { name: 'Peanut Butter', category: 'other', quantity: '1', unit: 'jar', isHealthy: true, estimatedPrice: 5.99, reason: 'Healthy fats, calories' },
    { name: 'Protein Powder', category: 'other', quantity: '1', unit: 'container', isHealthy: true, estimatedPrice: 39.99, reason: 'Convenient protein source' },
    { name: 'Avocados', category: 'vegetables', quantity: '5', unit: 'count', isHealthy: true, estimatedPrice: 6.99, reason: 'Healthy fats, calories' },
    { name: 'Whole Wheat Pasta', category: 'grains', quantity: '2', unit: 'boxes', isHealthy: true, estimatedPrice: 4.99, reason: 'Complex carbs for energy' }
  ],
  'Maintain Weight': [
    { name: 'Chicken Breast', category: 'proteins', quantity: '2', unit: 'lbs', isHealthy: true, estimatedPrice: 8.99, reason: 'Balanced protein source' },
    { name: 'Ground Beef (93% lean)', category: 'proteins', quantity: '1', unit: 'lb', isHealthy: true, estimatedPrice: 6.99, reason: 'Iron and protein' },
    { name: 'Greek Yogurt', category: 'dairy', quantity: '4', unit: 'containers', isHealthy: true, estimatedPrice: 5.99, reason: 'Protein and calcium' },
    { name: 'Mixed Vegetables', category: 'vegetables', quantity: '2', unit: 'bags', isHealthy: true, estimatedPrice: 5.99, reason: 'Vitamins and fiber' },
    { name: 'Eggs', category: 'eggs', quantity: '12', unit: 'count', isHealthy: true, estimatedPrice: 3.49, reason: 'Versatile protein' },
    { name: 'Brown Rice', category: 'grains', quantity: '1', unit: 'bag', isHealthy: true, estimatedPrice: 2.99, reason: 'Whole grain carbs' },
    { name: 'Apples', category: 'fruits', quantity: '6', unit: 'count', isHealthy: true, estimatedPrice: 4.99, reason: 'Fiber and vitamins' },
    { name: 'Salmon', category: 'seafood', quantity: '1', unit: 'lb', isHealthy: true, estimatedPrice: 12.99, reason: 'Healthy omega-3' },
    { name: 'Olive Oil', category: 'other', quantity: '1', unit: 'bottle', isHealthy: true, estimatedPrice: 8.99, reason: 'Heart-healthy fat' }
  ]
};

export default function ShoppingList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('other');
  const [userGoal, setUserGoal] = useState<string>('');

  useEffect(() => {
    loadUserGoal();
    loadShoppingLists();
  }, []);

  async function loadUserGoal() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: goal } = await supabase
        .from('goals')
        .select('type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (goal) {
        setUserGoal(goal.type);
      }
    } catch (error) {
      console.error('Error loading goal:', error);
    }
  }

  async function loadShoppingLists() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedLists = (data || []).map(list => ({
        ...list,
        items: list.items as unknown as ShoppingItem[]
      }));

      setShoppingLists(parsedLists);
      if (parsedLists.length > 0) {
        setCurrentList(parsedLists[0]);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  }

  async function generateSmartList() {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get items based on goal
      const items = GOAL_BASED_LISTS[userGoal as keyof typeof GOAL_BASED_LISTS] || GOAL_BASED_LISTS['Maintain Weight'];

      // Add unique IDs
      const itemsWithIds = items.map((item, idx) => ({
        ...item,
        id: `item-${idx}`,
        checked: false
      }));

      // Calculate total cost
      const totalCost = itemsWithIds.reduce((sum, item) => sum + item.estimatedPrice, 0);

      const newList: ShoppingList = {
        id: Date.now().toString(),
        user_id: user.id,
        name: `${userGoal} - Week of ${new Date().toLocaleDateString()}`,
        items: itemsWithIds,
        created_at: new Date().toISOString(),
        goal_type: userGoal,
        total_estimated_cost: totalCost,
        completed_items: 0
      };

      // Save to database
      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: newList.name,
          items: newList.items as any,
          goal_type: newList.goal_type,
          total_estimated_cost: newList.total_estimated_cost
        });

      if (error) throw error;

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Shopping list generated! 🎉",
        description: `${itemsWithIds.length} items based on your ${userGoal} goal`
      });

      setCurrentList(newList);
      setShoppingLists([newList, ...shoppingLists]);
    } catch (error) {
      console.error('Error generating list:', error);
      toast({
        title: "Error generating list",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function toggleItem(itemId: string) {
    if (!currentList) return;

    const updatedItems = currentList.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    const completedCount = updatedItems.filter(i => i.checked).length;

    const updatedList = {
      ...currentList,
      items: updatedItems,
      completed_items: completedCount
    };

    setCurrentList(updatedList);

    // Update in database
    try {
      await supabase
        .from('shopping_lists')
        .update({
          items: updatedItems as any,
          completed_items: completedCount
        })
        .eq('id', currentList.id);

      // Check if all items are done
      if (completedCount === updatedItems.length) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
        toast({
          title: "Shopping complete! 🎉",
          description: "All items checked off!"
        });
      }
    } catch (error) {
      console.error('Error updating list:', error);
    }
  }

  async function addCustomItem() {
    if (!currentList || !newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `custom-${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      quantity: newItemQuantity || '1',
      unit: 'unit',
      checked: false,
      isHealthy: true,
      estimatedPrice: 0,
      reason: 'Custom item'
    };

    const updatedItems = [...currentList.items, newItem];
    const updatedList = { ...currentList, items: updatedItems };

    setCurrentList(updatedList);

    // Update database
    try {
      await supabase
        .from('shopping_lists')
        .update({ items: updatedItems as any })
        .eq('id', currentList.id);

      toast({
        title: "Item added! ✅",
        description: newItemName
      });

      setNewItemName('');
      setNewItemQuantity('');
      setShowNewItemDialog(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  async function deleteItem(itemId: string) {
    if (!currentList) return;

    const updatedItems = currentList.items.filter(item => item.id !== itemId);
    const updatedList = { ...currentList, items: updatedItems };

    setCurrentList(updatedList);

    try {
      await supabase
        .from('shopping_lists')
        .update({ items: updatedItems as any })
        .eq('id', currentList.id);

      toast({ title: "Item removed" });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  const filteredItems = currentList?.items.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const completionPercentage = currentList
    ? (currentList.completed_items / currentList.items.length) * 100
    : 0;

  const categoryStats = CATEGORIES.map(cat => {
    const items = currentList?.items.filter(i => i.category === cat.id) || [];
    const checked = items.filter(i => i.checked).length;
    return {
      ...cat,
      total: items.length,
      checked
    };
  }).filter(cat => cat.total > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-500/5 to-background">
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
                  <ShoppingCart className="w-6 h-6 text-green-500" />
                  Smart Shopping List
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-generated based on your {userGoal} goal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/barcode-scanner')}
                className="gap-2"
              >
                <Scan className="w-4 h-4" />
                Scan Items
              </Button>
              <Button
                onClick={generateSmartList}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate New List
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {!currentList ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center py-20"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6">
              <ShoppingCart className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Shopping List Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Generate a smart shopping list based on your <strong>{userGoal}</strong> goal! 
              We'll recommend healthy foods that match your nutrition needs.
            </p>
            <Button
              size="lg"
              onClick={generateSmartList}
              disabled={isGenerating}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Shopping List
                </>
              )}
            </Button>

            {/* Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              {[
                { icon: Target, title: 'Goal-Based', desc: 'Matches your fitness goals' },
                { icon: Sparkles, title: 'AI-Powered', desc: 'Smart food recommendations' },
                { icon: DollarSign, title: 'Cost Estimate', desc: 'Budget-friendly options' }
              ].map((feature, idx) => (
                <Card key={idx} className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="w-10 h-10 mx-auto mb-3 text-green-500" />
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          // Shopping List View
          <div className="space-y-6">
            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{currentList.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(currentList.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {currentList.goal_type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        ${currentList.total_estimated_cost.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Estimated Total</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Shopping Progress</span>
                      <span className="font-bold">
                        {currentList.completed_items} / {currentList.items.length} items
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.round(completionPercentage)}% Complete</span>
                      <span>
                        {currentList.items.length - currentList.completed_items} items remaining
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <BarChart3 className="w-5 h-5 text-blue-500 mb-1" />
                      <p className="text-lg font-bold">{currentList.items.length}</p>
                      <p className="text-xs text-muted-foreground">Total Items</p>
                    </div>

                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-lg font-bold">{currentList.completed_items}</p>
                      <p className="text-xs text-muted-foreground">Checked Off</p>
                    </div>

                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                      <DollarSign className="w-5 h-5 text-orange-500 mb-1" />
                      <p className="text-lg font-bold">
                        ${(currentList.total_estimated_cost - 
                          currentList.items
                            .filter(i => i.checked)
                            .reduce((sum, i) => sum + i.estimatedPrice, 0)
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Apple className="w-5 h-5 text-green-500" />
                    Shop by Category
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCategory === 'all'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-sm">All Items</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentList.items.length} items
                      </p>
                    </button>

                    {categoryStats.map(category => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedCategory === category.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-semibold text-sm">{category.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.checked}/{category.total}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewItemDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Custom Item
              </Button>

              <Button
                onClick={() => navigate('/barcode-scanner')}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
              >
                <Scan className="w-4 h-4" />
                Start Shopping
              </Button>

              <Button
                onClick={() => navigate('/receipt-scanner')}
                variant="outline"
                className="gap-2"
              >
                <Receipt className="w-4 h-4" />
                Scan Receipt
              </Button>
            </div>

            {/* Shopping Items List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <AnimatePresence>
                {filteredItems.map((item, idx) => {
                  const category = CATEGORIES.find(c => c.id === item.category);
                  const Icon = category?.icon || ShoppingCart;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        className={`border-0 shadow-lg transition-all cursor-pointer ${
                          item.checked
                            ? 'opacity-60 bg-secondary'
                            : 'hover:shadow-xl'
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 pt-1">
                              <div 
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  item.checked
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-border hover:border-green-500'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItem(item.id);
                                }}
                              >
                                {item.checked && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>

                            {/* Category Icon */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${category?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className={`font-bold text-lg ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {item.quantity} {item.unit}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {category?.name}
                                    </Badge>
                                    {item.isHealthy && (
                                      <Badge className="bg-green-500 text-xs">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Healthy
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                  <p className="text-xl font-bold text-green-600">
                                    ${item.estimatedPrice.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Reason */}
                              {item.reason && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-2">
                                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-muted-foreground">
                                    {item.reason}
                                  </p>
                                </div>
                              )}

                              {/* Alternatives */}
                              {item.alternatives && item.alternatives.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                                    Better alternatives:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {item.alternatives.map((alt, altIdx) => (
                                      <Badge key={altIdx} variant="outline" className="text-xs">
                                        {alt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteItem(item.id);
                                  }}
                                  className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredItems.length === 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">No items in this category</p>
                    <p className="text-sm text-muted-foreground">
                      Try selecting a different category or add custom items
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Summary Card */}
            {currentList.completed_items === currentList.items.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                  <CardContent className="p-8 text-center relative">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Shopping Complete! 🎉</h3>
                    <p className="text-muted-foreground mb-4">
                      You've checked off all {currentList.items.length} items
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        onClick={generateSmartList}
                        className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Next Week's List
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Add Custom Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
            <DialogDescription>Add your own item to the shopping list</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Item Name</label>
              <Input
                placeholder="e.g., Avocados"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomItem();
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Input
                placeholder="e.g., 3 or 1 lb"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.slice(0, 9).map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setNewItemCategory(category.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newItemCategory === category.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs font-medium">{category.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewItemDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addCustomItem}
                disabled={!newItemName.trim()}
                className="flex-1"
              >
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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

      setShoppingLists(data || []);
      if (data && data.length > 0) {
        setCurrentList(data[0]);
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
          items: newList.items,
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
          items: updatedItems,
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
        .update({ items: updatedItems })
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
        .update({ items: updatedItems })
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
          // Shopping List View - CONTINUES IN NEXT MESSAGE
          <div className="space-y-6">
            {/* I'll continue with the full shopping list UI in the next message! */}
          </div>
        )}
      </div>
    </div>
  );
}

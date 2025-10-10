import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Leaf,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Sparkles,
  Award,
  Flame,
  Droplet,
  Apple,
  Clock,
  ChefHat,
  BarChart3,
  Calendar,
  ShoppingCart,
  Zap,
  TreePine,
  Car,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import {
  getCarbonFootprint,
  getEstimatedCost,
  treesEquivalent,
  milesDrivenEquivalent
} from '@/data/carbonFootprint';

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_date: string;
  expiration_date: string;
  estimated_cost: number;
  location: string;
  status: string;
  carbon_footprint: number;
  daysUntilExpiration: number;
}

interface WasteStats {
  thisMonth: {
    itemsWasted: number;
    moneyWasted: number;
    carbonWasted: number;
  };
  allTime: {
    itemsSaved: number;
    moneySaved: number;
    carbonSaved: number;
    treesEquivalent: number;
    milesEquivalent: number;
  };
}

export default function FoodWasteDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
  const [wasteStats, setWasteStats] = useState<WasteStats>({
    thisMonth: { itemsWasted: 0, moneyWasted: 0, carbonWasted: 0 },
    allTime: { itemsSaved: 0, moneySaved: 0, carbonSaved: 0, treesEquivalent: 0, milesEquivalent: 0 }
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [rescueRecipes, setRescueRecipes] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    await Promise.all([
      loadInventory(),
      loadWasteStats(),
      loadAchievements(),
      loadRescueRecipes()
    ]);
  }

  async function loadInventory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_inventory')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['fresh', 'expiring_soon'])
        .order('expiration_date', { ascending: true });

      if (error) throw error;

      const today = new Date();
      const itemsWithDays = (data || []).map(item => {
        const expDate = new Date(item.expiration_date);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...item,
          daysUntilExpiration: diffDays
        };
      });

      setInventory(itemsWithDays);

      // Filter expiring soon (within 3 days)
      const expiring = itemsWithDays.filter(item => item.daysUntilExpiration <= 3 && item.daysUntilExpiration >= 0);
      setExpiringItems(expiring);

      // Auto-update status
      for (const item of itemsWithDays) {
        if (item.daysUntilExpiration <= 3 && item.status === 'fresh') {
          await supabase
            .from('food_inventory')
            .update({ status: 'expiring_soon' })
            .eq('id', item.id);
        }
        if (item.daysUntilExpiration < 0 && item.status !== 'expired') {
          await supabase
            .from('food_inventory')
            .update({ status: 'expired' })
            .eq('id', item.id);
        }
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }

  async function loadWasteStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This month's waste
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthWaste } = await supabase
        .from('waste_log')
        .select('*')
        .eq('user_id', user.id)
        .gte('wasted_date', startOfMonth.toISOString().split('T')[0]);

      const thisMonthStats = (monthWaste || []).reduce((acc, item) => ({
        itemsWasted: acc.itemsWasted + 1,
        moneyWasted: acc.moneyWasted + item.estimated_cost,
        carbonWasted: acc.carbonWasted + item.carbon_footprint
      }), { itemsWasted: 0, moneyWasted: 0, carbonWasted: 0 });

      // All-time savings
      const { data: carbonData } = await supabase
        .from('carbon_savings')
        .select('*')
        .eq('user_id', user.id);

      const allTimeStats = (carbonData || []).reduce((acc, item) => ({
        itemsSaved: acc.itemsSaved + item.waste_prevented_count,
        moneySaved: acc.moneySaved + item.money_saved,
        carbonSaved: acc.carbonSaved + item.carbon_saved_kg,
        treesEquivalent: 0,
        milesEquivalent: 0
      }), { itemsSaved: 0, moneySaved: 0, carbonSaved: 0, treesEquivalent: 0, milesEquivalent: 0 });

      allTimeStats.treesEquivalent = treesEquivalent(allTimeStats.carbonSaved);
      allTimeStats.milesEquivalent = milesDrivenEquivalent(allTimeStats.carbonSaved);

      setWasteStats({
        thisMonth: thisMonthStats,
        allTime: allTimeStats
      });
    } catch (error) {
      console.error('Error loading waste stats:', error);
    }
  }

  async function loadAchievements() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('waste_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }

  async function loadRescueRecipes() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rescue_recipes')
        .select('*')
        .eq('user_id', user.id)
        .eq('cooked', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRescueRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  }

  async function markAsConsumed(itemId: string) {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      await supabase
        .from('food_inventory')
        .update({
          status: 'consumed',
          consumed_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', itemId);

      // Add to carbon savings
      const today = new Date();
      const month = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update or insert carbon savings
      const { data: existing } = await supabase
        .from('carbon_savings')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .single();

      if (existing) {
        await supabase
          .from('carbon_savings')
          .update({
            food_saved_kg: existing.food_saved_kg + item.quantity,
            carbon_saved_kg: existing.carbon_saved_kg + item.carbon_footprint,
            money_saved: existing.money_saved + item.estimated_cost,
            waste_prevented_count: existing.waste_prevented_count + 1
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('carbon_savings')
          .insert({
            user_id: user.id,
            month,
            food_saved_kg: item.quantity,
            carbon_saved_kg: item.carbon_footprint,
            money_saved: item.estimated_cost,
            waste_prevented_count: 1
          });
      }

      toast({
        title: "Item consumed! 🎉",
        description: `Saved $${item.estimated_cost.toFixed(2)} and ${item.carbon_footprint.toFixed(2)}kg CO2`
      });

      await loadDashboardData();
    } catch (error) {
      console.error('Error marking as consumed:', error);
    }
  }

  async function markAsWasted(itemId: string, reason: string) {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      await supabase
        .from('food_inventory')
        .update({
          status: 'wasted',
          waste_reason: reason
        })
        .eq('id', itemId);

      // Log waste
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('waste_log')
        .insert({
          user_id: user.id,
          item_name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          estimated_cost: item.estimated_cost,
          carbon_footprint: item.carbon_footprint,
          waste_reason: reason,
          wasted_date: new Date().toISOString().split('T')[0]
        });

      toast({
        title: "Item logged as wasted 😔",
        description: "We'll help you prevent this next time",
        variant: "destructive"
      });

      await loadDashboardData();
    } catch (error) {
      console.error('Error marking as wasted:', error);
    }
  }

  const wastePercentage = inventory.length > 0
    ? (expiringItems.length / inventory.length) * 100
    : 0;

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
                  <Leaf className="w-6 h-6 text-green-500" />
                  Food Waste Intelligence
                </h1>
                <p className="text-sm text-muted-foreground">
                  Save money • Save the planet
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/fridge-scanner')}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Camera className="w-4 h-4" />
              Scan Fridge
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Money Saved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <TrendingDown className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  ${wasteStats.allTime.moneySaved.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Money Saved All-Time</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Carbon Saved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {wasteStats.allTime.carbonSaved.toFixed(1)}kg
                </p>
                <p className="text-xs text-muted-foreground">CO2 Prevented</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Items Saved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {wasteStats.allTime.itemsSaved}
                </p>
                <p className="text-xs text-muted-foreground">Items Rescued</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expiring Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-600 mb-1">
                  {expiringItems.length}
                </p>
                <p className="text-xs text-muted-foreground">Items Expiring Soon</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Environmental Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5" />
            <CardContent className="p-8 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Your Environmental Impact</h3>
                  <p className="text-muted-foreground">Making a real difference! 🌍</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trees Equivalent */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <TreePine className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        {wasteStats.allTime.treesEquivalent.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Trees Planted Equivalent</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your carbon savings equal planting this many trees! 🌳
                  </p>
                </div>

                {/* Miles Not Driven */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Car className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {wasteStats.allTime.milesEquivalent.toFixed(0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Miles Not Driven</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Same CO2 impact as not driving this far! 🚗
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expiring Items Alert */}
        {expiringItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <Card className="border-2 border-yellow-500 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0"
                  >
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">⚠️ Action Required!</h3>
                    <p className="text-muted-foreground mb-4">
                      {expiringItems.length} item{expiringItems.length > 1 ? 's are' : ' is'} expiring soon. 
                      Use them now or they'll go to waste!
                    </p>

                    <div className="space-y-2 mb-4">
                      {expiringItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <div>
                            <p className="font-semibold">{item.item_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.daysUntilExpiration === 0 ? 'Expires today!' : `Expires in ${item.daysUntilExpiration} day${item.daysUntilExpiration > 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => markAsConsumed(item.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Used
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate('/rescue-recipes')}
                        className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500"
                      >
                        <ChefHat className="w-4 h-4" />
                        Get Rescue Recipes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/fridge-inventory')}
                      >
                        View All Items
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card 
            className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate('/fridge-scanner')}
          >
            <CardContent className="p-6">
              <Camera className="w-10 h-10 text-purple-500 mb-3" />
              <h3 className="font-bold mb-1">Scan Fridge</h3>
              <p className="text-sm text-muted-foreground">Add items to inventory</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate('/rescue-recipes')}
          >
            <CardContent className="p-6">
              <ChefHat className="w-10 h-10 text-orange-500 mb-3" />
              <h3 className="font-bold mb-1">Rescue Recipes</h3>
              <p className="text-sm text-muted-foreground">Use expiring items</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate('/waste-report')}
          >
            <CardContent className="p-6">
              <BarChart3 className="w-10 h-10 text-blue-500 mb-3" />
              <h3 className="font-bold mb-1">Waste Report</h3>
              <p className="text-sm text-muted-foreground">View detailed analytics</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {inventory.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Apple className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No Items in Inventory</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by scanning your fridge to track what you have
                  </p>
                  <Button
                    onClick={() => navigate('/fridge-scanner')}
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Fridge Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {inventory.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`border-0 shadow-lg ${
                      item.status === 'expiring_soon' ? 'border-2 border-yellow-500' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
                            item.category === 'produce' ? 'from-green-500 to-emerald-500' :
                            item.category === 'meat' ? 'from-red-500 to-pink-500' :
                            item.category === 'dairy' ? 'from-blue-500 to-cyan-500' :
                            'from-purple-500 to-pink-500'
                          } flex items-center justify-center text-3xl`}>
                            {item.category === 'produce' ? '🥬' :
                             item.category === 'meat' ? '🥩' :
                             item.category === 'dairy' ? '🥛' :
                             item.category === 'seafood' ? '🐟' : '🥫'}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg">{item.item_name}</h4>
                              {item.status === 'expiring_soon' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Expiring Soon
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {item.location}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Qty: {item.quantity} {item.unit}</span>
                              <span>•</span>
                              <span className={
                                item.daysUntilExpiration <= 1 ? 'text-red-500 font-bold' :
                                item.daysUntilExpiration <= 3 ? 'text-yellow-600 font-semibold' :
                                'text-muted-foreground'
                              }>
                                {item.daysUntilExpiration === 0 ? '⚠️ Expires today!' :
                                 item.daysUntilExpiration < 0 ? '❌ Expired' :
                                 `${item.daysUntilExpiration} days left`}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-green-500" />
                                ${item.estimated_cost.toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Leaf className="w-3 h-3 text-blue-500" />
                                {item.carbon_footprint.toFixed(2)}kg CO2
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => markAsConsumed(item.id)}
                              className="bg-green-500 hover:bg-green-600 whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Used It
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsWasted(item.id, 'forgot')}
                              className="text-red-500 hover:text-red-600 whitespace-nowrap"
                            >
                              Wasted
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            {rescueRecipes.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No Rescue Recipes Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate AI recipes using items about to expire
                  </p>
                  <Button
                    onClick={() => navigate('/rescue-recipes')}
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Recipes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rescueRecipes.map((recipe, idx) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl flex-shrink-0">
                            👨‍🍳
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg mb-2">{recipe.recipe_name}</h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                <Apple className="w-3 h-3 mr-1" />
                                {recipe.items_rescued} items rescued
                              </Badge>
                              <Badge className="bg-green-500 text-xs">
                                <DollarSign className="w-3 h-3 mr-1" />
                                ${recipe.money_saved.toFixed(2)} saved
                              </Badge>
                              <Badge className="bg-blue-500 text-xs">
                                <Leaf className="w-3 h-3 mr-1" />
                                {recipe.carbon_saved.toFixed(2)}kg CO2
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {recipe.instructions.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievements.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start preventing food waste to unlock achievements!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {achievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1">{achievement.achievement_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Earned on {new Date(achievement.earned_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                            {achievement.milestone_value}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

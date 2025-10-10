import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FridgeInventory() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inventory, setInventory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');

  useEffect(() => {
    loadInventory();
  }, []);

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
        return { ...item, daysUntilExpiration: diffDays };
      });

      setInventory(itemsWithDays);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }

  async function deleteItem(itemId: string) {
    try {
      await supabase
        .from('food_inventory')
        .delete()
        .eq('id', itemId);

      toast({ title: "Item deleted ✅" });
      await loadInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === 'all' || item.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  const stats = {
    total: inventory.length,
    fridge: inventory.filter(i => i.location === 'fridge').length,
    freezer: inventory.filter(i => i.location === 'freezer').length,
    pantry: inventory.filter(i => i.location === 'pantry').length,
    expiring: inventory.filter(i => i.status === 'expiring_soon').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background">
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
                onClick={() => navigate('/food-waste')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-500" />
                  Food Inventory
                </h1>
                <p className="text-sm text-muted-foreground">
                  {stats.total} items tracked
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/fridge-scanner')}
              className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Camera className="w-4 h-4" />
              Add Items
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">🧊 {stats.fridge}</p>
              <p className="text-xs text-muted-foreground">Fridge</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">❄️ {stats.freezer}</p>
              <p className="text-xs text-muted-foreground">Freezer</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">🗄️ {stats.pantry}</p>
              <p className="text-xs text-muted-foreground">Pantry</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">⚠️ {stats.expiring}</p>
              <p className="text-xs text-muted-foreground">Expiring</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={filterLocation} onValueChange={setFilterLocation}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="fridge">Fridge</TabsTrigger>
                  <TabsTrigger value="freezer">Freezer</TabsTrigger>
                  <TabsTrigger value="pantry">Pantry</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`border-0 shadow-lg ${
                item.status === 'expiring_soon' ? 'border-2 border-yellow-500' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">
                      {item.category === 'produce' ? '🥬' :
                       item.category === 'meat' ? '🥩' :
                       item.category === 'dairy' ? '🥛' :
                       item.category === 'seafood' ? '🐟' : '🥫'}
                    </div>
                    <Badge variant={item.status === 'expiring_soon' ? 'destructive' : 'secondary'}>
                      {item.location}
                    </Badge>
                  </div>

                  <h4 className="font-bold mb-1">{item.item_name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.quantity} {item.unit}
                  </p>

                  <div className={`text-sm font-semibold mb-3 ${
                    item.daysUntilExpiration <= 1 ? 'text-red-500' :
                    item.daysUntilExpiration <= 3 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {item.daysUntilExpiration === 0 ? '⚠️ Expires today!' :
                     item.daysUntilExpiration < 0 ? '❌ Expired' :
                     `✓ ${item.daysUntilExpiration} days left`}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

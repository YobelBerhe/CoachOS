import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  BarChart3,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Leaf,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { treesEquivalent, milesDrivenEquivalent } from '@/data/carbonFootprint';

export default function WasteReport() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [wasteLog, setWasteLog] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    itemsWasted: 0,
    moneyWasted: 0,
    carbonWasted: 0,
    itemsSaved: 0,
    moneySaved: 0,
    carbonSaved: 0
  });

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load waste log
      const { data: wasteData } = await supabase
        .from('waste_log')
        .select('*')
        .eq('user_id', user.id)
        .order('wasted_date', { ascending: false })
        .limit(10);

      setWasteLog(wasteData || []);

      // Load carbon savings
      const { data: savingsData } = await supabase
        .from('carbon_savings')
        .select('*')
        .eq('user_id', user.id);

      // Calculate totals
      const waste = (wasteData || []).reduce((acc, item) => ({
        itemsWasted: acc.itemsWasted + 1,
        moneyWasted: acc.moneyWasted + item.estimated_cost,
        carbonWasted: acc.carbonWasted + item.carbon_footprint
      }), { itemsWasted: 0, moneyWasted: 0, carbonWasted: 0 });

      const savings = (savingsData || []).reduce((acc, item) => ({
        itemsSaved: acc.itemsSaved + item.waste_prevented_count,
        moneySaved: acc.moneySaved + item.money_saved,
        carbonSaved: acc.carbonSaved + item.carbon_saved_kg
      }), { itemsSaved: 0, moneySaved: 0, carbonSaved: 0 });

      setTotalStats({ ...waste, ...savings });

    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  const wastePercentage = totalStats.itemsSaved > 0
    ? (totalStats.itemsWasted / (totalStats.itemsSaved + totalStats.itemsWasted)) * 100
    : 0;

  const savingsRate = 100 - wastePercentage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-500/5 to-background">
      {/* Header */}
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
                <BarChart3 className="w-6 h-6 text-green-500" />
                Waste Report
              </h1>
              <p className="text-sm text-muted-foreground">
                Your sustainability journey
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Waste Card */}
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10" />
            <CardContent className="p-8 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Food Wasted</h3>
                  <p className="text-sm text-muted-foreground">Total lifetime</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Items</span>
                    <span className="text-2xl font-bold text-red-600">{totalStats.itemsWasted}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Money Lost
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      ${totalStats.moneyWasted.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-1">
                      <Leaf className="w-4 h-4" />
                      Carbon Wasted
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {totalStats.carbonWasted.toFixed(1)}kg
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Card */}
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
            <CardContent className="p-8 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Food Saved</h3>
                  <p className="text-sm text-muted-foreground">Total lifetime</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Items</span>
                    <span className="text-2xl font-bold text-green-600">{totalStats.itemsSaved}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Money Saved
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ${totalStats.moneySaved.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-1">
                      <Leaf className="w-4 h-4" />
                      Carbon Saved
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {totalStats.carbonSaved.toFixed(1)}kg
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-500" />
                  Food Savings Rate
                </h3>
                <Badge className={`text-xl px-4 py-2 ${
                  savingsRate >= 90 ? 'bg-green-500' :
                  savingsRate >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {savingsRate.toFixed(1)}%
                </Badge>
              </div>

              <Progress value={savingsRate} className="h-4 mb-4" />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">{totalStats.itemsSaved}</p>
                  <p className="text-sm text-muted-foreground">Items Saved</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">{totalStats.itemsWasted}</p>
                  <p className="text-sm text-muted-foreground">Items Wasted</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalStats.itemsSaved + totalStats.itemsWasted}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Tracked</p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <p className="text-sm font-semibold text-center">
                  {savingsRate >= 90 ? '🌟 Outstanding! You\'re a sustainability champion!' :
                   savingsRate >= 70 ? '👍 Great work! Keep improving your savings rate!' :
                   '💪 You can do better! Aim for 70%+ savings rate!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Environmental Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-500" />
                Environmental Impact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="text-center mb-4">
                    <p className="text-5xl mb-2">🌳</p>
                    <p className="text-4xl font-bold text-green-600">
                      {treesEquivalent(totalStats.carbonSaved).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Trees Planted Equivalent</p>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Your carbon savings = planting this many trees annually
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-center mb-4">
                    <p className="text-5xl mb-2">🚗</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {milesDrivenEquivalent(totalStats.carbonSaved).toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Miles Not Driven</p>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Same CO2 impact as not driving this distance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Waste Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Recent Waste Log</h3>

              {wasteLog.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h4 className="text-xl font-bold mb-2">Perfect Record!</h4>
                  <p className="text-muted-foreground">
                    You haven't wasted any food recently. Keep it up! 🌟
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wasteLog.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.item_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.wasted_date).toLocaleDateString()} • {item.waste_reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            ${item.estimated_cost.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.carbon_footprint.toFixed(2)}kg CO2
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import CreatorOnboarding from '@/components/payments/CreatorOnboarding';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [earnings, setEarnings] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await loadDashboardData(user.id);
    }
    init();
  }, [navigate]);

  async function loadDashboardData(uid: string) {
    try {
      const { data: earningsData } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      setEarnings(earningsData || {
        total_earnings_cents: 0,
        pending_payout_cents: 0,
        paid_out_cents: 0,
        total_sales: 0
      });

      const { data: txData } = await supabase
        .from('payment_transactions')
        .select('*, recipes(name)')
        .eq('seller_id', uid)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(txData || []);

      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      setRecipes(recipesData || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalEarnings = (earnings?.total_earnings_cents || 0) / 100;
  const pendingPayout = (earnings?.pending_payout_cents || 0) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950/10 dark:via-background dark:to-emerald-950/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Creator Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your recipes and earnings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Earnings</span>
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ${totalEarnings.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pending Payout</span>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600">
                    ${pendingPayout.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Sales</span>
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold">
                    {earnings?.total_sales || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No sales yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/20"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{tx.recipes?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            +${(tx.amount_creator_payout / 100).toFixed(2)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {tx.payout_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Recipes</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/create-recipe')}
                  >
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors"
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      {recipe.images?.[0] && (
                        <img
                          src={recipe.images[0]}
                          alt={recipe.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{recipe.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {recipe.is_paid && (
                            <Badge variant="secondary" className="text-xs">
                              ${recipe.price}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {recipe.total_unlocks || 0} sales
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${((recipe.total_revenue || 0) * 0.85).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <CreatorOnboarding userId={userId} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Next Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ${pendingPayout.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scheduled for next Friday
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

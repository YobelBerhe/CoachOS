import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tag, 
  Clock, 
  TrendingDown,
  Star,
  Flame,
  ChevronRight 
} from 'lucide-react';

export default function DealsSection() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('status', 'published')
        .eq('is_on_deal', true)
        .gte('deal_end_date', new Date().toISOString())
        .order('deal_percentage', { ascending: false })
        .limit(6);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateTimeRemaining(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon!';
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 animate-pulse" />
          <h2 className="text-2xl font-bold">Hot Deals 🔥</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-red-600" />
          <h2 className="text-2xl font-bold">Hot Deals 🔥</h2>
          <Badge variant="destructive" className="animate-pulse">
            Limited Time
          </Badge>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/recipes?filter=deals')}
        >
          View All Deals
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map(deal => (
          <Card
            key={deal.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
            onClick={() => navigate(`/recipe/${deal.id}`)}
          >
            {/* Deal Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-600 text-white font-bold text-lg px-3 py-1 shadow-lg">
                {deal.deal_percentage}% OFF
              </Badge>
            </div>

            {/* Timer Badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm">
                <Clock className="w-3 h-3 mr-1" />
                {calculateTimeRemaining(deal.deal_end_date)}
              </Badge>
            </div>

            {/* Image */}
            <div className="relative aspect-video">
              <img
                src={deal.images?.[deal.thumbnail_index] || deal.images?.[0]}
                alt={deal.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Quick Stats */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-white text-xs font-semibold">
                    {deal.average_rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-white text-xs font-semibold">
                    {deal.calories_per_serving}
                  </span>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {deal.name}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    ${deal.deal_price?.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${deal.original_price?.toFixed(2)}
                  </span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Save ${(deal.original_price - deal.deal_price).toFixed(2)}
                </Badge>
              </div>

              {/* Deal Description */}
              {deal.deal_description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {deal.deal_description}
                </p>
              )}

              {/* Macros */}
              <div className="flex justify-between text-xs text-muted-foreground pt-3 border-t">
                <span>P: {deal.protein_g}g</span>
                <span>C: {deal.carbs_g}g</span>
                <span>F: {deal.fats_g}g</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

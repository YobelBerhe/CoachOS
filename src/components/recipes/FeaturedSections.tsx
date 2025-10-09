import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Target,
  Flame,
  Star
} from 'lucide-react';
import {
  getHybridRecommendations,
  getTrendingRecommendations,
  getGoalBasedRecommendations,
  Recipe
} from '@/lib/recommendations/recommendationEngine';

interface FeaturedSectionsProps {
  userId: string;
}

interface Section {
  title: string;
  icon: React.ReactNode;
  recipes: Recipe[];
}

export default function FeaturedSections({ userId }: FeaturedSectionsProps) {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedSections();
  }, [userId]);

  async function loadFeaturedSections() {
    try {
      setLoading(true);

      const [forYou, trending, goalBased] = await Promise.all([
        getHybridRecommendations(userId, 12),
        getTrendingRecommendations(12),
        getGoalBasedRecommendations(userId, 12)
      ]);

      const newSections: Section[] = [];

      if (forYou.length > 0) {
        newSections.push({
          title: 'Recommended For You',
          icon: <Sparkles className="w-5 h-5" />,
          recipes: forYou.slice(0, 6)
        });
      }

      if (trending.length > 0) {
        newSections.push({
          title: 'Trending Now',
          icon: <TrendingUp className="w-5 h-5" />,
          recipes: trending.slice(0, 6)
        });
      }

      if (goalBased.length > 0) {
        newSections.push({
          title: 'Perfect For Your Goal',
          icon: <Target className="w-5 h-5" />,
          recipes: goalBased.slice(0, 6)
        });
      }

      setSections(newSections);
    } catch (error) {
      console.error('Error loading featured sections:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(j => (
                <div key={j} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 mb-12">
      {sections.map((section, index) => (
        <div key={index} className="space-y-4">
          <div className="flex items-center gap-2">
            {section.icon}
            <h2 className="text-2xl font-bold">{section.title}</h2>
          </div>

          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
              {section.recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`)} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const imageUrl = recipe.images?.[recipe.thumbnail_index] || recipe.images?.[0];

  return (
    <Card
      className="flex-shrink-0 w-48 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-square">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Flame className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {recipe.is_paid && (
          <Badge className="absolute top-2 left-2 bg-green-600">
            ${recipe.price?.toFixed(2)}
          </Badge>
        )}

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-xs font-semibold">
              {recipe.average_rating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-white text-xs font-semibold">
              {recipe.calories_per_serving || 0}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
          {recipe.name}
        </h3>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>P: {recipe.protein_g || 0}g</span>
          <span>C: {recipe.carbs_g || 0}g</span>
          <span>F: {recipe.fats_g || 0}g</span>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateMealFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DIETARY_TAGS = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'High-Protein'
];

const ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish'
];

export default function CreateMealForm({ onSuccess, onCancel }: CreateMealFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meal_type: 'lunch',
    cuisine_type: '',
    portions: 1,
    calories_per_portion: 400,
    protein: 20,
    carbs: 40,
    fats: 15,
    pickup_location: '',
    prep_date: new Date().toISOString().split('T')[0],
    best_before: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    swap_type: 'free'
  });

  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleTag(tag: string, list: string[], setter: (list: string[]) => void) {
    if (list.includes(tag)) {
      setter(list.filter(t => t !== tag));
    } else {
      setter([...list, tag]);
    }
  }

  async function handleSubmit() {
    if (!formData.title.trim() || !formData.description.trim() || !formData.pickup_location.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('meal_swaps')
        .insert([{
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          meal_type: formData.meal_type,
          cuisine_type: formData.cuisine_type,
          portions: formData.portions,
          calories_per_portion: formData.calories_per_portion,
          protein: formData.protein,
          carbs: formData.carbs,
          fats: formData.fats,
          dietary_tags: selectedDietaryTags,
          allergens: selectedAllergens,
          prep_date: formData.prep_date,
          best_before: formData.best_before,
          pickup_location: formData.pickup_location,
          swap_type: formData.swap_type,
          credits_value: formData.swap_type === 'credit' ? 5 : 0
        }]);

      if (error) throw error;

      // Update user stats
      await supabase.rpc('increment_meals_posted', { 
        p_user_id: user.id 
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Meal posted! 🎉",
        description: "Your meal is now available to the community"
      });

      onSuccess();

    } catch (error) {
      console.error('Error posting meal:', error);
      toast({
        title: "Error posting meal",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label>Meal Title *</Label>
          <Input
            placeholder="e.g., Grilled Chicken & Quinoa Bowl"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Description *</Label>
          <Textarea
            placeholder="Describe your meal, ingredients, and any special notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-2 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Meal Type</Label>
            <Select value={formData.meal_type} onValueChange={(v) => setFormData({ ...formData, meal_type: v })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                <SelectItem value="lunch">☀️ Lunch</SelectItem>
                <SelectItem value="dinner">🌙 Dinner</SelectItem>
                <SelectItem value="snack">🍎 Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cuisine Type</Label>
            <Input
              placeholder="e.g., Italian, Asian"
              value={formData.cuisine_type}
              onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label>Portions Available</Label>
          <Input
            type="number"
            min="1"
            value={formData.portions}
            onChange={(e) => setFormData({ ...formData, portions: parseInt(e.target.value) || 1 })}
            className="mt-2"
          />
        </div>
      </div>

      {/* Nutrition */}
      <div className="space-y-4">
        <h3 className="font-bold">Nutrition (per portion)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs">Calories</Label>
            <Input
              type="number"
              value={formData.calories_per_portion}
              onChange={(e) => setFormData({ ...formData, calories_per_portion: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Protein (g)</Label>
            <Input
              type="number"
              value={formData.protein}
              onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Carbs (g)</Label>
            <Input
              type="number"
              value={formData.carbs}
              onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Fats (g)</Label>
            <Input
              type="number"
              value={formData.fats}
              onChange={(e) => setFormData({ ...formData, fats: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Dietary Tags */}
      <div>
        <Label className="mb-2 block">Dietary Tags</Label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_TAGS.map((tag) => (
            <Badge
              key={tag}
              onClick={() => toggleTag(tag, selectedDietaryTags, setSelectedDietaryTags)}
              className={`cursor-pointer ${
                selectedDietaryTags.includes(tag)
                  ? 'bg-green-500'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Allergens */}
      <div>
        <Label className="mb-2 block">⚠️ Allergen Warnings</Label>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((allergen) => (
            <Badge
              key={allergen}
              onClick={() => toggleTag(allergen, selectedAllergens, setSelectedAllergens)}
              variant={selectedAllergens.includes(allergen) ? 'destructive' : 'outline'}
              className="cursor-pointer"
            >
              {allergen}
            </Badge>
          ))}
        </div>
      </div>

      {/* Dates & Location */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Prep Date</Label>
            <Input
              type="date"
              value={formData.prep_date}
              onChange={(e) => setFormData({ ...formData, prep_date: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Best Before</Label>
            <Input
              type="date"
              value={formData.best_before}
              onChange={(e) => setFormData({ ...formData, best_before: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label>Pickup Location *</Label>
          <Input
            placeholder="e.g., Downtown Oakland, near 12th St BART"
            value={formData.pickup_location}
            onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Swap Type</Label>
          <Select value={formData.swap_type} onValueChange={(v) => setFormData({ ...formData, swap_type: v })}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">🎁 Free</SelectItem>
              <SelectItem value="credit">💎 Credits (5 credits)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.swap_type === 'free' 
              ? 'Give away for free and earn community karma'
              : 'Charge 5 credits - great for premium meal prep'
            }
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
        >
          {isSubmitting ? 'Posting...' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Post Meal
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

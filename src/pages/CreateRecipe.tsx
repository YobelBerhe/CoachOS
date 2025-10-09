import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Clock,
  Users,
  ChefHat,
  Tag,
  DollarSign,
  Youtube,
  Link as LinkIcon,
  Info,
  Sparkles,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const CUISINE_TYPES = [
  'Italian', 'Chinese', 'Mexican', 'Japanese', 'Indian', 'Thai', 'Korean',
  'Vietnamese', 'American', 'French', 'Spanish', 'Greek', 'Middle Eastern',
  'Filipino', 'Brazilian', 'Peruvian', 'Pakistani', 'African', 'Southern',
  'Pizza', 'Sushi', 'Ramen', 'Noodles', 'Soup', 'Salad', 'Desserts',
  'Healthy', 'Comfort Food', 'Seafood', 'BBQ', 'Vegan', 'Halal'
];

const DIET_TAGS = [
  'High Protein', 'Low Carb', 'Keto', 'Vegetarian', 'Vegan',
  'Gluten Free', 'Dairy Free', 'Paleo', 'Whole30', 'Mediterranean',
  'Quick', 'Meal Prep', 'Post-Workout', 'Pre-Workout', 'Late Night',
  'Budget Friendly', 'Family Friendly', 'Date Night'
];

const MEASUREMENT_UNITS = [
  'tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'L',
  'piece', 'whole', 'clove', 'pinch', 'dash', 'to taste'
];

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
}

interface Equipment {
  name: string;
  amazon_link: string;
}

interface RecipeFormData {
  name: string;
  description: string;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  meal_types: string[];
  cuisine_types: string[];
  tags: string[];
  youtube_url: string;
  ingredients: Ingredient[];
  instructions: string[];
  equipment: Equipment[];
  images: File[];
  thumbnail_index: number;
  is_paid: boolean;
  price: string;
  stripe_email: string;
}

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    description: '',
    prep_time_min: 15,
    cook_time_min: 20,
    servings: 2,
    difficulty: 'Easy',
    meal_types: [],
    cuisine_types: [],
    tags: [],
    youtube_url: '',
    ingredients: [{ item: '', amount: '', unit: 'cup' }],
    instructions: ['', '', '', '', '', ''],
    equipment: [{ name: '', amazon_link: '' }],
    images: [],
    thumbnail_index: 0,
    is_paid: false,
    price: '',
    stripe_email: ''
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check auth on mount
  useState(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
    }
    checkAuth();
  });

  // Calculate form completion
  const calculateProgress = (): number => {
    let completed = 0;
    const total = 10;

    if (formData.name) completed++;
    if (formData.description) completed++;
    if (formData.images.length >= 2) completed++;
    if (formData.ingredients.some(i => i.item)) completed++;
    if (formData.instructions.some(i => i.trim())) completed++;
    if (formData.meal_types.length > 0) completed++;
    if (formData.cuisine_types.length > 0) completed++;
    if (formData.tags.length > 0) completed++;
    if (formData.prep_time_min > 0 && formData.cook_time_min > 0) completed++;
    if (formData.servings > 0) completed++;

    return (completed / total) * 100;
  };

  // Image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate images
    const validImages = files.filter(file => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} must be JPG or PNG`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} must be under 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    const currentImages = [...formData.images, ...validImages].slice(0, 6);
    setFormData({ ...formData, images: currentImages });

    // Generate previews
    const newPreviews = validImages.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 6));
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData({ 
      ...formData, 
      images: newImages,
      thumbnail_index: formData.thumbnail_index >= index ? Math.max(0, formData.thumbnail_index - 1) : formData.thumbnail_index
    });
    setImagePreviews(newPreviews);
  };

  // Ingredient handling
  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { item: '', amount: '', unit: 'cup' }]
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  // Equipment handling
  const addEquipment = () => {
    setFormData({
      ...formData,
      equipment: [...formData.equipment, { name: '', amazon_link: '' }]
    });
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_, i) => i !== index)
    });
  };

  const updateEquipment = (index: number, field: keyof Equipment, value: string) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index][field] = value;
    setFormData({ ...formData, equipment: newEquipment });
  };

  // Instruction handling
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  // Tag handling
  const toggleSelection = (array: string[], item: string): string[] => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.images.length < 2) {
      newErrors.images = 'At least 2 images required (thumbnail + ingredients)';
    }

    const validIngredients = formData.ingredients.filter(i => i.item.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    const validInstructions = formData.instructions.filter(i => i.trim());
    if (validInstructions.length < 2) {
      newErrors.instructions = 'At least 2 instruction steps required';
    }

    if (formData.meal_types.length === 0) {
      newErrors.meal_types = 'Select at least one meal type';
    }

    if (formData.is_paid) {
      if (!formData.price || parseFloat(formData.price) < 0.99) {
        newErrors.price = 'Price must be at least $0.99';
      }
      if (!formData.stripe_email || !formData.stripe_email.includes('@')) {
        newErrors.stripe_email = 'Valid email required for payouts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Please fix errors",
        description: "Check the form for validation errors",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Filter valid ingredients
      const validIngredients = formData.ingredients
        .filter(i => i.item.trim())
        .map(i => ({
          item: i.item.trim(),
          amount: i.amount.trim(),
          unit: i.unit
        }));

      // Filter valid instructions
      const validInstructions = formData.instructions
        .filter(i => i.trim())
        .map(i => i.trim());

      // Filter valid equipment
      const validEquipment = formData.equipment
        .filter(e => e.name.trim())
        .map(e => ({
          name: e.name.trim(),
          amazon_link: e.amazon_link.trim() || null
        }));

      // Create recipe in database
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: userId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          images: imageUrls,
          thumbnail_index: formData.thumbnail_index,
          youtube_url: formData.youtube_url.trim() || null,
          prep_time_min: formData.prep_time_min,
          cook_time_min: formData.cook_time_min,
          servings: formData.servings,
          difficulty: formData.difficulty,
          meal_types: formData.meal_types,
          cuisine_types: formData.cuisine_types,
          tags: formData.tags,
          ingredients: validIngredients,
          instructions: validInstructions,
          equipment: validEquipment,
          is_paid: formData.is_paid,
          price: formData.is_paid ? parseFloat(formData.price) : null,
          status: 'published',
          // Nutrition will be calculated by Edge Function
          calories_per_serving: 0,
          protein_g: 0,
          carbs_g: 0,
          fats_g: 0
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Trigger nutrition calculation (Edge Function)
      const { error: functionError } = await supabase.functions.invoke('calculate-nutrition', {
        body: { recipe_id: recipe.id }
      });

      if (functionError) {
        console.error('Nutrition calculation error:', functionError);
        // Don't fail the recipe creation, just log it
      }

      toast({
        title: "Recipe created! 🎉",
        description: "Your recipe is now live and calculating nutrition..."
      });

      navigate(`/recipe/${recipe.id}`);

    } catch (error: any) {
      console.error('Error creating recipe:', error);
      toast({
        title: "Error creating recipe",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-red-50 dark:from-orange-950/10 dark:via-background dark:to-red-950/10">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/recipes')}
              disabled={submitting}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Recipe</h1>
              <p className="text-sm text-muted-foreground">
                Share your culinary masterpiece with the community
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  is_on_deal: boolean;
  deal_percentage: number;
  deal_duration_days: number;
  deal_description: string;
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
    stripe_email: '',
    is_on_deal: false,
    deal_percentage: 20,
    deal_duration_days: 7,
    deal_description: ''
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

      // Prepare deal dates if deal is active
      let dealStartDate = null;
      let dealEndDate = null;
      let dealPrice = null;

      if (formData.is_on_deal && formData.is_paid && formData.price) {
        const originalPrice = parseFloat(formData.price);
        dealPrice = originalPrice * (1 - formData.deal_percentage / 100);
        dealStartDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + formData.deal_duration_days);
        dealEndDate = endDate.toISOString();
      }

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
          is_on_deal: formData.is_on_deal && formData.is_paid,
          original_price: formData.is_on_deal && formData.is_paid ? parseFloat(formData.price) : null,
          deal_price: dealPrice,
          deal_percentage: formData.is_on_deal ? formData.deal_percentage : null,
          deal_start_date: dealStartDate,
          deal_end_date: dealEndDate,
          deal_description: formData.is_on_deal ? formData.deal_description || `Limited time ${formData.deal_percentage}% off!` : null,
          status: 'published',
          category: formData.meal_types[0] || 'Other',
          // Nutrition will be calculated by Edge Function
          calories_per_serving: 0,
          protein_g: 0,
          carbs_g: 0,
          fats_g: 0
        } as any)
        .select()
        .single();

      if (recipeError) throw recipeError;

      toast({
        title: "Recipe created! 🎉",
        description: "Calculating nutrition with AI..."
      });

      // Trigger nutrition calculation (Edge Function)
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'calculate-nutrition',
          {
            body: { recipe_id: recipe.id }
          }
        );

        if (functionError) {
          console.error('Nutrition calculation error:', functionError);
          toast({
            title: "Warning",
            description: "Recipe created but nutrition calculation is pending. It will complete shortly.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success! ✨",
            description: "Recipe created with accurate AI-powered nutrition data"
          });
        }
      } catch (error) {
        console.error('Function invocation error:', error);
      }

      navigate(`/recipes`);

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
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Completion Progress</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: BASIC INFO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipe Name */}
              <div>
                <Label htmlFor="name">
                  Recipe Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grilled Chicken Caesar Salad"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your recipe in 2-3 sentences. What makes it special?"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Time & Servings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prep_time">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Prep Time (min)
                  </Label>
                  <Input
                    id="prep_time"
                    type="number"
                    min="1"
                    value={formData.prep_time_min}
                    onChange={(e) => setFormData({ ...formData, prep_time_min: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="cook_time">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Cook Time (min)
                  </Label>
                  <Input
                    id="cook_time"
                    type="number"
                    min="0"
                    value={formData.cook_time_min}
                    onChange={(e) => setFormData({ ...formData, cook_time_min: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="servings">
                    <Users className="w-4 h-4 inline mr-1" />
                    Servings
                  </Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy - Perfect for beginners</SelectItem>
                    <SelectItem value="Medium">Medium - Some cooking experience needed</SelectItem>
                    <SelectItem value="Hard">Hard - Advanced techniques required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: PHOTOS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photos (2-6 images)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload 2-6 photos. First photo = thumbnail, second = ingredients. Max 10MB each, JPG or PNG only.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Existing images */}
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Badge for image role */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {index === 0 ? '📸 Thumbnail' : index === 1 ? '🥗 Ingredients' : `Photo ${index + 1}`}
                      </Badge>
                    </div>

                    {/* Thumbnail selector */}
                    {index > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.thumbnail_index === index ? 'default' : 'outline'}
                        className="absolute bottom-2 left-2 text-xs"
                        onClick={() => setFormData({ ...formData, thumbnail_index: index })}
                      >
                        {formData.thumbnail_index === index ? <Check className="w-3 h-3 mr-1" /> : null}
                        Set as Thumbnail
                      </Button>
                    )}

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-8 h-8"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Upload button */}
                {formData.images.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Upload Photo</span>
                    <span className="text-xs text-muted-foreground">JPG/PNG, max 10MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {errors.images && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.images}
                </p>
              )}

              {/* Info box */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
                    <p><strong>Photo 1 (Thumbnail):</strong> Your best shot - this appears on recipe cards</p>
                    <p><strong>Photo 2 (Ingredients):</strong> All ingredients laid out together</p>
                    <p><strong>Photos 3-6 (Optional):</strong> Cooking process, plating, or variations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: INGREDIENTS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 grid grid-cols-12 gap-2">
                    {/* Ingredient name */}
                    <Input
                      placeholder="e.g., Chicken breast"
                      value={ingredient.item}
                      onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                      className="col-span-12 md:col-span-5"
                    />
                    
                    {/* Amount */}
                    <Input
                      placeholder="1"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      className="col-span-4 md:col-span-3"
                    />
                    
                    {/* Unit */}
                    <Select
                      value={ingredient.unit}
                      onValueChange={(value) => updateIngredient(index, 'unit', value)}
                    >
                      <SelectTrigger className="col-span-8 md:col-span-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEASUREMENT_UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove button */}
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>

              {errors.ingredients && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.ingredients}
                </p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: INSTRUCTIONS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Instructions (Steps 1-6)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Write 2-6 steps. All boxes are visible - leave extras blank if not needed.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`step-${index}`}>
                    Step {index + 1}
                    {index < 2 && <span className="text-red-500 ml-1">*</span>}
                    {index >= 2 && <span className="text-muted-foreground ml-2">(optional)</span>}
                  </Label>
                  <Textarea
                    id={`step-${index}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Describe step ${index + 1}...`}
                    rows={3}
                    className={errors.instructions && index < 2 && !instruction.trim() ? 'border-red-500' : ''}
                  />
                </div>
              ))}

              {errors.instructions && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.instructions}
                </p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: EQUIPMENT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Special Equipment (Optional)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                List any special tools needed. Add Amazon affiliate links to earn commissions!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.equipment.map((item, index) => (
                <div key={index} className="space-y-2 p-3 bg-secondary/20 rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Equipment name (e.g., Cast Iron Skillet)"
                      value={item.name}
                      onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    {formData.equipment.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEquipment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Amazon affiliate link (optional)"
                    value={item.amazon_link}
                    onChange={(e) => updateEquipment(index, 'amazon_link', e.target.value)}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEquipment}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </CardContent>
          </Card>

          {/* SECTION 6: CATEGORIZATION */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Categories & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meal Types */}
              <div>
                <Label className="mb-3 block">
                  Meal Type <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map(type => (
                    <Button
                      key={type}
                      type="button"
                      variant={formData.meal_types.includes(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        meal_types: toggleSelection(formData.meal_types, type)
                      })}
                    >
                      {formData.meal_types.includes(type) && <Check className="w-3 h-3 mr-1" />}
                      {type}
                    </Button>
                  ))}
                </div>
                {errors.meal_types && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.meal_types}
                  </p>
                )}
              </div>

              {/* Cuisine Types */}
              <div>
                <Label className="mb-3 block">Cuisine Type</Label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                  {CUISINE_TYPES.map(cuisine => (
                    <Button
                      key={cuisine}
                      type="button"
                      variant={formData.cuisine_types.includes(cuisine) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        cuisine_types: toggleSelection(formData.cuisine_types, cuisine)
                      })}
                    >
                      {formData.cuisine_types.includes(cuisine) && <Check className="w-3 h-3 mr-1" />}
                      {cuisine}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Diet Tags */}
              <div>
                <Label className="mb-3 block">Diet & Lifestyle Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {DIET_TAGS.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        tags: toggleSelection(formData.tags, tag)
                      })}
                    >
                      {formData.tags.includes(tag) && <Check className="w-3 h-3 mr-1" />}
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 7: YOUTUBE VIDEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5" />
                YouTube Video (Optional)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a YouTube link showing step-by-step preparation
              </p>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* SECTION 8: MONETIZATION */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Monetization
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Earn money from your recipe! Platform takes 15% commission.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Free or Paid toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                <div>
                  <p className="font-semibold">Make this a paid recipe?</p>
                  <p className="text-sm text-muted-foreground">
                    Users pay to unlock. You keep 85%.
                  </p>
                </div>
                <Switch
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                />
              </div>

              {/* Paid recipe fields */}
              {formData.is_paid && (
                <div className="space-y-4 p-4 border-2 border-green-200 dark:border-green-900 rounded-lg">
                  <div>
                    <Label htmlFor="price">
                      Recipe Price (USD) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.99"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="2.99"
                        className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.price}
                      </p>
                    )}
                    {formData.price && parseFloat(formData.price) > 0 && (
                      <div className="mt-2 text-sm space-y-1">
                        <p className="text-muted-foreground">
                          You earn: <span className="font-bold text-green-600">
                            ${(parseFloat(formData.price) * 0.85).toFixed(2)}
                          </span> per unlock
                        </p>
                        <p className="text-muted-foreground">
                          Platform fee: ${(parseFloat(formData.price) * 0.15).toFixed(2)} (15%)
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stripe_email">
                      Payout Email (for Stripe) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stripe_email"
                      type="email"
                      value={formData.stripe_email}
                      onChange={(e) => setFormData({ ...formData, stripe_email: e.target.value })}
                      placeholder="your@email.com"
                      className={errors.stripe_email ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send your earnings to this email via Stripe
                    </p>
                    {errors.stripe_email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.stripe_email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 9: DEALS & PROMOTIONS */}
          {formData.is_paid && (
            <Card className="border-2 border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-red-600" />
                  Deals & Promotions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a limited-time deal to boost sales! 🔥
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enable Deal toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg">
                  <div>
                    <p className="font-semibold">Put this recipe on deal?</p>
                    <p className="text-sm text-muted-foreground">
                      Offer a discount for limited time
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_on_deal}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_on_deal: checked })}
                  />
                </div>

                {/* Deal configuration */}
                {formData.is_on_deal && (
                  <div className="space-y-4 p-4 border-2 border-red-200 dark:border-red-900 rounded-lg">
                    {/* Discount Percentage Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Discount Percentage</Label>
                        <Badge className="bg-red-600 text-white text-lg px-3">
                          {formData.deal_percentage}% OFF
                        </Badge>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="5"
                        value={formData.deal_percentage}
                        onChange={(e) => setFormData({ ...formData, deal_percentage: Number(e.target.value) })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>10%</span>
                        <span>50%</span>
                        <span>90%</span>
                      </div>
                    </div>

                    {/* Deal Duration */}
                    <div>
                      <Label htmlFor="deal_duration">Deal Duration (days)</Label>
                      <Input
                        id="deal_duration"
                        type="number"
                        min="1"
                        max="30"
                        value={formData.deal_duration_days}
                        onChange={(e) => setFormData({ ...formData, deal_duration_days: Number(e.target.value) })}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deal will expire in {formData.deal_duration_days} days
                      </p>
                    </div>

                    {/* Deal Description */}
                    <div>
                      <Label htmlFor="deal_description">Deal Description (Optional)</Label>
                      <Textarea
                        id="deal_description"
                        value={formData.deal_description}
                        onChange={(e) => setFormData({ ...formData, deal_description: e.target.value })}
                        placeholder={`Limited time ${formData.deal_percentage}% off!`}
                        className="mt-2"
                        rows={2}
                      />
                    </div>

                    {/* Deal Preview */}
                    <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg border-2 border-red-200 dark:border-red-900">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Deal Preview
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Original Price:</span>
                          <span className="line-through">${parseFloat(formData.price || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deal Price:</span>
                          <span className="text-green-600 font-bold text-lg">
                            ${(parseFloat(formData.price || '0') * (1 - formData.deal_percentage / 100)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customers Save:</span>
                          <span className="text-red-600 font-bold">
                            ${(parseFloat(formData.price || '0') * (formData.deal_percentage / 100)).toFixed(2)} ({formData.deal_percentage}%)
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-red-200">
                          <span>You Earn (85%):</span>
                          <span className="text-green-600 font-bold">
                            ${(parseFloat(formData.price || '0') * (1 - formData.deal_percentage / 100) * 0.85).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SUBMIT BUTTON */}
          <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ready to publish?</p>
                    <p className="text-xs text-muted-foreground">
                      Your recipe will be live instantly. Nutrition calculated by AI.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting || progress < 60}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Publish Recipe
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}

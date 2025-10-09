import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, Camera, ThumbsUp, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
}

interface ReviewsSectionProps {
  recipeId: string;
  userId: string;
}

export default function ReviewsSection({ recipeId, userId }: ReviewsSectionProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [recipeId]);

  async function loadReviews() {
    try {
      const { data, error } = await supabase
        .from('recipe_reviews')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (!title.trim() || !comment.trim()) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      // Check if user unlocked recipe
      const { data: unlockData } = await supabase
        .from('recipe_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .maybeSingle();

      // Submit review
      const { error } = await supabase
        .from('recipe_reviews')
        .insert({
          recipe_id: recipeId,
          user_id: userId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          photos: photoUrls,
          verified_purchase: !!unlockData
        });

      if (error) throw error;

      toast({
        title: "Review posted! ⭐",
        description: "Thank you for your feedback"
      });

      setShowReviewForm(false);
      setRating(5);
      setTitle('');
      setComment('');
      setPhotos([]);
      
      await loadReviews();

    } catch (error: any) {
      toast({
        title: "Error posting review",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validPhotos = files.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024 && 
                     (file.type === 'image/jpeg' || file.type === 'image/png');
      if (!isValid) {
        toast({
          title: "Invalid photo",
          description: "Photos must be JPG/PNG under 10MB",
          variant: "destructive"
        });
      }
      return isValid;
    });

    setPhotos([...photos, ...validPhotos].slice(0, 5));
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length
  }));

  // Get all customer photos
  const allCustomerPhotos = reviews.flatMap(r => r.photos);

  return (
    <div className="space-y-6">
      {/* Ratings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Ratings & Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
              <div className="flex gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= avgRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {reviews.length} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-12">{stars} star</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Photos Preview */}
          {allCustomerPhotos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Customer Photos ({allCustomerPhotos.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhotoGallery(true)}
                >
                  See all
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {allCustomerPhotos.slice(0, 3).map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => setShowPhotoGallery(true)}
                  >
                    <img
                      src={photo}
                      alt={`Customer photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write Review Button */}
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Star Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Review Title</label>
                  <Input
                    placeholder="Sum up your experience..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review</label>
                  <Textarea
                    placeholder="Share your thoughts about this recipe..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Add Photos (Optional)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {photos.length < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Posting...' : 'Post Review'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardContent className="p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">Be the first to review this recipe!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b last:border-0">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold">{review.title}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-muted-foreground mb-3">{review.comment}</p>

                  {/* Review Photos */}
                  {review.photos.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <img
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Helpful ({review.helpful_count})
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Photos Gallery Modal */}
      <Dialog open={showPhotoGallery} onOpenChange={setShowPhotoGallery}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Customer Photos ({allCustomerPhotos.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4 max-h-96 overflow-y-auto">
            {allCustomerPhotos.map((photo, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={photo}
                  alt={`Customer photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

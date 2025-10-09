import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Camera, 
  ChevronRight, 
  Star, 
  User
} from 'lucide-react';

interface CustomerPhotosGalleryProps {
  recipeId: string;
  recipeName: string;
}

export default function CustomerPhotosGallery({ 
  recipeId, 
  recipeName 
}: CustomerPhotosGalleryProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showFullGallery, setShowFullGallery] = useState(false);

  useEffect(() => {
    loadCustomerPhotos();
  }, [recipeId]);

  async function loadCustomerPhotos() {
    try {
      const { data: reviews, error } = await supabase
        .from('recipe_reviews')
        .select(`
          id,
          rating,
          comment,
          photos,
          photo_count,
          created_at,
          user_id
        `)
        .eq('recipe_id', recipeId)
        .gt('photo_count', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles
      const userIds = [...new Set(reviews?.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Flatten photos array
      const allPhotos: any[] = [];
      reviews?.forEach(review => {
        const profile = profileMap.get(review.user_id);
        review.photos?.forEach((photo: string) => {
          allPhotos.push({
            url: photo,
            reviewId: review.id,
            rating: review.rating,
            comment: review.comment,
            userName: profile?.full_name || 'Anonymous',
            createdAt: review.created_at
          });
        });
      });

      setPhotos(allPhotos);
    } catch (error) {
      console.error('Error loading customer photos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5" />
            <h3 className="font-semibold">Customer Photos</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-secondary/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  const displayPhotos = photos.slice(0, 3);
  const remainingCount = Math.max(0, photos.length - 3);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Customer Photos</h3>
              <Badge variant="secondary">{photos.length}</Badge>
            </div>
            {photos.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullGallery(true)}
              >
                See All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-2">
            {displayPhotos.map((photo, index) => (
              <div
                key={index}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              >
                <img
                  src={photo.url}
                  alt={`Customer photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
            ))}

            {/* More Photos Indicator */}
            {remainingCount > 0 && (
              <div
                onClick={() => setShowFullGallery(true)}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold">+{remainingCount}</p>
                  <p className="text-xs text-muted-foreground">more</p>
                </div>
              </div>
            )}
          </div>

          {/* Photo Gallery Link */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setShowFullGallery(true)}
          >
            <Camera className="w-4 h-4 mr-2" />
            See Photo Gallery ({photos.length} photos)
          </Button>
        </CardContent>
      </Card>

      {/* Selected Photo Detail Dialog */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Customer Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt="Customer photo"
                className="w-full rounded-lg"
              />
              
              {/* Review Info */}
              <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{selectedPhoto.userName}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < selectedPhoto.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {selectedPhoto.comment && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPhoto.comment}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Gallery Dialog */}
      {showFullGallery && (
        <Dialog open={showFullGallery} onOpenChange={setShowFullGallery}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                All Customer Photos ({photos.length})
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setShowFullGallery(false);
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                >
                  <img
                    src={photo.url}
                    alt={`Customer photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < photo.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-white text-xs mt-1">{photo.userName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

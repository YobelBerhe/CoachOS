import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, User } from "lucide-react";

interface RecipeCardProps {
  name: string;
  description?: string;
  category: string;
  difficulty?: string;
  imageUrl?: string;
  prepTimeMin?: number;
  cookTimeMin?: number;
  servings: number;
  caloriesPerServing?: number;
  proteinGPerServing?: number;
  onClick?: () => void;
}

export const RecipeCard = ({
  name,
  description,
  category,
  difficulty,
  imageUrl,
  prepTimeMin,
  cookTimeMin,
  servings,
  caloriesPerServing,
  proteinGPerServing,
  onClick
}: RecipeCardProps) => {
  const totalTime = (prepTimeMin || 0) + (cookTimeMin || 0);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="relative h-40 bg-muted overflow-hidden rounded-t-lg">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flame className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">{category}</Badge>
        </div>
      </div>
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          {difficulty && (
            <Badge variant="outline" className="shrink-0">{difficulty}</Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{servings} {servings === 1 ? 'serving' : 'servings'}</span>
          </div>
        </div>
        {caloriesPerServing && (
          <div className="flex items-center justify-between pt-2 border-t text-sm">
            <span className="text-muted-foreground">Per serving:</span>
            <div className="font-medium">
              {caloriesPerServing} cal
              {proteinGPerServing && ` · ${proteinGPerServing}g protein`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

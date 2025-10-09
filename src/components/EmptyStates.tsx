import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChefHat, 
  Heart, 
  Utensils, 
  Dumbbell,
  Pill,
  Star,
  Search,
  Clock,
  LucideIcon
} from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  secondaryAction 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        <div className="flex gap-3">
          {action && (
            <Button onClick={action.onClick} size="lg">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="lg">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-made empty states
export function NoRecipesEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={ChefHat}
      title="No Recipes Yet"
      description="Start your culinary journey by creating your first recipe or exploring our community recipes."
      action={{
        label: 'Create Recipe',
        onClick: onCreate
      }}
    />
  );
}

export function NoFavoritesEmpty({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="No Favorites"
      description="Recipes you favorite will appear here. Start exploring and save your favorites!"
      action={{
        label: 'Browse Recipes',
        onClick: onBrowse
      }}
    />
  );
}

export function NoFoodLogsEmpty({ onAddFood }: { onAddFood: () => void }) {
  return (
    <EmptyState
      icon={Utensils}
      title="No Food Logged Today"
      description="Track your meals to reach your nutrition goals. Start logging your food now!"
      action={{
        label: 'Log Food',
        onClick: onAddFood
      }}
    />
  );
}

export function NoWorkoutsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={Dumbbell}
      title="No Workouts Yet"
      description="Start your fitness journey by creating or starting a workout plan."
      action={{
        label: 'Start Workout',
        onClick: onCreate
      }}
    />
  );
}

export function NoMedicationsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={Pill}
      title="No Medications"
      description="Keep track of your medications and supplements to stay on top of your health."
      action={{
        label: 'Add Medication',
        onClick: onAdd
      }}
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={`We couldn't find any recipes matching "${query}". Try different keywords or filters.`}
    />
  );
}

export function NoReviewsEmpty({ onWrite }: { onWrite: () => void }) {
  return (
    <EmptyState
      icon={Star}
      title="No Reviews Yet"
      description="Be the first to review this recipe and help others discover great food!"
      action={{
        label: 'Write Review',
        onClick: onWrite
      }}
    />
  );
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={Clock}
      title="All Caught Up!"
      description="You have no new notifications. We'll let you know when something important happens."
    />
  );
}

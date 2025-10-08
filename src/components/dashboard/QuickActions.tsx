import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Dumbbell, Moon, Scale } from "lucide-react";
import { AddFoodDialog } from "@/components/nutrition/AddFoodDialog";
import { AddSleepDialog } from "@/components/sleep/AddSleepDialog";
import { AddWeightDialog } from "@/components/weight/AddWeightDialog";

interface QuickActionsProps {
  userId: string;
}

export const QuickActions = ({ userId }: QuickActionsProps) => {
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 gap-1"
            onClick={() => setShowAddFood(true)}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-xs">Food</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 gap-1"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs">Workout</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 gap-1"
            onClick={() => setShowAddSleep(true)}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Sleep</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 gap-1"
            onClick={() => setShowAddWeight(true)}
          >
            <Scale className="w-5 h-5" />
            <span className="text-xs">Weight</span>
          </Button>
        </div>
      </div>

      <AddFoodDialog 
        open={showAddFood} 
        onClose={() => setShowAddFood(false)}
        userId={userId}
        onSuccess={() => {}}
      />
      <AddSleepDialog 
        open={showAddSleep} 
        onClose={() => setShowAddSleep(false)}
        userId={userId}
        onSuccess={() => {}}
      />
      <AddWeightDialog 
        open={showAddWeight} 
        onClose={() => setShowAddWeight(false)}
        userId={userId}
        onSuccess={() => {}}
      />
    </>
  );
};

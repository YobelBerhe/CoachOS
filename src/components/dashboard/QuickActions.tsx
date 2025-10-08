import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, UtensilsCrossed, Dumbbell, BarChart3, Settings } from "lucide-react";

interface QuickActionsProps {
  userId: string;
}

export const QuickActions = ({ userId }: QuickActionsProps) => {
  const navigate = useNavigate();
  const [currentPath] = useState(window.location.pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-3 safe-area-pb">
      <div className="max-w-4xl mx-auto grid grid-cols-5 gap-1">
        <Button
          variant={currentPath === '/dashboard' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Today</span>
        </Button>
        <Button
          variant={currentPath === '/eat' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/eat')}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-xs">Eat</span>
        </Button>
        <Button
          variant={currentPath === '/train' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/train')}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-xs">Train</span>
        </Button>
        <Button
          variant={currentPath === '/reports' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/reports')}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs">Reports</span>
        </Button>
        <Button
          variant={currentPath === '/settings' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col h-auto py-2 gap-1"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
};

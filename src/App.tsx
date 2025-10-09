import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { trackPageView, identifyUser } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';
import ErrorBoundary from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { InstallPrompt } from "@/components/InstallPrompt";
import { registerServiceWorker, requestNotificationPermission } from "@/lib/pwa";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Eat from "./pages/Eat";
import Train from "./pages/Train";
import Sleep from "./pages/Sleep";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Medications from "./pages/Medications";
import WorkoutInProgress from "./pages/WorkoutInProgress";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Fasting from "./pages/Fasting";
import CreatorDashboard from "./pages/CreatorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  
  // Track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  
  return (
    <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/eat" element={<Eat />} />
          <Route path="/train" element={<Train />} />
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/workout-in-progress" element={<WorkoutInProgress />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/fasting" element={<Fasting />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    // Register service worker for PWA
    registerServiceWorker();

    // Request notification permission after 10 seconds
    setTimeout(() => {
      requestNotificationPermission();
    }, 10000);

    // Check for authenticated user and identify in analytics
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        identifyUser(user.id, {
          email: user.email,
          created_at: user.created_at,
        });
      }
    }
    
    checkUser();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SEO />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageTransition>
              <AppRoutes />
            </PageTransition>
            <InstallPrompt />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

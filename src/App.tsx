import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ArchetypeThemeProvider } from "@/contexts/ArchetypeThemeContext";
import DynamicBackground from "@/components/DynamicBackground";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { SEO } from "@/components/SEO";
import { trackPageView, identifyUser } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';
import ErrorBoundary from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { InstallPrompt } from "@/components/InstallPrompt";
import { registerServiceWorker, requestNotificationPermission } from "@/lib/pwa";
import MainLayout from "@/components/MainLayout";
import Landing from "./pages/Landing";
import FinalHomepage from "./pages/FinalHomepage";
import Auth from "./pages/Auth";
import TimeBlock from "./pages/TimeBlock";
import Onboarding from "./pages/Onboarding";
import OnboardingExtended from "./pages/OnboardingExtended";
import Dashboard from "./pages/Dashboard";
import Eat from "./pages/Eat";
import Train from "./pages/Train";
import Sleep from "./pages/Sleep";
import SleepTracker from "./pages/SleepTracker";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Medications from "./pages/Medications";
import WorkoutInProgress from "./pages/WorkoutInProgress";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Fasting from "./pages/Fasting";
import CreatorDashboard from "./pages/CreatorDashboard";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Achievements from "./pages/Achievements";
import AICoach from "./pages/AICoach";
import Social from "./pages/Social";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Challenges from "./pages/Challenges";
import ProgressPhotos from "./pages/ProgressPhotos";
import LiveWorkouts from "./pages/LiveWorkouts";
import WorkoutBuddy from "./pages/WorkoutBuddy";
import BarcodeScanner from "./pages/BarcodeScanner";
import VoiceCoach from "./pages/VoiceCoach";
import VoiceCommands from "./pages/VoiceCommands";
import ProfileSetup from "./pages/ProfileSetup";
import ShoppingList from "./pages/ShoppingList";
import ReceiptScanner from "./pages/ReceiptScanner";
import NotificationSettings from "./pages/NotificationSettings";
import FamilySharing from "./pages/FamilySharing";
import FoodWasteDashboard from "./pages/FoodWasteDashboard";
import FridgeScanner from "./pages/FridgeScanner";
import RescueRecipes from "./pages/RescueRecipes";
import WasteReport from "./pages/WasteReport";
import MenuScanner from "./pages/MenuScanner";
import MealSwapMarketplace from "./pages/MealSwapMarketplace";
import FridgeInventory from "./pages/FridgeInventory";
import MorningJournal from "./pages/MorningJournal";
import EveningReflection from "./pages/EveningReflection";
import MobileNav from "./components/MobileNav";
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
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<FinalHomepage />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes with Sidebar */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Time Block Routes */}
            <Route path="/time/:timeId" element={<TimeBlock />} />
            
            {/* Tracking Routes */}
            <Route path="/tracking/dashboard" element={<AdvancedAnalytics />} />
            <Route path="/tracking/streaks" element={<Achievements />} />
            <Route path="/tracking/weekly" element={<Reports />} />
            <Route path="/tracking/monthly" element={<Reports />} />
            <Route path="/tracking/goals" element={<Achievements />} />
            
            {/* AI Routes */}
            <Route path="/ai/chat" element={<AICoach />} />
            <Route path="/ai/suggestions" element={<AICoach />} />
            <Route path="/ai/analyze" element={<AdvancedAnalytics />} />
            
            {/* Settings Routes */}
            <Route path="/settings/profile" element={<Settings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/appearance" element={<Settings />} />
            <Route path="/settings/privacy" element={<Settings />} />
            <Route path="/settings/integrations" element={<Settings />} />
            
            {/* Pricing */}
            <Route path="/pricing" element={<CreatorDashboard />} />
            
            {/* Other existing routes */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding-extended" element={<OnboardingExtended />} />
            <Route path="/eat" element={<Eat />} />
            <Route path="/train" element={<Train />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/sleep-tracker" element={<SleepTracker />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/workout-in-progress" element={<WorkoutInProgress />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
            <Route path="/fasting" element={<Fasting />} />
            <Route path="/creator-dashboard" element={<CreatorDashboard />} />
            <Route path="/compliance" element={<ComplianceDashboard />} />
            <Route path="/analytics" element={<AdvancedAnalytics />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/social" element={<Social />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:username" element={<Messages />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/progress-photos" element={<ProgressPhotos />} />
            <Route path="/live" element={<LiveWorkouts />} />
            <Route path="/workout-buddy" element={<WorkoutBuddy />} />
            <Route path="/barcode-scanner" element={<BarcodeScanner />} />
            <Route path="/voice-coach" element={<VoiceCoach />} />
            <Route path="/voice-commands" element={<VoiceCommands />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/receipt-scanner" element={<ReceiptScanner />} />
            <Route path="/notifications" element={<NotificationSettings />} />
            <Route path="/family-sharing" element={<FamilySharing />} />
            <Route path="/food-waste" element={<FoodWasteDashboard />} />
            <Route path="/fridge-scanner" element={<FridgeScanner />} />
            <Route path="/rescue-recipes" element={<RescueRecipes />} />
            <Route path="/waste-report" element={<WasteReport />} />
            <Route path="/menu-scanner" element={<MenuScanner />} />
            <Route path="/meal-swap" element={<MealSwapMarketplace />} />
            <Route path="/fridge-inventory" element={<FridgeInventory />} />
            <Route path="/journal" element={<MorningJournal />} />
            <Route path="/evening-reflection" element={<EveningReflection />} />
          </Route>

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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ArchetypeThemeProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <SEO />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <DynamicBackground />
                <PageTransition>
                  <AppRoutes />
                </PageTransition>
                <InstallPrompt />
                <ThemeSwitcher />
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </ArchetypeThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Activity, ArrowRight, User, Target, TrendingDown } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    sex: "Male",
    heightCm: "",
    activityLevel: "Moderately Active",
    currentWeight: "",
    targetWeight: "",
    goalType: "Fat Loss"
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const calculateTargets = () => {
    const weight = parseFloat(formData.currentWeight);
    const height = parseFloat(formData.heightCm);
    const age = parseInt(formData.age);
    
    // BMR calculation (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (formData.sex === "Male") bmr += 5;
    else if (formData.sex === "Female") bmr -= 161;
    else bmr -= 78; // Average

    // TDEE calculation
    const multipliers: Record<string, number> = {
      "Sedentary": 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Very Active": 1.725,
      "Athlete": 1.9
    };
    const tdee = Math.round(bmr * multipliers[formData.activityLevel]);

    // Calorie target based on goal
    let calories = tdee;
    if (formData.goalType === "Fat Loss") calories -= 500;
    else if (formData.goalType === "Muscle Gain") calories += 300;

    // Macros
    const weightLbs = weight * 2.20462;
    const proteinG = Math.round(weightLbs * 0.8);
    const fatsG = Math.round(calories * 0.27 / 9);
    const carbsG = Math.round((calories - (proteinG * 4) - (fatsG * 9)) / 4);

    return { bmr: Math.round(bmr), tdee, calories, proteinG, fatsG, carbsG };
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          sex: formData.sex,
          height_cm: parseFloat(formData.heightCm),
          activity_level: formData.activityLevel
        });

      if (profileError) throw profileError;

      // Create goal
      const { error: goalError } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          type: formData.goalType,
          current_weight_kg: parseFloat(formData.currentWeight),
          target_weight_kg: parseFloat(formData.targetWeight),
          is_active: true
        });

      if (goalError) throw goalError;

      // Create daily targets
      const targets = calculateTargets();
      const today = new Date().toISOString().split('T')[0];
      const { error: targetsError } = await supabase
        .from("daily_targets")
        .insert([{
          user_id: user.id,
          date: today,
          bmr: targets.bmr,
          tdee: targets.tdee,
          calories: targets.calories,
          protein_g: targets.proteinG,
          fats_g: targets.fatsG,
          carbs_g: targets.carbsG
        }]);

      if (targetsError) throw targetsError;

      toast({
        title: "Profile created!",
        description: "Welcome to CoachOS. Let's start tracking!"
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fullName || !formData.age || !formData.heightCm)) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    if (step === 2 && (!formData.currentWeight || !formData.targetWeight)) {
      toast({
        title: "Missing information",
        description: "Please fill in your weights",
        variant: "destructive"
      });
      return;
    }
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Set up your profile</h1>
          <p className="text-muted-foreground mt-2">
            Step {step} of 2
          </p>
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-border/50">
          {step === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>About You</CardTitle>
                </div>
                <CardDescription>
                  Tell us about yourself so we can calculate your targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="30"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedentary">Sedentary (office job)</SelectItem>
                      <SelectItem value="Lightly Active">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="Moderately Active">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="Very Active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="Athlete">Athlete (2x/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle>Your Goals</CardTitle>
                </div>
                <CardDescription>
                  Set your weight goals and we'll calculate your daily targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goalType">Goal Type</Label>
                  <Select value={formData.goalType} onValueChange={(value) => setFormData({ ...formData, goalType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fat Loss">Fat Loss</SelectItem>
                      <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                      <SelectItem value="Body Recomposition">Body Recomposition</SelectItem>
                      <SelectItem value="Maintain">Maintain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                    <Input
                      id="currentWeight"
                      type="number"
                      step="0.1"
                      placeholder="75.0"
                      value={formData.currentWeight}
                      onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      step="0.1"
                      placeholder="70.0"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    />
                  </div>
                </div>

                {formData.currentWeight && formData.targetWeight && (
                  <div className="p-4 rounded-lg bg-success-light border border-success/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                      <TrendingDown className="w-4 h-4" />
                      Your Targets
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Daily Calories</p>
                        <p className="font-semibold">{calculateTargets().calories} kcal</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Protein</p>
                        <p className="font-semibold">{calculateTargets().proteinG}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fats</p>
                        <p className="font-semibold">{calculateTargets().fatsG}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Carbs</p>
                        <p className="font-semibold">{calculateTargets().carbsG}g</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          <div className="px-6 pb-6 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={nextStep}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {loading ? "Setting up..." : step === 2 ? "Complete Setup" : "Continue"}
              {step < 2 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Target, TrendingUp, Zap, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow mb-6 shadow-xl">
          <Activity className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
          Your Health, One Platform
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          CoachOS is your unified accountability system. Track nutrition, workouts, fasting, and sleep - all in one place.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-8 shadow-lg"
          >
            Get Started Free
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate("/auth")}
            className="text-lg px-8"
          >
            Sign In
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to succeed
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Target,
              title: "Smart Goals",
              description: "AI-calculated calories and macros based on your body and goals"
            },
            {
              icon: TrendingUp,
              title: "Daily Compliance",
              description: "See your accountability score and stay on track every day"
            },
            {
              icon: Zap,
              title: "Unified Tracking",
              description: "Food, workouts, fasting, sleep - all working together"
            },
            {
              icon: CheckCircle,
              title: "Progressive Plans",
              description: "Workouts that adapt and push you to the next level"
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary-glow/10 to-primary/10 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to take control?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands tracking their health with CoachOS
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-12 shadow-xl"
          >
            Start Your Journey
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

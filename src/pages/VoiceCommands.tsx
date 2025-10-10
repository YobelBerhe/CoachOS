import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import VoiceInput from '@/components/VoiceInput';
import { voiceService } from '@/services/voiceService';
import {
  ArrowLeft,
  Mic,
  Camera,
  ShoppingCart,
  Leaf,
  Utensils,
  Moon,
  Dumbbell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoiceCommands() {
  const navigate = useNavigate();

  function handleCommand(text: string) {
    const lower = text.toLowerCase();

    // Navigation commands
    if (lower.includes('scan') || lower.includes('barcode')) {
      voiceService.speak("Opening barcode scanner");
      navigate('/barcode-scanner');
    } else if (lower.includes('shopping list') || lower.includes('shop')) {
      voiceService.speak("Opening shopping list");
      navigate('/shopping-list');
    } else if (lower.includes('food waste') || lower.includes('fridge')) {
      voiceService.speak("Opening food waste tracker");
      navigate('/food-waste');
    } else if (lower.includes('menu') || lower.includes('restaurant')) {
      voiceService.speak("Opening menu scanner");
      navigate('/menu-scanner');
    } else if (lower.includes('meal swap') || lower.includes('swap')) {
      voiceService.speak("Opening meal swap marketplace");
      navigate('/meal-swap');
    } else if (lower.includes('sleep') || lower.includes('track sleep')) {
      voiceService.speak("Opening sleep tracker");
      navigate('/sleep');
    } else if (lower.includes('workout') || lower.includes('train')) {
      voiceService.speak("Opening workout tracker");
      navigate('/train');
    } else {
      voiceService.speak("I didn't understand that command. Try saying: Open shopping list, or Scan barcode");
    }
  }

  const commands = [
    { icon: Camera, text: "Scan barcode", color: "text-purple-500" },
    { icon: ShoppingCart, text: "Open shopping list", color: "text-green-500" },
    { icon: Leaf, text: "Check food waste", color: "text-emerald-500" },
    { icon: Utensils, text: "Scan menu", color: "text-orange-500" },
    { icon: Moon, text: "Track sleep", color: "text-blue-500" },
    { icon: Dumbbell, text: "Log workout", color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Mic className="w-6 h-6 text-blue-500" />
                Voice Commands
              </h1>
              <p className="text-sm text-muted-foreground">
                Control the app with your voice
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Voice Input */}
        <VoiceInput
          onResult={handleCommand}
          placeholder="Say a command..."
          autoSpeak="Voice commands ready! Tell me what you want to do."
        />

        {/* Available Commands */}
        <Card className="border-0 shadow-lg mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Available Commands</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                  onClick={() => {
                    voiceService.speak(cmd.text);
                    handleCommand(cmd.text);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <cmd.icon className={`w-6 h-6 ${cmd.color}`} />
                    <span className="font-semibold">"{cmd.text}"</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-0 shadow-lg mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3">💡 Voice Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Speak clearly and naturally</li>
              <li>✅ Use simple commands</li>
              <li>✅ Wait for the beep before speaking</li>
              <li>✅ Works best in quiet environments</li>
              <li>✅ Commands work in any language (coming soon)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VoiceInput from '@/components/VoiceInput';
import { Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { voiceService } from '@/services/voiceService';

export default function VoiceSleepTracker() {
  const { toast } = useToast();
  const [sleepData, setSleepData] = useState({
    bedTime: '',
    wakeTime: '',
    quality: ''
  });
  const [useVoice, setUseVoice] = useState(false);

  function parseSleepInput(text: string) {
    const lowerText = text.toLowerCase();
    
    // Parse bed time
    const bedTimeMatch = lowerText.match(/sleep (?:from|at) (\d+(?::\d+)?\s*(?:am|pm)?)/i) ||
                         lowerText.match(/bed (?:at|by) (\d+(?::\d+)?\s*(?:am|pm)?)/i);
    
    // Parse wake time
    const wakeTimeMatch = lowerText.match(/(?:to|until|wake (?:up )?at) (\d+(?::\d+)?\s*(?:am|pm)?)/i);
    
    // Parse quality
    let quality = '';
    if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('well')) {
      quality = 'good';
    } else if (lowerText.includes('bad') || lowerText.includes('poor') || lowerText.includes('terrible')) {
      quality = 'poor';
    } else if (lowerText.includes('okay') || lowerText.includes('fine') || lowerText.includes('decent')) {
      quality = 'okay';
    }

    return {
      bedTime: bedTimeMatch ? bedTimeMatch[1] : '',
      wakeTime: wakeTimeMatch ? wakeTimeMatch[1] : '',
      quality
    };
  }

  function handleVoiceInput(text: string) {
    const parsed = parseSleepInput(text);
    
    if (parsed.bedTime || parsed.wakeTime) {
      setSleepData({
        bedTime: parsed.bedTime,
        wakeTime: parsed.wakeTime,
        quality: parsed.quality
      });

      // Voice confirmation
      voiceService.speak(
        `Got it! You slept from ${parsed.bedTime} to ${parsed.wakeTime}. ${
          parsed.quality ? `And you slept ${parsed.quality}.` : ''
        }`
      );

      toast({
        title: "Sleep tracked! 😴",
        description: `${parsed.bedTime} to ${parsed.wakeTime}`
      });
    } else {
      voiceService.speak("I didn't catch your sleep times. Could you try again?");
    }
  }

  return (
    <div className="space-y-6">
      {/* Toggle Voice Mode */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Track Sleep</h3>
        <Button
          variant={useVoice ? 'default' : 'outline'}
          onClick={() => setUseVoice(!useVoice)}
          className="gap-2"
        >
          {useVoice ? '🎤 Voice Mode' : '⌨️ Type Mode'}
        </Button>
      </div>

      {useVoice ? (
        /* VOICE INPUT MODE */
        <VoiceInput
          onResult={handleVoiceInput}
          placeholder="Say: 'I slept from 11pm to 7am and it was good'"
          autoSpeak="Hi! Tell me about your sleep. For example, say: I slept from 10pm to 6am."
        />
      ) : (
        /* MANUAL INPUT MODE */
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Bed Time</Label>
              <div className="relative mt-2">
                <Moon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={sleepData.bedTime}
                  onChange={(e) => setSleepData({ ...sleepData, bedTime: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Wake Time</Label>
              <div className="relative mt-2">
                <Sun className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={sleepData.wakeTime}
                  onChange={(e) => setSleepData({ ...sleepData, wakeTime: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <Button className="w-full">Save Sleep Data</Button>
          </CardContent>
        </Card>
      )}

      {/* Example Phrases */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-2">💬 Example voice commands:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• "I slept from 11pm to 7am and it was good"</p>
            <p>• "My sleep was from 10:30pm to 6:30am, it was okay"</p>
            <p>• "Went to bed at 9pm, woke up at 5am, slept great"</p>
            <p>• "Sleep from 8pm to 7am, quality was poor"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

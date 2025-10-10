import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { voiceService } from '@/services/voiceService';
import { Volume2 } from 'lucide-react';

export default function VoiceSettings() {
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  });

  useEffect(() => {
    // Load settings
    const saved = localStorage.getItem('voiceSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  function updateSetting(key: string, value: any) {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
  }

  function testVoice() {
    voiceService.speak("This is how I sound with your current settings", {
      rate: settings.rate,
      pitch: settings.pitch,
      volume: settings.volume
    });
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Settings
        </h3>

        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Enable Voice</Label>
            <p className="text-sm text-muted-foreground">
              App will speak to you
            </p>
          </div>
          <Switch
            checked={settings.voiceEnabled}
            onCheckedChange={(v) => updateSetting('voiceEnabled', v)}
          />
        </div>

        {settings.voiceEnabled && (
          <>
            {/* Speed */}
            <div>
              <Label className="mb-2 block">Speed: {settings.rate.toFixed(1)}x</Label>
              <Slider
                value={[settings.rate]}
                onValueChange={([v]) => updateSetting('rate', v)}
                min={0.5}
                max={2.0}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>

            {/* Pitch */}
            <div>
              <Label className="mb-2 block">Pitch: {settings.pitch.toFixed(1)}</Label>
              <Slider
                value={[settings.pitch]}
                onValueChange={([v]) => updateSetting('pitch', v)}
                min={0.5}
                max={2.0}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <Label className="mb-2 block">Volume: {Math.round(settings.volume * 100)}%</Label>
              <Slider
                value={[settings.volume]}
                onValueChange={([v]) => updateSetting('volume', v)}
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            {/* Test Button */}
            <Button onClick={testVoice} className="w-full">
              <Volume2 className="w-4 h-4 mr-2" />
              Test Voice
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

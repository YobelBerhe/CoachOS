import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { voiceService } from '@/services/voiceService';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  autoSpeak?: string;
  showVisualizer?: boolean;
}

export default function VoiceInput({ 
  onResult, 
  placeholder = "Tap mic to speak...",
  autoSpeak,
  showVisualizer = true 
}: VoiceInputProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [support, setSupport] = useState({ speech: false, recognition: false });

  useEffect(() => {
    const supported = voiceService.isSupported();
    setSupport(supported);

    // Auto-speak greeting
    if (autoSpeak && supported.speech && voiceEnabled) {
      speakText(autoSpeak);
    }
  }, [autoSpeak]);

  async function speakText(text: string) {
    if (!support.speech || !voiceEnabled) return;
    
    setIsSpeaking(true);
    try {
      await voiceService.speak(text);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }

  async function startListening() {
    if (!support.recognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    
    try {
      // Give audio feedback
      if (voiceEnabled) {
        await voiceService.speak("I'm listening", { rate: 1.2 });
      }

      const result = await voiceService.listen();
      setTranscript(result);
      onResult(result);

      // Confirm what was heard
      if (voiceEnabled) {
        await voiceService.speak(`Got it. You said: ${result.substring(0, 50)}`);
      }

      toast({
        title: "Voice captured! 🎤",
        description: result.substring(0, 100)
      });

    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: "Couldn't hear you",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsListening(false);
    }
  }

  function stopListening() {
    voiceService.stopListening();
    setIsListening(false);
  }

  function toggleVoice() {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  }

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Voice Assistant</p>
              <p className="text-xs text-muted-foreground">
                {isListening ? "Listening..." : 
                 isSpeaking ? "Speaking..." : 
                 placeholder}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className="rounded-full"
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>

              {/* Mic Button */}
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={!support.recognition}
                className={`rounded-full w-16 h-16 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Transcript Display */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg bg-secondary"
              >
                <p className="text-sm">📝 {transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visual Feedback */}
          {showVisualizer && isListening && (
            <motion.div className="mt-3 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full"
                  animate={{
                    height: [8, 24, 8],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Browser Support Info */}
          {(!support.speech || !support.recognition) && (
            <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {!support.speech && "🔇 Voice output not supported. "}
                {!support.recognition && "🎤 Voice input not supported. "}
                Try Chrome or Edge for best experience.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

class VoiceService {
  private synthesis: SpeechSynthesis;
  private recognition: any;
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize voices
    if (this.synthesis) {
      this.loadVoices();
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  // TEXT-TO-SPEECH: Make app talk
  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
  }) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;

    // Select voice (prefer female voice for friendliness)
    if (options?.voice) {
      const selectedVoice = this.voices.find(v => v.name === options.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    } else {
      // Default to a pleasant voice
      const preferredVoice = this.voices.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Samantha') ||
        v.name.includes('Female')
      );
      if (preferredVoice) utterance.voice = preferredVoice;
    }

    // Speak!
    this.synthesis.speak(utterance);

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
    });
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // SPEECH-TO-TEXT: Listen to user
  async listen(): Promise<string> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.isListening = true;
      this.recognition.start();
    });
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if listening
  getIsListening() {
    return this.isListening;
  }

  // Contextual greetings
  getGreeting(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Good morning! Ready to crush your goals today?";
    } else if (hour < 17) {
      return "Good afternoon! Let's keep that momentum going!";
    } else if (hour < 21) {
      return "Good evening! Time to refuel and recover!";
    } else {
      return "Good night! Don't forget to prep for tomorrow!";
    }
  }

  // Motivational messages
  getMotivation(): string {
    const messages = [
      "You're doing amazing! Keep it up!",
      "Every healthy choice counts!",
      "Your future self will thank you!",
      "Progress, not perfection!",
      "You've got this, champion!",
      "Small steps lead to big changes!",
      "Believe in yourself!",
      "You're stronger than you think!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Celebration sounds
  celebrate() {
    this.speak("Awesome job! You're on fire!", { rate: 1.1, pitch: 1.2 });
  }

  // Warning sounds
  warn(message: string) {
    this.speak(`Heads up! ${message}`, { rate: 0.9, pitch: 0.9 });
  }

  // Check browser support
  isSupported() {
    return {
      speech: 'speechSynthesis' in window,
      recognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    };
  }
}

export const voiceService = new VoiceService();

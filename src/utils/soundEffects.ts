// Sound effect URLs (free sound effects)
const SOUNDS = {
  approved: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  warning: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3',
  checkOff: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled: boolean = true;

  constructor() {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.3;
      this.sounds[key] = audio;
    });

    // Check user preference
    const preference = localStorage.getItem('soundEffectsEnabled');
    this.enabled = preference !== 'false';
  }

  play(soundName: keyof typeof SOUNDS) {
    if (!this.enabled) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Sound play failed:', err));
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEffectsEnabled', this.enabled.toString());
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();

/**
 * Audio Prompts & Voice Feedback
 * Speaks in Marathi (mr-IN), Hindi (hi-IN), or English.
 * Also generates audio chime sound effects using Web Audio API.
 */

class AudioPromptManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.12); // E5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1046.50, now + 0.12); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.12);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn("Web Audio chime failed", e);
    }
  }

  playAlertChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.setValueAtTime(250, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn("Web Audio chime failed", e);
    }
  }

  speak(text, lang = 'mr') {
    if (!this.synth || !text) return;
    try {
      this.synth.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clear regional comprehension
      utterance.pitch = 1.0;

      // Select voice if available
      const voices = this.synth.getVoices();
      const targetLang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      const matchedVoice = voices.find(v => v.lang.startsWith(targetLang) || v.lang.startsWith(lang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.lang = targetLang;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error", err);
    }
  }
}

export const audioPrompts = new AudioPromptManager();


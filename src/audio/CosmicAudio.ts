/**
 * Procedural Web Audio API soundscape for the cosmic experience.
 * Generates an ambient space drone, ethereal chords, gravitational rumble,
 * and celestial harmonics with zero external audio assets.
 */

import { RealmType } from '../types/cosmic';

export class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private rumbleGain: GainNode | null = null;
  private chordGain: GainNode | null = null;
  private windGain: GainNode | null = null;

  // Oscillators and filters
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private rumbleFilter: BiquadFilterNode | null = null;
  private chordOscs: OscillatorNode[] = [];
  private chimeTimer: number | null = null;
  private currentRealm: RealmType = 'aurum';

  constructor() {
    // Initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Deep Sub-bass Drone
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.droneFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(43.65, this.ctx.currentTime); // F1

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(43.65 * 1.5, this.ctx.currentTime); // Perfect fifth C2

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // LFO to slowly sweep the drone filter
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12 second cycle
      lfoGain.gain.setValueAtTime(35, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(this.droneFilter.frequency);
      lfo.start();

      // 2. Gravitational Rumble (Noise + lowpass)
      this.setupGravitationalRumble();

      // 3. Ethereal Synth Chords
      this.setupEtherealChords();

      // 4. Cosmic Wind Generator
      this.setupCosmicWind();

      // 5. Celestial Chimes scheduler
      this.startCelestialChimes();

    } catch (e) {
      console.warn('Web Audio not supported or failed to initialize', e);
    }
  }

  private setupGravitationalRumble() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    // Brown noise for deep planetary rumble
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.rumbleFilter = this.ctx.createBiquadFilter();
    this.rumbleFilter.type = 'lowpass';
    this.rumbleFilter.frequency.setValueAtTime(65, this.ctx.currentTime);

    this.rumbleGain = this.ctx.createGain();
    this.rumbleGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(this.rumbleFilter);
    this.rumbleFilter.connect(this.rumbleGain);
    this.rumbleGain.connect(this.masterGain);

    whiteNoise.start();
  }

  private setupEtherealChords() {
    if (!this.ctx || !this.masterGain) return;

    this.chordGain = this.ctx.createGain();
    this.chordGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    const chordFilter = this.ctx.createBiquadFilter();
    chordFilter.type = 'bandpass';
    chordFilter.frequency.setValueAtTime(440, this.ctx.currentTime);
    chordFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Warm interstellar chord: F, C, Eb, G
    const frequencies = [174.61, 261.63, 311.13, 392.0];
    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        pan.pan.setValueAtTime((idx / (frequencies.length - 1)) * 1.4 - 0.7, this.ctx.currentTime);
        osc.connect(pan);
        pan.connect(chordFilter);
      } else {
        osc.connect(chordFilter);
      }

      osc.start();
      this.chordOscs.push(osc);
    });

    chordFilter.connect(this.chordGain);
    this.chordGain.connect(this.masterGain);
  }

  private setupCosmicWind() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    // Gentle wind sweep
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.05, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();

    noise.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    noise.start();
  }

  private startCelestialChimes() {
    const playChime = () => {
      if (!this.ctx || !this.masterGain || this.isMuted) {
        this.chimeTimer = window.setTimeout(playChime, 4000);
        return;
      }

      const freqs = this.currentRealm === 'aurum'
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5, E5, G5, C6, E6 (warm golden)
        : [587.33, 739.99, 880.00, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6 (mystic violet)

      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.3);

      const nextDelay = 2500 + Math.random() * 4500;
      this.chimeTimer = window.setTimeout(playChime, nextDelay);
    };

    this.chimeTimer = window.setTimeout(playChime, 3000);
  }

  public setRealm(realm: RealmType) {
    this.currentRealm = realm;
    if (!this.ctx || !this.droneOsc1 || !this.droneOsc2 || !this.chordOscs.length) return;

    const now = this.ctx.currentTime;
    if (realm === 'aurum') {
      // Warm, grounded F / C base
      this.droneOsc1.frequency.setTargetAtTime(43.65, now, 1.2);
      this.droneOsc2.frequency.setTargetAtTime(65.48, now, 1.2);
      if (this.droneFilter) {
        this.droneFilter.frequency.setTargetAtTime(110, now, 1.0);
      }
      const aurumChords = [174.61, 261.63, 311.13, 392.0];
      this.chordOscs.forEach((osc, idx) => {
        osc.frequency.setTargetAtTime(aurumChords[idx] || 220, now, 1.5);
      });
    } else {
      // Ethereal, mysterious D / A base for Viola
      this.droneOsc1.frequency.setTargetAtTime(36.71, now, 1.2); // D1
      this.droneOsc2.frequency.setTargetAtTime(55.00, now, 1.2); // A1
      if (this.droneFilter) {
        this.droneFilter.frequency.setTargetAtTime(140, now, 1.0);
      }
      const violaChords = [146.83, 220.00, 293.66, 369.99]; // D minor/major9
      this.chordOscs.forEach((osc, idx) => {
        osc.frequency.setTargetAtTime(violaChords[idx] || 220, now, 1.5);
      });
    }
  }

  public updateProximityRumble(distanceToBlackHole: number) {
    if (!this.ctx || !this.rumbleGain || !this.rumbleFilter) return;
    // Distance typically ranges from 15 (near) to 90 (far)
    const factor = Math.max(0, Math.min(1, 1 - (distanceToBlackHole - 12) / 60));
    const targetGain = 0.1 + factor * 0.45;
    const targetFreq = 45 + factor * 130;
    this.rumbleGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
    this.rumbleFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
  }

  public toggleMute(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      if (this.isMuted) {
        this.masterGain.gain.setTargetAtTime(0, now, 0.4);
      } else {
        this.masterGain.gain.setTargetAtTime(0.7, now, 0.5);
      }
    }
    return !this.isMuted;
  }

  public setVolume(vol: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.1);
  }

  public isAudioActive(): boolean {
    return !this.isMuted;
  }

  public dispose() {
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const cosmicAudio = new CosmicAudioEngine();

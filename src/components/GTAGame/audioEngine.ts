/**
 * Procedural Web Audio API sound and music synthesizer for GTA Los Werkos.
 * Generates all vehicle engines, gunshots, sirens, crashes, and in-game radio channels.
 */

import { WeaponType } from './types';

class GTAAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private radioVolume: number = 0.35;
  private sfxVolume: number = 0.5;

  // Engine sound state
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  // Siren sound state
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenActive: boolean = false;

  // Radio state
  private currentStationIndex: number = 0;
  private radioPlaying: boolean = false;
  private radioInterval: any = null;
  private radioStep: number = 0;

  public stations = [
    { id: 'off', name: 'Radio Uit', genre: 'Stilte', freq: '---' },
    { id: 'loswerkos', name: 'Los Werkos Beat FM', genre: 'West Coast Beats & Synth', freq: '101.4 FM' },
    { id: 'vice', name: 'Vice City 84', genre: 'Retro Synthwave & Electro', freq: '98.7 FM' },
    { id: 'rock', name: 'Channel X Rock', genre: 'Heavy Overdrive & Pumping Bass', freq: '106.1 FM' },
  ];

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.initCtx();
    return this.ctx;
  }

  // --- ENGINE SYNTHESIS ---
  public updateEngineSound(inCar: boolean, speed: number, maxSpeed: number, isAccelerating: boolean) {
    if (this.isMuted) {
      this.stopEngine();
      return;
    }
    this.initCtx();
    if (!this.ctx) return;

    if (!inCar) {
      this.stopEngine();
      return;
    }

    if (!this.engineOsc) {
      try {
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();
        this.engineFilter = this.ctx.createBiquadFilter ? this.ctx.createBiquadFilter() : null;

        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

        if (this.engineFilter) {
          this.engineFilter.type = 'lowpass';
          this.engineFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
          this.engineOsc.connect(this.engineFilter);
          this.engineFilter.connect(this.engineGain);
        } else {
          this.engineOsc.connect(this.engineGain);
        }

        this.engineGain.connect(this.ctx.destination);
        this.engineGain.gain.setValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime);
        this.engineOsc.start();
      } catch (e) {
        // AudioContext policy
      }
    }

    if (this.engineOsc && this.engineGain && this.ctx) {
      const speedRatio = Math.min(1, Math.abs(speed) / (maxSpeed || 8));
      const targetFreq = 40 + speedRatio * 90 + (isAccelerating ? 25 : 0);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);

      if (this.engineFilter) {
        const filterFreq = 260 + speedRatio * 450 + (isAccelerating ? 150 : 0);
        this.engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.08);
      }

      const targetGain = (0.05 + speedRatio * 0.08) * this.sfxVolume;
      this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
      this.engineGain = null;
      this.engineFilter = null;
    }
  }

  // --- TIRE SCREECH ---
  public tireScreech() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  // --- CRASH / IMPACT ---
  public crash(intensity: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const dur = Math.min(0.4, 0.2 + intensity * 0.15);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + dur);

      gain.gain.setValueAtTime(Math.min(0.4, 0.2 * intensity) * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + dur);

      // Noise impact crunch
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      noise.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // --- GUNSHOTS ---
  public gunshot(weapon: WeaponType) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (weapon === 'sniper') {
      this.sniperShot();
      return;
    }
    if (weapon === 'grenade') {
      this.grenadeBounce();
      return;
    }

    const now = this.ctx.currentTime;

    try {
      if (weapon === 'fist') {
        // Punch thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.12);
        return;
      }

      if (weapon === 'pistol' || weapon === 'smg') {
        const dur = weapon === 'pistol' ? 0.14 : 0.08;
        // High click transient
        const click = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        click.type = 'sawtooth';
        click.frequency.setValueAtTime(900, now);
        click.frequency.exponentialRampToValueAtTime(80, now + dur);
        cGain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        cGain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        click.connect(cGain);
        cGain.connect(this.ctx.destination);
        click.start();
        click.stop(now + dur);

        // Noise crack
        const bSize = Math.floor(this.ctx.sampleRate * dur);
        const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = buf;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        nSrc.connect(nGain);
        nGain.connect(this.ctx.destination);
        nSrc.start();
      } else if (weapon === 'shotgun') {
        // Boom blast
        const dur = 0.28;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + dur);
        gain.gain.setValueAtTime(0.45 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + dur);

        // Loud noise
        const bSize = Math.floor(this.ctx.sampleRate * dur);
        const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = buf;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        nSrc.connect(nGain);
        nGain.connect(this.ctx.destination);
        nSrc.start();
      } else if (weapon === 'rpg') {
        // Huge missile whoosh + launch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.35);
        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.35);
      }
    } catch (e) {}
  }

  // --- EXPLOSION ---
  public explosion(scale: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const dur = Math.min(1.5, 0.8 * scale);

      // Deep sub boom
      const sub = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(25, now + dur);
      sGain.gain.setValueAtTime(Math.min(1.0, 0.6 * scale) * this.sfxVolume, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      sub.connect(sGain);
      sGain.connect(this.ctx.destination);
      sub.start();
      sub.stop(now + dur);

      // Lowpass filtered noise blast
      const bSize = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;

      const nSrc = this.ctx.createBufferSource();
      nSrc.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      nSrc.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);
      nSrc.start();
    } catch (e) {}
  }

  // --- POLICE SIREN ---
  public setPoliceSiren(active: boolean) {
    if (this.isMuted || !active) {
      if (this.sirenOsc) {
        try {
          this.sirenOsc.stop();
          this.sirenOsc.disconnect();
        } catch (e) {}
        this.sirenOsc = null;
        this.sirenGain = null;
      }
      this.sirenActive = false;
      return;
    }

    if (this.sirenActive && this.sirenOsc) return;

    this.initCtx();
    if (!this.ctx) return;

    try {
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc.type = 'sine';
      const now = this.ctx.currentTime;
      // Wailing siren LFO effect
      this.sirenOsc.frequency.setValueAtTime(600, now);

      // Modulate frequency
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(1.2, now); // cycle speed
      lfoGain.gain.setValueAtTime(250, now); // variation range (600 +- 250 Hz)
      lfo.connect(this.sirenOsc.frequency);
      lfo.start();

      this.sirenGain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);
      this.sirenOsc.start();
      this.sirenActive = true;
    } catch (e) {}
  }

  // --- CAR HORN ---
  public horn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(370, now);
      osc2.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }

  // --- CASH PICKUP ---
  public cashPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
    } catch (e) {}
  }

  // --- EAT BURGER / RESTORE HEALTH ---
  public eatBurger() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // Major chord A C# E A
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch (e) {}
  }

  // --- WASTED (DEATH) SOUND ---
  public wastedSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Dramatic slow descending minor chord
      const chords = [
        [220, 261.63, 311.13], // A minor-dim
        [196, 233.08, 293.66],
        [164.81, 196, 246.94]
      ];

      chords.forEach((chord, cIdx) => {
        const time = now + cIdx * 0.6;
        chord.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, time);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.8, time + 0.8);

          const filter = this.ctx!.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, time);
          filter.frequency.exponentialRampToValueAtTime(150, time + 0.8);

          gain.gain.setValueAtTime(0.18 * this.sfxVolume, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(time);
          osc.stop(time + 0.9);
        });
      });
    } catch (e) {}
  }

  // --- IN-GAME PROCEDURAL RADIO STATIONS ---
  public cycleRadioStation(): string {
    this.currentStationIndex = (this.currentStationIndex + 1) % this.stations.length;
    this.startRadio();
    return this.getCurrentStation().name;
  }

  public getCurrentStation() {
    return this.stations[this.currentStationIndex];
  }

  public setStation(index: number) {
    this.currentStationIndex = Math.max(0, Math.min(this.stations.length - 1, index));
    this.startRadio();
  }

  public startRadio() {
    this.stopRadio();
    const station = this.stations[this.currentStationIndex];
    if (station.id === 'off' || this.isMuted) return;

    this.initCtx();
    if (!this.ctx) return;

    this.radioPlaying = true;
    this.radioStep = 0;

    // Beats interval: 130ms per step (approx 115-125 BPM)
    const tempoMs = station.id === 'vice' ? 120 : station.id === 'loswerkos' ? 140 : 130;

    this.radioInterval = setInterval(() => {
      if (!this.radioPlaying || !this.ctx || this.isMuted) return;
      this.playRadioStep(station.id, this.radioStep);
      this.radioStep = (this.radioStep + 1) % 16;
    }, tempoMs);
  }

  private playRadioStep(stationId: string, step: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    try {
      if (stationId === 'loswerkos') {
        // Hip-hop / G-Funk: 808 sub kick on 0, 8, 10; Snare/clap on 4, 12; Hihat on evens; Synth lead
        if (step === 0 || step === 8 || step === 10) {
          // 808 Kick
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.frequency.setValueAtTime(130, now);
          osc.frequency.exponentialRampToValueAtTime(38, now + 0.18);
          gain.gain.setValueAtTime(0.3 * this.radioVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(now + 0.22);
        }
        if (step === 4 || step === 12) {
          // Snare
          const bSize = Math.floor(this.ctx.sampleRate * 0.1);
          const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.18 * this.radioVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          src.connect(gain);
          gain.connect(this.ctx.destination);
          src.start();
        }
        // G-funk lead whistle on specific steps
        if (step === 0 || step === 3 || step === 6 || step === 11) {
          const notes = [659.25, 783.99, 880, 987.77];
          const freq = notes[step % notes.length];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08 * this.radioVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(now + 0.2);
        }
      } else if (stationId === 'vice') {
        // Synthwave 80s: driving 16th bass arpeggio + four-on-the-floor kick
        if (step % 4 === 0) {
          // Punchy synth kick
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
          gain.gain.setValueAtTime(0.28 * this.radioVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(now + 0.14);
        }
        // Synth bass arp
        const bassNotes = [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 110];
        const freq = bassNotes[step % bassNotes.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(freq, now);
        bGain.gain.setValueAtTime(0.12 * this.radioVolume, now);
        bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start();
        bOsc.stop(now + 0.11);
      } else if (stationId === 'rock') {
        // Hard Rock riff
        if (step % 4 === 0 || step === 10) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(82.41, now); // E2 power chord
          gain.gain.setValueAtTime(0.22 * this.radioVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(now + 0.2);
        }
      }
    } catch (e) {}
  }

  public stopRadio() {
    this.radioPlaying = false;
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
  }

  // --- REALISTIC FX EXTENSIONS ---
  public policeDispatchRadio() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Radio squelch / static burst
      const bufSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(4, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // 2. Double radio chirp beep (roger beep)
      const beep = this.ctx.createOscillator();
      const beepGain = this.ctx.createGain();
      beep.type = 'sine';
      beep.frequency.setValueAtTime(1600, now + 0.15);
      beep.frequency.setValueAtTime(2100, now + 0.22);
      beepGain.gain.setValueAtTime(0.06 * this.sfxVolume, now + 0.15);
      beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      beep.connect(beepGain);
      beepGain.connect(this.ctx.destination);
      beep.start(now + 0.15);
      beep.stop(now + 0.28);
    } catch (e) {}
  }

  public glassShatter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(3200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(hp);
      hp.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // High glass resonant ring
      const osc = this.ctx.createOscillator();
      const oGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4800, now);
      oGain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
      oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(oGain);
      oGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  public waterHydrantSpray() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1400, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(lp);
      lp.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  public weaponReload() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Metallic magazine eject click
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain1.gain.setValueAtTime(0.18 * this.sfxVolume, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Slide rack back clack
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(900, now + 0.22);
      osc2.frequency.setValueAtTime(1600, now + 0.26);
      gain2.gain.setValueAtTime(0.2 * this.sfxVolume, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  public sniperShot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // High sonic crack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);
      gain.gain.setValueAtTime(0.45 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);

      // Reverb blast
      this.explosion(0.6);
    } catch (e) {}
  }

  public grenadeBounce() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  public phoneRing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.setValueAtTime(1100, now + 0.1);
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  public nextRadioStation(): string {
    return this.cycleRadioStation();
  }

  public carDoor() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Handle latch click
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(420, now);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.05);
      gain1.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Heavy door slam thud
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(160, now + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(40, now + 0.22);
      gain2.gain.setValueAtTime(0.4 * this.sfxVolume, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.22);
    } catch (e) {}
  }

  // --- CAR HORN ---
  public carHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const dur = 0.28;
      // Dual tone car horn
      [420, 520].forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        // Slight vibrato
        osc.frequency.linearRampToValueAtTime(freq + 4, now + dur);

        gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + dur);
      });
    } catch (e) {}
  }

  // --- UNSTUCK SOUND ---
  public unstuckSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // --- WATER SPLASH ---
  public splash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopEngine();
      this.setPoliceSiren(false);
      this.stopRadio();
    } else {
      this.startRadio();
    }
  }

  public isSoundMuted() {
    return this.isMuted;
  }
}

export const gtaAudio = new GTAAudioEngine();

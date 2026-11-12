import Phaser from 'phaser';

export class AudioSystem {
    constructor() {
        this.context = null;
        this.enabled = localStorage.getItem('phoenix-blaze-audio') !== 'off';
    }

    unlock() {
        if (!this.enabled || typeof window === 'undefined') return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass && !this.context) this.context = new AudioContextClass();
        if (this.context?.state === 'suspended') this.context.resume();
    }

    play(cue = 'ui') {
        this.unlock();
        if (!this.context || !this.enabled) return;
        const frequencies = { ui: 440, hit: 115, calm: 330, discover: 660 };
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = cue === 'hit' ? 'sawtooth' : 'sine';
        oscillator.frequency.value = frequencies[cue] || frequencies.ui;
        gain.gain.setValueAtTime(0.06, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.16);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.16);
    }

    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        localStorage.setItem('phoenix-blaze-audio', this.enabled ? 'on' : 'off');
    }

    destroy() {
        if (this.context && this.context.state !== 'closed') this.context.close();
    }
}

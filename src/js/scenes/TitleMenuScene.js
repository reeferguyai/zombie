import Phaser from 'phaser';
import PlayerDataManager from '../managers/PlayerDataManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class TitleMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleMenuScene' });
        this.difficulty = localStorage.getItem('phoenix-blaze-difficulty') || 'normal';
        this.saveSystem = new SaveSystem();
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#080d09');
        this.add.rectangle(width / 2, height / 2, width, height, 0x101a12);
        this.add.circle(width * 0.76, height * 0.35, 145, 0x7d241b, 0.22);
        this.add.circle(width * 0.76, height * 0.35, 90, 0xe94e20, 0.2);
        this.add.text(width / 2, height * 0.15, 'PHOENIX BLAZE', {
            font: 'bold 58px Arial', fill: '#ff5a24', stroke: '#080808', strokeThickness: 7
        }).setOrigin(0.5);
        this.add.text(width / 2, height * 0.24, 'RISE FROM THE DEAD. KEEP YOUR HUMANITY.', {
            font: '18px Arial', fill: '#d9e3d8'
        }).setOrigin(0.5);

        this.makeButton(width / 2, height * 0.39, 'NEW SURVIVOR', () => this.scene.start('CharacterCreationScene'), 280);
        this.makeButton(width / 2, height * 0.48, 'CONTINUE', () => this.continueGame(), 280, !this.saveSystem.hasSave());
        this.difficultyText = this.add.text(width / 2, height * 0.57, '', {
            font: 'bold 18px Arial', fill: '#f5f5e8', backgroundColor: '#17241a', padding: { x: 16, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.difficultyText.on('pointerdown', () => this.cycleDifficulty());
        this.updateDifficultyText();
        this.makeButton(width / 2, height * 0.67, 'OPTIONS', () => this.showOptions(), 280);
        this.makeButton(width / 2, height * 0.76, 'HOW TO PLAY', () => this.showNotice('WASD / arrows move • Space attack • E interact • C craft • M map • Esc pause'), 280);
        this.add.text(width / 2, height - 28, 'Difficulty affects enemy damage and survival pressure', {
            font: '13px Arial', fill: '#8a9b8c'
        }).setOrigin(0.5);
    }

    cycleDifficulty() {
        const levels = ['easy', 'normal', 'hard'];
        this.difficulty = levels[(levels.indexOf(this.difficulty) + 1) % levels.length];
        localStorage.setItem('phoenix-blaze-difficulty', this.difficulty);
        this.updateDifficultyText();
    }

    updateDifficultyText() {
        this.difficultyText.setText(`DIFFICULTY: ${this.difficulty.toUpperCase()}  ↻`);
    }

    makeButton(x, y, label, action, width = 250, disabled = false) {
        const bg = this.add.rectangle(x, y, width, 48, disabled ? 0x202520 : 0x17241a, 0.95)
            .setStrokeStyle(2, disabled ? 0x555555 : 0xff5a24);
        const text = this.add.text(x, y, label, {
            font: 'bold 17px Arial', fill: disabled ? '#777777' : '#f5f5e8'
        }).setOrigin(0.5);
        if (disabled) return;
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(0x293d2d));
        bg.on('pointerout', () => bg.setFillStyle(0x17241a));
        bg.on('pointerdown', action);
        text.setInteractive({ useHandCursor: true }).on('pointerdown', action);
    }

    showOptions() {
        const { width, height } = this.scale;
        const panel = this.add.container(0, 0);
        panel.add(this.add.rectangle(width / 2, height / 2, 560, 260, 0x101710, 0.98).setStrokeStyle(2, 0xff5a24));
        panel.add(this.add.text(width / 2, height / 2 - 75, 'OPTIONS', { font: 'bold 28px Arial', fill: '#ff7040' }).setOrigin(0.5));
        panel.add(this.add.text(width / 2, height / 2 - 22, 'Choose difficulty using the menu selector.', { font: '16px Arial', fill: '#e3e6dd' }).setOrigin(0.5));
        panel.add(this.add.text(width / 2, height / 2 + 20, 'Audio controls will be available when sound is added.', { font: '14px Arial', fill: '#aeb9aa' }).setOrigin(0.5));
        const close = this.add.text(width / 2, height / 2 + 82, 'CLOSE', { font: 'bold 17px Arial', fill: '#ffffff', backgroundColor: '#263628', padding: { x: 22, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => panel.destroy());
        panel.add(close);
    }

    continueGame() {
        const character = PlayerDataManager.getCharacter();
        if (!character) return this.showNotice('No survivor profile found. Create a new survivor first.');
        this.scene.start('GameScene', { characterData: character, loadSaved: true, difficulty: this.difficulty });
    }

    showNotice(message) {
        const { width, height } = this.scale;
        const note = this.add.text(width / 2, height * 0.88, message, {
            font: '16px Arial', fill: '#ffffff', backgroundColor: '#202820', padding: { x: 14, y: 10 },
            align: 'center', wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);
        this.time.delayedCall(4000, () => note.destroy());
    }
}

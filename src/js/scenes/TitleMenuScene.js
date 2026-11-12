import Phaser from 'phaser';
import PlayerDataManager from '../managers/PlayerDataManager.js';

export class TitleMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleMenuScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#080d09');
        this.add.rectangle(width / 2, height / 2, width, height, 0x101a12);
        this.add.circle(width * 0.76, height * 0.35, 145, 0x7d241b, 0.22);
        this.add.circle(width * 0.76, height * 0.35, 90, 0xe94e20, 0.2);
        this.add.text(width / 2, height * 0.2, 'PHOENIX BLAZE', {
            font: 'bold 58px Arial', fill: '#ff5a24', stroke: '#080808', strokeThickness: 7
        }).setOrigin(0.5);
        this.add.text(width / 2, height * 0.29, 'RISE FROM THE DEAD. KEEP YOUR HUMANITY.', {
            font: '18px Arial', fill: '#d9e3d8'
        }).setOrigin(0.5);

        this.makeButton(width / 2, height * 0.49, 'NEW SURVIVOR', () => {
            this.scene.start('CharacterCreationScene');
        });
        this.makeButton(width / 2, height * 0.59, 'CONTINUE', () => {
            const character = PlayerDataManager.getCharacter();
            if (character) this.scene.start('GameScene', { characterData: character, loadSaved: true });
            else this.showNotice('No survivor saved yet. Create a new survivor first.');
        });
        this.makeButton(width / 2, height * 0.69, 'HOW TO PLAY', () => {
            this.showNotice('WASD / arrows: move   •   Space: attack   •   E: interact   •   C: craft   •   M: map   •   Esc: pause');
        });
        this.add.text(width / 2, height - 34, 'A browser survival prototype • All art is generated in-game', {
            font: '14px Arial', fill: '#8a9b8c'
        }).setOrigin(0.5);
    }

    makeButton(x, y, label, action) {
        const bg = this.add.rectangle(x, y, 280, 54, 0x17241a, 0.95)
            .setStrokeStyle(2, 0xff5a24).setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, { font: 'bold 20px Arial', fill: '#f5f5e8' }).setOrigin(0.5);
        bg.on('pointerover', () => bg.setFillStyle(0x293d2d));
        bg.on('pointerout', () => bg.setFillStyle(0x17241a));
        bg.on('pointerdown', action);
        text.setInteractive({ useHandCursor: true }).on('pointerdown', action);
    }

    showNotice(message) {
        const { width, height } = this.scale;
        const note = this.add.text(width / 2, height * 0.83, message, {
            font: '16px Arial', fill: '#ffffff', backgroundColor: '#202820', padding: { x: 14, y: 10 },
            align: 'center', wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);
        this.time.delayedCall(4500, () => note.destroy());
    }
}

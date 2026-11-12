import Phaser from 'phaser';
import CharacterCreationScene from './scenes/CharacterCreationScene.js';
import { GameScene } from './scenes/GameScene.js';
import { TitleMenuScene } from './scenes/TitleMenuScene.js';
import { UIScene } from './scenes/UIScene.js';

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#080d09',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { width: 640, height: 360 },
        max: { width: 1920, height: 1080 }
    },
    scene: [TitleMenuScene, CharacterCreationScene, GameScene, UIScene],
    render: { pixelArt: true, antialias: false }
});

window.game = game;

import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene, UIScene],
    render: {
        pixelArt: true,
        antialias: false
    }
};

const game = new Phaser.Game(config);

console.log('🧟 Phoenix Blaze initialized...');
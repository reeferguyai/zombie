import Phaser from 'phaser';
import PlayerDataManager from '../managers/PlayerDataManager.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#0d0d0d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        CharacterCreationScene,
        GameScene,
        UIScene
    ],
    render: {
        pixelArt: true,
        antialias: false
    }
};

const game = new Phaser.Game(config);
window.game = game;
console.log('🧟 Phoenix Blaze initialized...');

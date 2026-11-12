import Phaser from 'phaser';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.gameScene = null;
        this.panel = null;
        this.panelTitle = null;
        this.panelContent = null;
        this.noticeText = null;
        this.craftingSystem = new CraftingSystem();
        this.saveSystem = new SaveSystem();
    }

    create(data = {}) {
        this.gameScene = data.gameScene;
        this.hud = this.add.text(18, 16, '', {
            font: '16px Arial', fill: '#eaffdf', backgroundColor: '#101810cc', padding: { x: 10, y: 8 },
            stroke: '#080808', strokeThickness: 3
        }).setScrollFactor(0).setDepth(100);
        this.help = this.add.text(18, 60, 'WASD move • Space attack • E talk • C craft • M map • Esc pause', {
            font: '13px Arial', fill: '#e3e6dd', backgroundColor: '#101810aa', padding: { x: 8, y: 5 }
        }).setScrollFactor(0).setDepth(100);
        this.noticeText = this.add.text(640, 104, '', {
            font: '16px Arial', fill: '#ffffff', backgroundColor: '#17251a', padding: { x: 12, y: 8 },
            align: 'center', wordWrap: { width: 700 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(120);
        this.panel = this.add.container(0, 0).setScrollFactor(0).setDepth(110).setVisible(false);
        this.gameScene.events.on('hud:update', this.updateHud, this);
        this.gameScene.events.on('notice', this.showNotice, this);
        this.gameScene.events.on('panel:craft', () => this.showCrafting(), this);
        this.gameScene.events.on('panel:map', () => this.showMap(), this);
        this.gameScene.events.on('panel:pause', () => this.showPause(), this);
        this.updateHud(this.gameScene.getSnapshot());
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.panel.visible) this.showPause();
            else this.closePanel();
        });
    }

    updateHud(state) {
        this.hud.setText(`${state.character?.name || 'Survivor'}  |  HP ${Math.ceil(state.health)}  |  Bloodlust ${Math.ceil(state.bloodlust)}% (${state.bloodlustState})  |  ${state.region}  |  Lv ${state.level} ${state.experience} XP`);
    }

    showNotice(message) {
        this.noticeText.setText(message).setAlpha(1);
        this.tweens.killTweensOf(this.noticeText);
        this.tweens.add({ targets: this.noticeText, alpha: 0, delay: 2200, duration: 500 });
    }

    clearPanel() {
        this.panel.removeAll(true);
        this.panel.setVisible(true);
        this.panel.add(this.add.rectangle(640, 360, 660, 520, 0x101710, 0.97).setStrokeStyle(3, 0xff5a24));
    }

    addPanelText(x, y, text, style = {}) {
        const object = this.add.text(x, y, text, { font: '18px Arial', fill: '#eef3e8', ...style });
        this.panel.add(object);
        return object;
    }

    addButton(x, y, text, action, width = 250) {
        const button = this.add.rectangle(x, y, width, 42, 0x263628).setStrokeStyle(1, 0x8ea17f).setInteractive({ useHandCursor: true });
        const label = this.add.text(x, y, text, { font: '16px Arial', fill: '#ffffff', align: 'center' }).setOrigin(0.5);
        button.on('pointerover', () => button.setFillStyle(0x3a523b));
        button.on('pointerout', () => button.setFillStyle(0x263628));
        button.on('pointerdown', action);
        label.setInteractive({ useHandCursor: true }).on('pointerdown', action);
        this.panel.add([button, label]);
    }

    showCrafting() {
        this.clearPanel();
        this.addPanelText(640, 130, 'FIELD CRAFTING', { font: 'bold 28px Arial', fill: '#ff7040' }).setOrigin(0.5);
        this.addPanelText(640, 166, 'Select a recipe. Materials are consumed only when crafting succeeds.', { font: '14px Arial' }).setOrigin(0.5);
        this.craftingSystem.getAllRecipes().forEach((recipe, index) => {
            const ingredients = Object.entries(recipe.ingredients).map(([id, qty]) => `${qty} ${id}`).join(' + ');
            const rowY = 220 + index * 64;
            const canCraft = this.craftingSystem.canCraft(recipe.id, this.gameScene.inventorySystem);
            this.addButton(640, rowY, `${canCraft ? '✓' : '·'} ${recipe.name} — ${ingredients}`, () => {
                const result = this.craftingSystem.craft(recipe.id, this.gameScene.inventorySystem);
                if (result) {
                    this.showNotice(`Crafted ${result.name}.`);
                    this.gameScene.emitUpdate();
                    this.showCrafting();
                } else this.showNotice(`Missing materials for ${recipe.name}.`);
            }, 520);
        });
        this.addButton(640, 478, 'Close  [C / Esc]', () => this.closePanel());
    }

    showMap() {
        this.clearPanel();
        this.addPanelText(640, 126, 'REGION MAP', { font: 'bold 28px Arial', fill: '#ff7040' }).setOrigin(0.5);
        const map = this.add.rectangle(640, 315, 500, 300, 0x293d2d).setStrokeStyle(2, 0x9eae8d);
        this.panel.add(map);
        const regionPositions = {
            outskirts: [470, 240], downtown: [760, 240], greenbelt: [470, 390], industrial: [760, 390]
        };
        this.gameScene.worldProgress.getMapData().forEach((region) => {
            const [x, y] = regionPositions[region.id];
            const color = region.discovered ? 0x8bd169 : 0x535b50;
            const marker = this.add.rectangle(x, y, 130, 64, color, 0.9).setStrokeStyle(2, region.id === this.gameScene.activeRegion ? 0xff5a24 : 0xb7c5aa);
            this.panel.add(marker);
            this.addPanelText(x, y - 5, region.discovered ? region.name : 'Unknown', { font: '13px Arial', align: 'center', wordWrap: { width: 120 } }).setOrigin(0.5);
            if (region.id === this.gameScene.activeRegion) this.addPanelText(x, y + 18, 'YOU ARE HERE', { font: '10px Arial', fill: '#171717' }).setOrigin(0.5);
        });
        this.addPanelText(640, 475, 'Explore beyond the roads to reveal more places and earn XP.', { font: '15px Arial' }).setOrigin(0.5);
        this.addButton(640, 520, 'Close  [M / Esc]', () => this.closePanel());
    }

    showPause() {
        this.clearPanel();
        this.addPanelText(640, 145, 'PAUSED', { font: 'bold 32px Arial', fill: '#ff7040' }).setOrigin(0.5);
        this.addButton(640, 225, 'Resume', () => this.closePanel());
        this.addButton(640, 280, 'Save Game', () => this.gameScene.saveGame());
        this.addButton(640, 335, 'Load Last Save', () => this.loadSave());
        this.addButton(640, 390, 'Crafting', () => this.showCrafting());
        this.addButton(640, 445, 'Return to Title', () => {
            this.gameScene.saveGame();
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('TitleMenuScene');
        });
    }

    loadSave() {
        const result = this.saveSystem.loadState();
        if (!result.success) {
            this.showNotice('No valid save is available.');
            return;
        }
        this.gameScene.scene.restart({ characterData: result.state.character, loadSaved: true });
        this.scene.restart({ gameScene: this.gameScene });
    }

    closePanel() {
        this.panel.setVisible(false);
        this.panel.removeAll(true);
    }

    shutdown() {
        if (this.gameScene) {
            this.gameScene.events.off('hud:update', this.updateHud, this);
            this.gameScene.events.off('notice', this.showNotice, this);
        }
    }
}

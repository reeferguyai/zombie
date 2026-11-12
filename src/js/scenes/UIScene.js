import Phaser from 'phaser';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.panel = null;
    }

    create({ gameScene } = {}) {
        this.gameScene = gameScene;
        this.hud = this.add.text(16, 14, '', { font: '14px Arial', fill: '#eaffdf', backgroundColor: '#101810dd', padding: { x: 9, y: 7 }, stroke: '#080808', strokeThickness: 3 }).setScrollFactor(0).setDepth(100);
        this.controls = this.add.text(16, 52, 'WASD move • Space attack • E interact • I inventory • C craft • J journal • M map • Esc pause', { font: '12px Arial', fill: '#eee', backgroundColor: '#101810bb', padding: { x: 7, y: 4 } }).setScrollFactor(0).setDepth(100);
        this.notice = this.add.text(640, 100, '', { font: '16px Arial', fill: '#fff', backgroundColor: '#17251a', padding: { x: 12, y: 8 }, align: 'center', wordWrap: { width: 700 } }).setOrigin(0.5).setScrollFactor(0).setDepth(120);
        this.panel = this.add.container(0, 0).setScrollFactor(0).setDepth(110).setVisible(false);
        this.gameScene.events.on('hud:update', this.updateHud, this);
        this.gameScene.events.on('notice', this.showNotice, this);
        this.gameScene.events.on('panel:craft', this.showCrafting, this);
        this.gameScene.events.on('panel:map', this.showMap, this);
        this.gameScene.events.on('panel:pause', this.showPause, this);
        this.gameScene.events.on('panel:dialogue', this.showDialogue, this);
        this.gameScene.events.on('panel:journal', this.showJournal, this);
        this.gameScene.events.on('panel:upgrade', this.showUpgrade, this);
        this.gameScene.events.on('panel:inventory', this.showInventory, this);
        this.updateHud(this.gameScene.snapshot());
        this.input.keyboard.on('keydown-ESC', () => this.panel.visible ? this.closePanel() : this.showPause());
        this.input.keyboard.on('keydown', () => this.gameScene.audio?.unlock());
    }

    updateHud(state) {
        this.hud.setText(`${state.character?.name || 'Survivor'} | HP ${Math.ceil(state.health)} | Bloodlust ${Math.ceil(state.bloodlust)}% (${state.bloodlustState}) | ${state.region} | Lv ${state.level} ${state.experience} XP`);
    }

    showNotice(message) {
        this.notice.setText(message).setAlpha(1);
        this.tweens.killTweensOf(this.notice);
        this.tweens.add({ targets: this.notice, alpha: 0, delay: 2200, duration: 450 });
    }

    openPanel(title) {
        this.panel.removeAll(true).setVisible(true);
        this.panel.add(this.add.rectangle(640, 360, 720, 560, 0x101710, 0.98).setStrokeStyle(3, 0xff5a24));
        this.addText(640, 112, title, { font: 'bold 25px Arial', fill: '#ff7040' }).setOrigin(0.5);
        this.gameScene.player.setVelocity(0, 0);
    }

    addText(x, y, text, style = {}) {
        const object = this.add.text(x, y, text, { font: '15px Arial', fill: '#eef3e8', ...style });
        this.panel.add(object);
        return object;
    }

    addButton(x, y, text, action, width = 450) {
        const bg = this.add.rectangle(x, y, width, 38, 0x263628).setStrokeStyle(1, 0x8ea17f).setInteractive({ useHandCursor: true });
        const label = this.add.text(x, y, text, { font: '14px Arial', fill: '#fff', align: 'center', wordWrap: { width: width - 18 } }).setOrigin(0.5);
        bg.on('pointerover', () => bg.setFillStyle(0x3a523b));
        bg.on('pointerout', () => bg.setFillStyle(0x263628));
        bg.on('pointerdown', action);
        label.setInteractive({ useHandCursor: true }).on('pointerdown', action);
        this.panel.add([bg, label]);
    }

    showInventory() {
        this.openPanel('INVENTORY');
        const items = this.gameScene.inventorySystem.getAllItems();
        if (!items.length) this.addText(640, 175, 'Your pack is empty.', { align: 'center' }).setOrigin(0.5);
        items.slice(0, 7).forEach((item, index) => {
            const y = 164 + index * 42;
            this.addText(395, y, `${item.name} × ${item.quantity}`, { font: '14px Arial' });
            if (item.id === 'bandage') this.addButton(790, y + 9, 'Use (+25 HP)', () => {
                if (this.gameScene.inventorySystem.removeItem('bandage', 1)) this.gameScene.state.health = Math.min(100, this.gameScene.state.health + 25);
                this.gameScene.emitUpdate(); this.showInventory();
            }, 170);
            else if (item.id === 'cannabis_flower' || item.id === 'calming_tonic') this.addButton(790, y + 9, 'Use to calm', () => {
                const result = this.gameScene.cannabisSystem.consume(this.gameScene.inventorySystem, this.gameScene.bloodlustSystem, item.id);
                this.showNotice(result.message); this.gameScene.emitUpdate(); this.showInventory();
            }, 170);
        });
        this.addText(640, 480, `Weight: ${this.gameScene.inventorySystem.weight.toFixed(1)} / ${this.gameScene.inventorySystem.maxWeight} kg`, { align: 'center' }).setOrigin(0.5);
        this.addButton(640, 520, 'Close [I / Esc]', () => this.closePanel());
    }

    showCrafting(data = {}) {
        this.openPanel('WORKBENCH CRAFTING');
        const stationReady = Boolean(data.atStation) || Phaser.Math.Distance.Between(this.gameScene.player.x, this.gameScene.player.y, this.gameScene.station.x, this.gameScene.station.y) < 105;
        this.addText(640, 148, stationReady ? 'Crafting uses materials from your inventory.' : 'Crafting requires a nearby workbench. Press E at the marked table.', { font: '13px Arial', align: 'center' }).setOrigin(0.5);
        if (stationReady) new CraftingSystem().getAllRecipes().filter((recipe) => recipe.station === 'workbench').forEach((recipe, index) => {
            const ingredients = Object.entries(recipe.ingredients).map(([id, quantity]) => `${quantity} ${id}`).join(' + ');
            this.addButton(640, 205 + index * 53, `${recipe.name} — ${ingredients}`, () => {
                const result = this.gameScene.craftingSystem.craft(recipe.id, this.gameScene.inventorySystem, 'workbench');
                this.showNotice(result ? `Crafted ${recipe.name}.` : 'Missing materials or inventory capacity.');
                this.gameScene.emitUpdate(); this.showCrafting({ atStation: true });
            }, 530);
        });
        this.addButton(640, 520, 'Close [C / Esc]', () => this.closePanel());
    }

    showDialogue({ faction, quest, reputation }) {
        this.openPanel(faction.name);
        this.addText(640, 150, faction.line, { align: 'center', wordWrap: { width: 570 } }).setOrigin(0.5);
        this.addText(640, 188, `Standing: ${reputation} | ${quest.title} ${quest.progress}/${quest.required} ${quest.target}`, { font: '13px Arial', fill: '#dfcf8b', align: 'center' }).setOrigin(0.5);
        this.addText(640, 220, quest.description, { font: '13px Arial', align: 'center', wordWrap: { width: 570 } }).setOrigin(0.5);
        this.addButton(640, 282, quest.accepted ? 'Check / turn in quest' : 'Accept quest', () => { this.gameScene.resolveQuest(faction, quest.id); this.closePanel(); });
        this.addButton(640, 327, 'Trade: 2 salvage for a bandage', () => {
            this.showNotice(this.gameScene.trade('bandage') ? 'Trade completed.' : 'Trade failed: need salvage or inventory space.');
            this.gameScene.emitUpdate();
        });
        this.addButton(640, 372, 'Help (+2 faction standing)', () => { this.gameScene.applyMoralChoice(faction.id, 'help'); this.closePanel(); });
        this.addButton(640, 417, 'Threaten (-4 faction standing)', () => { this.gameScene.applyMoralChoice(faction.id, 'threaten'); this.closePanel(); });
        this.addButton(640, 500, 'Leave', () => this.closePanel());
    }

    showUpgrade() {
        this.openPanel('WEAPON UPGRADE');
        const weapon = this.gameScene.inventorySystem.getItem('spear');
        this.addText(640, 185, weapon ? `${weapon.name} • Damage ${weapon.damage} • Upgrade ${weapon.upgradeLevel || 0}/3` : 'Craft or find a spear first.', { align: 'center' }).setOrigin(0.5);
        this.addButton(640, 265, 'Upgrade with salvage', () => {
            const result = this.gameScene.upgradeWeapon();
            this.showNotice(result.message); this.showUpgrade();
        });
        this.addButton(640, 510, 'Close [Esc]', () => this.closePanel());
    }

    showJournal() {
        this.openPanel('JOURNAL • STORY • QUESTS');
        const snapshot = this.gameScene.snapshot();
        const chapter = snapshot.chapters.find((entry) => entry.current);
        this.addText(640, 150, chapter?.title || 'The First Morning', { font: 'bold 18px Arial', fill: '#d8ba75', align: 'center' }).setOrigin(0.5);
        this.addText(640, 181, this.gameScene.story.getPerspective(snapshot.character), { font: '13px Arial', align: 'center', wordWrap: { width: 610 } }).setOrigin(0.5);
        const questText = snapshot.quests.map((quest) => `${quest.accepted ? 'ACTIVE' : 'AVAILABLE'}: ${quest.title} (${quest.progress}/${quest.required})`).join('\n') || 'No active quests.';
        this.addText(640, 285, questText, { font: '13px Arial', align: 'center' }).setOrigin(0.5);
        this.addText(640, 390, snapshot.journal.slice(0, 4).map((entry) => `• ${entry.title}: ${entry.text}`).join('\n') || 'Your journal is waiting for its first entry.', { font: '12px Arial', wordWrap: { width: 600 } }).setOrigin(0.5);
        this.addButton(640, 520, 'Close [J / Esc]', () => this.closePanel());
    }

    showMap() {
        this.openPanel('WORLD MAP • REGIONS & QUEST MARKERS');
        const map = this.add.rectangle(640, 315, 560, 320, 0x293d2d).setStrokeStyle(2, 0x9eae8d);
        this.panel.add(map);
        const points = { outskirts: [430, 225], downtown: [555, 225], greenbelt: [430, 315], industrial: [555, 315], wetlands: [680, 225], highlands: [680, 315] };
        this.gameScene.worldProgress.getMapData().forEach((region) => {
            const [x, y] = points[region.id];
            const marker = this.add.rectangle(x, y, 112, 52, region.discovered ? 0x8bd169 : 0x535b50).setStrokeStyle(2, region.id === this.gameScene.activeRegion ? 0xff5a24 : 0xb7c5aa);
            this.panel.add(marker);
            this.addText(x, y, region.discovered ? `${region.name}\n${region.biome}` : 'Unknown', { font: '10px Arial', align: 'center' }).setOrigin(0.5);
        });
        this.gameScene.quests.getAvailable().filter((quest) => quest.accepted).forEach((quest) => {
            const npc = this.gameScene.factionInfo.find((faction) => faction.quest === quest.id);
            if (npc) this.addText(470 + npc.x / this.gameScene.worldSize.width * 330, 420, '!', { font: 'bold 18px Arial', fill: '#ffd700' }).setOrigin(0.5);
        });
        this.addButton(640, 520, 'Close [M / Esc]', () => this.closePanel());
    }

    showPause() {
        this.openPanel('PAUSED • SAVE SLOTS');
        this.saveSystem.listSlots().forEach((slot, index) => {
            const label = slot.exists ? `Save ${slot.slot}: ${slot.characterName || 'Survivor'} — ${new Date(slot.savedAt).toLocaleString()}` : `Save ${slot.slot}: Empty`;
            this.addButton(640, 170 + index * 45, label, () => {
                const result = this.gameScene.saveGame(slot.slot);
                this.showNotice(result.success ? `Saved slot ${slot.slot}.` : result.error);
            }, 590);
        });
        this.addButton(640, 335, 'Load most recent save', () => this.loadMostRecent());
        this.addButton(640, 380, 'Resume', () => this.closePanel());
        this.addButton(640, 425, 'Return to title', () => {
            this.gameScene.saveGame(1);
            this.scene.stop('UIScene'); this.scene.stop('GameScene'); this.scene.start('TitleMenuScene');
        });
    }

    loadMostRecent() {
        const slot = this.saveSystem.listSlots().filter((entry) => entry.exists).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0];
        if (!slot) return this.showNotice('No saves found.');
        this.scene.stop('UIScene');
        this.gameScene.scene.restart({ loadSaved: true, slot: slot.slot });
    }

    closePanel() { this.panel.removeAll(true).setVisible(false); }

    shutdown() {
        if (!this.gameScene) return;
        ['hud:update', 'notice', 'panel:craft', 'panel:map', 'panel:pause', 'panel:dialogue', 'panel:journal', 'panel:upgrade', 'panel:inventory'].forEach((name) => this.gameScene.events.off(name));
    }
}

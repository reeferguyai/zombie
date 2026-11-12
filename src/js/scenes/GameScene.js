import Phaser from 'phaser';
import { itemCatalog, starterInventory } from '../data/items.js';
import { AISystem } from '../systems/AISystem.js';
import { BloodlustSystem } from '../systems/BloodlustSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { WorldProgressionSystem } from '../systems/WorldProgressionSystem.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

const WORLD = { width: 2200, height: 1600, tile: 64 };

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.playerState = { health: 100, stamina: 100 };
        this.enemies = [];
        this.npcs = [];
        this.pickups = [];
        this.inventorySystem = new InventorySystem(24);
        this.bloodlustSystem = new BloodlustSystem();
        this.combatSystem = new CombatSystem();
        this.craftingSystem = new CraftingSystem();
        this.saveSystem = new SaveSystem();
        this.aiSystem = new AISystem();
        this.characterData = null;
        this.attackCooldown = 0;
        this.interactCooldown = 0;
        this.autoSaveElapsed = 0;
        this.activeRegion = 'outskirts';
    }

    create(data = {}) {
        this.characterData = data.characterData || PlayerDataManager.getCharacter() || { name: 'Survivor', skills: [] };
        this.cameras.main.setBackgroundColor('#18251a');
        this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
        this.drawWorld();
        this.createTextures();

        const saved = data.loadSaved ? this.saveSystem.loadState() : { success: false };
        if (saved.success && saved.state.character) this.characterData = saved.state.character;
        if (saved.success && saved.state.inventory) this.inventorySystem.restore(saved.state.inventory);
        else starterInventory.forEach(({ id, quantity }) => this.inventorySystem.addItem(itemCatalog[id], quantity));
        if (saved.success) {
            this.playerState = { ...this.playerState, ...saved.state.playerState };
            this.bloodlustSystem.bloodlustMeter = saved.state.bloodlust || 0;
        }

        this.player = this.physics.add.sprite(saved.success ? (saved.state.position?.x || 180) : 180, saved.success ? (saved.state.position?.y || 180) : 180, 'player');
        this.player.setCollideWorldBounds(true).setDepth(5).setScale(1.3);
        this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.createObstacles();
        this.createPickups();
        this.createZombies();
        this.createNPCs();
        this.setupInput();

        this.scene.launch('UIScene', { gameScene: this });
        this.events.emit('hud:update', this.getSnapshot());
        if (data.loadSaved && !saved.success) this.events.emit('notice', 'No valid save found. Starting a new run.');
    }

    createTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x39a34a).fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x174d2e).fillRect(5, 5, 6, 6).fillRect(21, 17, 7, 7);
        graphics.generateTexture('grass', 32, 32);
        graphics.clear();
        graphics.fillStyle(0x77776d).fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x44463e).fillRect(2, 6, 8, 3).fillRect(18, 19, 10, 4);
        graphics.generateTexture('road', 32, 32);
        graphics.clear();
        graphics.fillStyle(0x39ff14).fillRoundedRect(4, 3, 24, 28, 7);
        graphics.fillStyle(0x172317).fillCircle(11, 12, 2).fillCircle(21, 12, 2);
        graphics.fillStyle(0x111111).fillRect(10, 22, 12, 3);
        graphics.generateTexture('player', 32, 34);
        graphics.clear();
        graphics.fillStyle(0x9b332c).fillRoundedRect(4, 4, 24, 27, 8);
        graphics.fillStyle(0xd7b99a).fillCircle(11, 12, 2).fillCircle(21, 12, 2);
        graphics.generateTexture('zombie', 32, 34);
        graphics.clear();
        graphics.fillStyle(0xe4c76d).fillRoundedRect(5, 4, 22, 27, 7);
        graphics.fillStyle(0x2a2115).fillCircle(11, 12, 2).fillCircle(21, 12, 2);
        graphics.generateTexture('npc', 32, 34);
        graphics.clear();
        graphics.fillStyle(0xbde66d).fillCircle(8, 8, 8);
        graphics.generateTexture('pickup', 16, 16);
        graphics.destroy();
    }

    drawWorld() {
        const g = this.add.graphics().setDepth(-10);
        g.fillStyle(0x29412b).fillRect(0, 0, WORLD.width, WORLD.height);
        for (let y = 0; y < WORLD.height; y += WORLD.tile) {
            for (let x = 0; x < WORLD.width; x += WORLD.tile) {
                const road = (x > 960 && x < 1150) || (y > 690 && y < 880);
                g.fillStyle(road ? 0x54554e : ((x / WORLD.tile + y / WORLD.tile) % 2 ? 0x315037 : 0x36563b));
                g.fillRect(x, y, WORLD.tile - 2, WORLD.tile - 2);
                if (!road && (x * 7 + y * 13) % 11 === 0) {
                    g.fillStyle(0x71805a, 0.6).fillCircle(x + 18, y + 20, 4);
                    g.fillStyle(0x4d3025, 0.8).fillRect(x + 42, y + 34, 10, 5);
                }
            }
        }
        const regions = [
            { x: 100, y: 100, w: 630, h: 500, color: 0x25462e, label: 'OVERGROWN OUTSKIRTS' },
            { x: 760, y: 100, w: 680, h: 520, color: 0x3c3b38, label: 'RUINED DOWNTOWN' },
            { x: 100, y: 900, w: 700, h: 570, color: 0x1d4932, label: 'DEEP GREENBELT' },
            { x: 1320, y: 900, w: 760, h: 550, color: 0x413b32, label: 'INDUSTRIAL QUARTER' }
        ];
        regions.forEach((region) => {
            g.fillStyle(region.color, 0.42).fillRect(region.x, region.y, region.w, region.h);
            this.add.text(region.x + 18, region.y + 14, region.label, { font: 'bold 17px Arial', fill: '#e4dfc4' }).setDepth(-5);
        });
        // Small ruined buildings and tree clusters provide visible landmarks without external assets.
        for (let i = 0; i < 17; i += 1) {
            const x = 820 + (i % 5) * 112;
            const y = 190 + Math.floor(i / 5) * 108;
            g.fillStyle(0x272b2a).fillRect(x, y, 68, 54);
            g.lineStyle(3, 0x757260).strokeRect(x, y, 68, 54);
            g.fillStyle(0x594a35).fillRect(x + 8, y + 9, 15, 13).fillRect(x + 43, y + 9, 15, 13);
        }
    }

    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();
        for (let i = 0; i < 24; i += 1) {
            const x = 380 + (i % 6) * 115;
            const y = 360 + Math.floor(i / 6) * 105;
            const block = this.add.rectangle(x, y, 30, 30, i % 2 ? 0x47633d : 0x635444).setDepth(2);
            this.physics.add.existing(block, true);
            this.obstacles.add(block);
        }
        this.physics.add.collider(this.player, this.obstacles);
    }

    createPickups() {
        const spawns = [
            [310, 260, 'scrap', 2], [460, 520, 'stick', 2], [620, 280, 'herb', 1],
            [900, 600, 'cloth', 2], [1320, 390, 'water', 1], [1690, 1120, 'scrap', 2],
            [450, 1120, 'herb', 1], [1860, 460, 'bandage', 1], [1580, 1300, 'stick', 2]
        ];
        this.pickupGroup = this.physics.add.group();
        spawns.forEach(([x, y, id, amount]) => {
            const pickup = this.physics.add.image(x, y, 'pickup').setDepth(3);
            pickup.setData({ itemId: id, amount });
            pickup.body.setAllowGravity(false).setImmovable(true);
            this.pickupGroup.add(pickup);
        });
        this.physics.add.overlap(this.player, this.pickupGroup, (_, pickup) => this.collectPickup(pickup));
    }

    createZombies() {
        this.zombieGroup = this.physics.add.group();
        [[660, 240], [1080, 470], [1450, 390], [1780, 980], [340, 1120], [1220, 1250]].forEach(([x, y], i) => {
            const zombie = this.physics.add.sprite(x, y, 'zombie').setDepth(4);
            zombie.health = 36;
            zombie.aiPhase = i * 0.7;
            this.zombieGroup.add(zombie);
            this.enemies.push(zombie);
        });
        this.physics.add.collider(this.player, this.zombieGroup, () => {
            if (this.playerState.health > 0) this.playerState.health = Math.max(0, this.playerState.health - 0.15);
        });
    }

    createNPCs() {
        this.factionInfo = [
            { id: 'resistance', name: 'Resistance', x: 260, y: 410, color: '#62a8ff', line: 'Bring the community three pieces of salvage.' },
            { id: 'cultists', name: 'Green Remnant', x: 520, y: 1040, color: '#b28cff', line: 'A wild herb can help you keep control.' }
        ];
        this.npcGroup = this.physics.add.group();
        this.factionInfo.forEach((faction) => {
            const npc = this.physics.add.sprite(faction.x, faction.y, 'npc').setDepth(4);
            npc.setData('factionId', faction.id);
            this.npcGroup.add(npc);
            this.npcs.push(npc);
            this.aiSystem.createNPC({ id: faction.id, name: faction.name, faction: faction.id, behavior: 'human', position: { x: faction.x, y: faction.y } });
            this.add.text(faction.x - 62, faction.y - 36, faction.name, { font: '12px Arial', fill: faction.color }).setDepth(8);
        });
        this.physics.add.collider(this.player, this.npcGroup);
        this.questSystem = new QuestSystem();
    }

    setupInput() {
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D,
            arrowUp: Phaser.Input.Keyboard.KeyCodes.UP, arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
            arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT, arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE, interact: Phaser.Input.Keyboard.KeyCodes.E,
            craft: Phaser.Input.Keyboard.KeyCodes.C, map: Phaser.Input.Keyboard.KeyCodes.M,
            pause: Phaser.Input.Keyboard.KeyCodes.ESC
        });
        this.keys.craft.on('down', () => this.events.emit('panel:craft'));
        this.keys.map.on('down', () => this.events.emit('panel:map'));
        this.keys.pause.on('down', () => this.events.emit('panel:pause'));
    }

    collectPickup(pickup) {
        if (!pickup.active) return;
        const { itemId, amount } = pickup.data.values;
        const result = this.inventorySystem.addItem(itemCatalog[itemId], amount);
        if (!result.success) {
            this.events.emit('notice', 'Inventory is full or too heavy.');
            return;
        }
        this.questSystem.recordGather(itemId, amount);
        pickup.destroy();
        this.events.emit('notice', `Collected ${itemCatalog[itemId].name} x${amount}`);
        this.emitUpdate();
    }

    interact() {
        if (this.interactCooldown > 0) return;
        this.interactCooldown = 500;
        const nearest = this.npcs
            .filter((npc) => npc.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < 90)
            .sort((a, b) => Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) - Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y))[0];
        if (!nearest) {
            this.events.emit('notice', 'Move close to a survivor and press E to talk.');
            return;
        }
        const faction = this.factionInfo.find((entry) => entry.id === nearest.getData('factionId'));
        const quest = this.questSystem.quests.find((entry) => entry.faction === faction.id && !entry.completed);
        if (quest?.progress >= quest.required) {
            const reward = this.questSystem.complete(quest.id);
            this.inventorySystem.addItem(itemCatalog[reward.itemId], 1);
            this.worldProgress.addExperience(reward.xp);
            this.events.emit('notice', `Quest complete: ${quest.title} (+${reward.xp} XP)`);
        } else {
            this.events.emit('notice', `${faction.name}: ${faction.line}`);
        }
        this.emitUpdate();
    }

    attack() {
        const target = this.enemies.filter((enemy) => enemy.active)
            .map((enemy) => ({ enemy, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) }))
            .filter(({ distance }) => distance < 76).sort((a, b) => a.distance - b.distance)[0]?.enemy;
        if (!target) return;
        const weapon = this.inventorySystem.getItem('spear');
        const strength = 8 + (this.characterData.skills?.includes('combat') ? 4 : 0);
        const result = this.combatSystem.resolveAttack({ strength }, { health: target.health, defense: 1 }, { accuracy: 1, weapon: weapon ? itemCatalog.spear : null });
        target.health -= result.damage;
        this.bloodlustSystem.bloodlustMeter = Math.min(100, this.bloodlustSystem.bloodlustMeter + 5);
        if (target.health <= 0) {
            target.destroy();
            this.enemies = this.enemies.filter((enemy) => enemy !== target);
            this.inventorySystem.addItem(itemCatalog.scrap, 1);
            this.events.emit('notice', 'Zombie defeated. Salvage recovered.');
        }
        this.emitUpdate();
    }

    getSnapshot() {
        return {
            character: this.characterData,
            health: this.playerState.health,
            bloodlust: this.bloodlustSystem.bloodlustMeter,
            bloodlustState: this.bloodlustSystem.state,
            inventory: this.inventorySystem.getAllItems(),
            quests: this.questSystem?.getAvailable() || [],
            region: this.activeRegion,
            regions: this.worldProgress?.getMapData() || [],
            level: this.worldProgress?.level || 1,
            experience: this.worldProgress?.experience || 0
        };
    }

    emitUpdate() {
        this.events.emit('hud:update', this.getSnapshot());
    }

    saveGame() {
        const result = this.saveSystem.saveState({
            character: this.characterData,
            position: { x: this.player.x, y: this.player.y },
            inventory: this.inventorySystem.getAllItems(),
            playerState: this.playerState,
            bloodlust: this.bloodlustSystem.bloodlustMeter,
            quests: this.questSystem.serialize(),
            discovered: this.worldProgress.serialize(),
            experience: this.worldProgress.experience
        });
        this.events.emit('notice', result.success ? 'Game saved.' : `Save failed: ${result.error}`);
        return result;
    }

    update(time, delta) {
        if (!this.player?.active) return;
        const moveX = Number(this.keys.right.isDown || this.keys.arrowRight.isDown) - Number(this.keys.left.isDown || this.keys.arrowLeft.isDown);
        const moveY = Number(this.keys.down.isDown || this.keys.arrowDown.isDown) - Number(this.keys.up.isDown || this.keys.arrowUp.isDown);
        const magnitude = Math.hypot(moveX, moveY) || 1;
        const speed = this.bloodlustSystem.getStateEffects().speedMultiplier * 175;
        this.player.setVelocity((moveX / magnitude) * speed, (moveY / magnitude) * speed);
        if (Phaser.Input.Keyboard.JustDown(this.keys.attack) && this.attackCooldown <= 0) {
            this.attack();
            this.attackCooldown = 400;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.interact();

        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
        this.interactCooldown = Math.max(0, this.interactCooldown - delta);
        this.bloodlustSystem.update(delta);

        this.enemies.forEach((enemy) => {
            if (!enemy.active) return;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            if (distance < 280) this.physics.moveToObject(enemy, this.player, 48);
            else if (Math.sin(time / 1300 + enemy.aiPhase) > 0.97) enemy.setVelocity(Phaser.Math.Between(-35, 35), Phaser.Math.Between(-35, 35));
            else if (distance > 320) enemy.setVelocity(0, 0);
        });

        const region = this.worldProgress.discoverAt(this.player.x, this.player.y);
        if (region) {
            this.activeRegion = region.id;
            this.events.emit('notice', `Region discovered: ${region.name} (+${region.xp || 10} XP)`);
        }
        this.autoSaveElapsed += delta;
        if (this.autoSaveElapsed >= 30000) {
            this.autoSaveElapsed = 0;
            this.saveGame();
        }
        if (this.playerState.health <= 0) {
            this.playerState.health = 100;
            this.player.setPosition(180, 180);
            this.events.emit('notice', 'You were overwhelmed and woke at the outskirts.');
        }
        this.emitUpdate();
    }
}

import Phaser from 'phaser';

const WORLD = { width: 4000, height: 3000, tileSize: 64 };
const BIOMES = [
    { id: 'outskirts', name: 'Overgrown Outskirts', x: 120, y: 120, width: 900, height: 760, color: 0x31543a, tile: 0x365b3d },
    { id: 'downtown', name: 'Ruined Downtown', x: 1040, y: 120, width: 1120, height: 900, color: 0x4d4d49, tile: 0x555550 },
    { id: 'greenbelt', name: 'Deep Greenbelt', x: 120, y: 960, width: 1000, height: 860, color: 0x204b35, tile: 0x28583b },
    { id: 'industrial', name: 'Industrial Quarter', x: 1180, y: 1080, width: 1040, height: 940, color: 0x554634, tile: 0x65533b },
    { id: 'wetlands', name: 'Flooded Wetlands', x: 2480, y: 120, width: 1320, height: 1040, color: 0x315c60, tile: 0x38686a },
    { id: 'highlands', name: 'Ashen Highlands', x: 2440, y: 1240, width: 1360, height: 1640, color: 0x655848, tile: 0x786952 }
];

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.enemies = [];
        this.pickups = [];
        this.npcs = [];
        this.cooldowns = { attack: 0, interact: 0, autosave: 0 };
        this.state = { health: 100, stamina: 100 };
        this.difficulty = 'normal';
        this.paused = false;
    }

    create(data = {}) {
        this.characterData = data.characterData || { name: 'Survivor', backstory: '', skills: [] };
        this.difficulty = data.difficulty || localStorage.getItem('phoenix-blaze-difficulty') || 'normal';
        this.worldSize = WORLD;
        this.resetSystems(data);
        this.createTextures();
        this.createAnimations();
        this.generateWorld();
        this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
        this.player = this.physics.add.sprite(data.position?.x || 180, data.position?.y || 180, 'player-idle-0')
            .setDepth(5).setCollideWorldBounds(true).setScale(1.35);
        this.player.body.setSize(20, 25).setOffset(6, 8);
        this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height).startFollow(this.player, true, 0.08, 0.08);
        this.createObstacles();
        this.createPickups();
        this.createEnemies();
        this.createNPCs();
        this.createWorkbench();
        this.createInput();
        this.createMinimap();
        this.scene.launch('UIScene', { gameScene: this });
        this.story.addEntry('The first morning', this.story.getCurrentChapter().text);
        this.events.emit('hud:update', this.snapshot());
        this.events.emit('notice', `${this.characterData.name || 'Survivor'}: ${this.story.getCurrentChapter().title}. Explore, gather, and survive.`);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    }

    resetSystems(data) {
        this.inventorySystem = new InventorySystem(32);
        this.bloodlustSystem = new BloodlustSystem();
        this.cannabisSystem = new CannabisSystem();
        this.combatSystem = new CombatSystem();
        this.craftingSystem = new CraftingSystem();
        this.equipmentSystem = new EquipmentSystem();
        this.saveSystem = new SaveSystem();
        this.enemyAI = new EnemyAISystem();
        const loaded = data.loadSaved ? this.saveSystem.loadSlot(data.slot || 1) : { success: false };
        this.loadedState = loaded.success ? loaded.state : null;
        if (loaded.success) {
            this.characterData = loaded.state.character || this.characterData;
            this.inventorySystem.restore(loaded.state.inventory || []);
            this.state = { ...this.state, ...(loaded.state.playerState || {}) };
            this.bloodlustSystem.bloodlustMeter = loaded.state.bloodlust || 0;
            this.bloodlustSystem.updateState();
            this.cannabisSystem.restore(loaded.state.cannabis || {});
        } else {
            starterInventory.forEach(({ id, quantity }) => {
                if (itemCatalog[id]) this.inventorySystem.addItem(itemCatalog[id], quantity);
            });
        }
        this.worldProgress = new WorldProgressionSystem(loaded.state?.discovered || {});
        this.worldProgress.experience = loaded.state?.experience || 0;
        this.worldProgress.level = 1 + Math.floor(this.worldProgress.experience / 100);
        this.quests = new QuestSystem(loaded.state?.quests || {});
        this.factions = new FactionSystem(loaded.state?.factions || {});
        this.profile = loaded.state?.profile ? new ProfileSystem(loaded.state.profile) : ProfileSystem.load();
        this.story = new StorySystem(loaded.state?.story || {});
        this.activeRegion = 'outskirts';
        this.worldEvents = new WorldEventSystem();
    }

    createTextures() {
        const make = (key, bodyColor, eyeColor, step = 0) => {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(bodyColor).fillRoundedRect(4, 4 + step, 24, 26, 7);
            g.fillStyle(eyeColor).fillCircle(11, 12 + step, 2).fillCircle(21, 12 + step, 2);
            g.fillStyle(0x171717).fillRect(10, 22 + step, 12, 3);
            g.fillStyle(bodyColor).fillRect(7, 27 + step, 6, 5 - step).fillRect(19, 27 + step, 6, 5 + step);
            g.generateTexture(key, 32, 34);
            g.destroy();
        };
        make('player-idle-0', 0x3e9b50, 0x1b251c);
        make('player-idle-1', 0x348642, 0x1b251c);
        make('player-walk-0', 0x45b94d, 0x182319);
        make('player-walk-1', 0x32913d, 0x182319, 1);
        make('zombie-idle-0', 0x8e3932, 0xd8c6a5);
        make('zombie-idle-1', 0x76302e, 0xd8c6a5);
        make('zombie-walk-0', 0xa4463a, 0xe7d2ab);
        make('zombie-walk-1', 0x8a332f, 0xe7d2ab, 1);
        make('zombie-attack-0', 0xca4936, 0xffd49f);
        make('zombie-attack-1', 0xa63832, 0xffd49f, 1);
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xe4c76d).fillRoundedRect(5, 4, 22, 27, 7).fillStyle(0x292216).fillCircle(11, 12, 2).fillCircle(21, 12, 2);
        g.generateTexture('npc', 32, 34);
        g.clear().fillStyle(0xbde66d).fillCircle(8, 8, 8).generateTexture('pickup', 16, 16);
        g.clear().fillStyle(0x89613d).fillRect(0, 9, 48, 30).fillStyle(0x5b412b).fillRect(4, 4, 40, 8).generateTexture('workbench', 48, 42);
        g.destroy();
    }

    createAnimations() {
        const add = (key, frames, rate) => this.anims.create({ key, frames: frames.map((frame) => ({ key: frame })), frameRate: rate, repeat: -1 });
        add('player-idle', ['player-idle-0', 'player-idle-1'], 2);
        add('player-walk', ['player-walk-0', 'player-walk-1'], 8);
        add('zombie-idle', ['zombie-idle-0', 'zombie-idle-1'], 2);
        add('zombie-walk', ['zombie-walk-0', 'zombie-walk-1'], 5);
        add('zombie-attack', ['zombie-attack-0', 'zombie-attack-1'], 8);
    }

    generateWorld() {
        const g = this.add.graphics().setDepth(-10);
        g.fillStyle(0x18251a).fillRect(0, 0, WORLD.width, WORLD.height);
        for (let y = 0; y < WORLD.height; y += WORLD.tileSize) {
            for (let x = 0; x < WORLD.width; x += WORLD.tileSize) {
                const biome = BIOMES.find((entry) => x >= entry.x && x < entry.x + entry.width && y >= entry.y && y < entry.y + entry.height);
                const road = (x > 960 && x < 1110) || (y > 690 && y < 830);
                const color = road ? 0x51534d : biome ? ((x / WORLD.tileSize + y / WORLD.tileSize) % 2 ? biome.color : biome.tile) : 0x293d2b;
                g.fillStyle(color).fillRect(x, y, WORLD.tileSize - 2, WORLD.tileSize - 2);
                const hash = (x * 31 + y * 17) % 97;
                if (!road && hash < 8) {
                    g.fillStyle(biome?.id === 'wetlands' ? 0x66979a : 0x71805a, 0.6).fillCircle(x + 18, y + 23, 4);
                    g.fillStyle(0x4d3025, 0.85).fillRect(x + 42, y + 37, 10, 5);
                }
            }
        }
        BIOMES.forEach((biome) => this.add.text(biome.x + 18, biome.y + 16, biome.name.toUpperCase(), {
            font: 'bold 18px Arial', fill: '#f0e5c7', backgroundColor: '#111811aa', padding: { x: 6, y: 4 }
        }).setDepth(-4));
        for (let i = 0; i < 36; i += 1) {
            const x = 1120 + (i % 6) * 112;
            const y = 220 + Math.floor(i / 6) * 105;
            g.fillStyle(0x272b2a).fillRect(x, y, 66, 54).lineStyle(2, 0x797766).strokeRect(x, y, 66, 54);
            g.fillStyle(0x61513a).fillRect(x + 9, y + 9, 13, 12).fillRect(x + 43, y + 9, 13, 12);
        }
        this.add.text(35, WORLD.height - 42, 'Phoenix Blaze • exploration map', { font: '14px Arial', fill: '#d8d1b3' }).setDepth(10);
    }

    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();
        const locations = [];
        for (let i = 0; i < 42; i += 1) locations.push([500 + (i % 7) * 125, 480 + Math.floor(i / 7) * 120]);
        for (let i = 0; i < 26; i += 1) locations.push([2500 + (i % 6) * 180, 500 + Math.floor(i / 6) * 220]);
        locations.forEach(([x, y], i) => {
            const object = this.add.rectangle(x, y, 30, 30, i % 2 ? 0x47633d : 0x635444).setDepth(2);
            this.physics.add.existing(object, true);
            this.obstacles.add(object);
        });
        this.physics.add.collider(this.player, this.obstacles);
    }

    createPickups() {
        const spawns = [
            [310, 260, 'scrap', 3], [460, 520, 'stick', 3], [620, 280, 'cannabis_flower', 2],
            [900, 600, 'cloth', 3], [1320, 390, 'water', 2], [1690, 1120, 'scrap', 4],
            [450, 1120, 'herb', 2], [1860, 460, 'bandage', 1], [1580, 1300, 'stick', 3],
            [3180, 500, 'cannabis_flower', 2], [3300, 2200, 'scrap', 4], [2800, 1860, 'water', 2]
        ];
        this.pickupGroup = this.physics.add.group();
        spawns.forEach(([x, y, itemId, amount]) => {
            const pickup = this.physics.add.image(x, y, 'pickup').setDepth(3);
            pickup.setData({ itemId, amount });
            pickup.body.setAllowGravity(false).setImmovable(true);
            this.pickupGroup.add(pickup);
        });
        this.physics.add.overlap(this.player, this.pickupGroup, (_, pickup) => this.collectPickup(pickup));
    }

    createEnemies() {
        this.zombieGroup = this.physics.add.group();
        const spawns = [[660,240],[1080,470],[1450,390],[1780,980],[340,1120],[1220,1250],[3000,480],[3300,760],[3000,2200],[3550,2380],[2420,1600],[2250,1900]];
        spawns.forEach(([x, y], index) => {
            const zombie = this.physics.add.sprite(x, y, 'zombie-idle-0').setDepth(4);
            zombie.health = 36;
            zombie.play('zombie-idle');
            this.enemyAI.initialize(zombie, index);
            this.zombieGroup.add(zombie);
            this.enemies.push(zombie);
        });
        this.physics.add.collider(this.player, this.zombieGroup);
    }

    createNPCs() {
        this.factionInfo = [
            { id: 'resistance', name: 'Resistance Scout', x: 260, y: 410, color: '#62a8ff', line: 'The outskirts need supplies. Can you help us?', quest: 'first-supplies' },
            { id: 'cultists', name: 'Green Remnant', x: 520, y: 1040, color: '#b28cff', line: 'We believe the changed can choose who they become.', quest: 'calm-the-hunger' }
        ];
        this.npcGroup = this.physics.add.group();
        this.factionInfo.forEach((faction) => {
            const npc = this.physics.add.sprite(faction.x, faction.y, 'npc').setDepth(4);
            npc.setData('factionId', faction.id);
            this.npcGroup.add(npc);
            this.npcs.push(npc);
            this.add.text(faction.x - 62, faction.y - 36, faction.name, { font: '12px Arial', fill: faction.color }).setDepth(8);
        });
        this.physics.add.collider(this.player, this.npcGroup);
    }

    createWorkbench() {
        this.station = this.physics.add.staticImage(360, 230, 'workbench').setDepth(3);
        this.add.text(320, 194, 'WORKBENCH', { font: '12px Arial', fill: '#ffe0a6' }).setDepth(8);
        this.physics.add.collider(this.player, this.station);
    }

    createMinimap() {
        this.minimap = this.add.graphics().setScrollFactor(0).setDepth(90);
        this.minimapPlayer = this.add.circle(0, 0, 3, 0xff5a24).setScrollFactor(0).setDepth(92);
        this.minimapBounds = { x: this.scale.width - 190, y: 18, w: 170, h: 124 };
    }

    updateMinimap() {
        const { x, y, w, h } = this.minimapBounds;
        const sx = w / WORLD.width;
        const sy = h / WORLD.height;
        this.minimap.clear().fillStyle(0x101710, 0.9).fillRoundedRect(x, y, w, h, 7).lineStyle(2, 0xaab99b).strokeRoundedRect(x, y, w, h, 7);
        this.worldProgress.getMapData().forEach((region) => {
            this.minimap.fillStyle(region.discovered ? 0x8bd169 : 0x596257).fillCircle(x + region.x * sx, y + region.y * sy, region.discovered ? 4 : 3);
        });
        this.minimapPlayer.setPosition(x + this.player.x * sx, y + this.player.y * sy);
    }

    createInput() {
        this.keys = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D', arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT', attack: 'SPACE', interact: 'E', craft: 'C', map: 'M', pause: 'ESC', journal: 'J', cannabis: 'V', upgrade: 'U', inventory: 'I' });
        this.keys.craft.on('down', () => this.events.emit('panel:craft'));
        this.keys.map.on('down', () => this.events.emit('panel:map'));
        this.keys.pause.on('down', () => this.events.emit('panel:pause'));
        this.keys.journal.on('down', () => this.events.emit('panel:journal'));
        this.keys.upgrade.on('down', () => this.events.emit('panel:upgrade'));
        this.keys.inventory.on('down', () => this.events.emit('panel:inventory'));
        this.keys.cannabis.on('down', () => this.consumeCannabis());
    }

    collectPickup(pickup) {
        if (!pickup.active) return;
        const { itemId, amount } = pickup.data.values;
        const result = this.inventorySystem.addItem(itemCatalog[itemId], amount);
        if (!result.success) return this.events.emit('notice', 'Inventory is full or too heavy.');
        this.quests.recordGather(itemId, amount);
        this.story.addEntry(`Found ${itemCatalog[itemId].name}`, `Collected ${amount} ${itemCatalog[itemId].name}.`);
        pickup.destroy();
        this.events.emit('notice', `Collected ${itemCatalog[itemId].name} x${amount}`);
        this.emitUpdate();
    }

    consumeCannabis() {
        const result = this.cannabisSystem.consume(this.inventorySystem, this.bloodlustSystem, 'cannabis_flower');
        if (!result.success) return this.events.emit('notice', result.message);
        this.story.addEntry('A moment of calm', result.message);
        this.events.emit('notice', result.message);
        this.audio?.play('calm');
        this.emitUpdate();
    }

    interact() {
        if (this.cooldowns.interact > 0) return;
        this.cooldowns.interact = 450;
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.station.x, this.station.y) < 105) return this.events.emit('panel:craft', { atStation: true });
        const npc = this.npcs.find((entry) => entry.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y) < 100);
        if (!npc) return this.events.emit('notice', 'Move close to a workbench or survivor and press E.');
        const faction = this.factionInfo.find((entry) => entry.id === npc.getData('factionId'));
        const quest = this.quests.quests.find((entry) => entry.id === faction.quest);
        this.events.emit('panel:dialogue', { faction, quest, reputation: this.factions.getReputation(faction.id) });
    }

    resolveQuest(faction, questId) {
        const quest = this.quests.quests.find((entry) => entry.id === questId);
        if (!quest) return;
        if (quest.progress >= quest.required && !quest.completed) {
            const reward = this.quests.complete(quest.id);
            if (reward) {
                this.inventorySystem.addItem(itemCatalog[reward.itemId], 1);
                this.worldProgress.addExperience(reward.xp);
                this.profile.awardExperience(reward.xp);
                this.profile.recordQuest();
                this.profile.save();
                this.factions.adjustReputation(faction.id, 10);
                this.story.recordChoice(`quest-${quest.id}`, 'completed');
                this.events.emit('notice', `Quest complete: ${quest.title} (+${reward.xp} XP)`);
            }
        } else if (!quest.accepted) {
            quest.accepted = true;
            this.factions.adjustReputation(faction.id, 1);
            this.story.addEntry('Quest accepted', quest.title);
        } else this.events.emit('notice', `${quest.title}: ${quest.progress}/${quest.required} ${quest.target}`);
        this.emitUpdate();
    }

    applyMoralChoice(factionId, choice) {
        const delta = { help: 2, truth: 3, threaten: -4, lie: -2 }[choice] || 0;
        this.factions.adjustReputation(factionId, delta);
        this.story.recordChoice(factionId, choice);
        this.events.emit('notice', `Choice recorded. ${factionId} standing: ${this.factions.getReputation(factionId)}`);
        this.emitUpdate();
    }

    trade(itemId, quantity = 1) {
        const price = { bandage: 2, water: 1, stick: 1 }[itemId];
        const salvage = this.inventorySystem.getItem('scrap');
        if (!price || !salvage || salvage.quantity < price * quantity) return false;
        this.inventorySystem.removeItem('scrap', price * quantity);
        const result = this.inventorySystem.addItem(itemCatalog[itemId], quantity);
        if (!result.success) {
            this.inventorySystem.addItem(itemCatalog.scrap, price * quantity);
            return false;
        }
        this.factions.adjustReputation('resistance', 1);
        this.emitUpdate();
        return true;
    }

    upgradeWeapon() {
        const result = this.equipmentSystem.upgradeWeapon(this.inventorySystem);
        this.events.emit('notice', result.message);
        this.emitUpdate();
        return result;
    }

    attack() {
        const target = this.enemies.filter((enemy) => enemy.active)
            .map((enemy) => ({ enemy, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) }))
            .filter(({ distance }) => distance < 76).sort((a, b) => a.distance - b.distance)[0]?.enemy;
        if (!target) return;
        const weapon = this.inventorySystem.getItem('spear');
        const strength = 8 + (this.characterData.skills?.includes('combat') ? 4 : 0);
        const result = this.combatSystem.resolveAttack({ strength }, { health: target.health, defense: 1 }, { accuracy: 1, weapon: weapon ? { damage: weapon.damage } : null });
        target.health -= result.damage;
        this.bloodlustSystem.bloodlustMeter = Math.min(100, this.bloodlustSystem.bloodlustMeter + 5);
        if (target.health <= 0) {
            target.destroy();
            this.enemies = this.enemies.filter((enemy) => enemy !== target);
            this.inventorySystem.addItem(itemCatalog.scrap, 1);
            this.worldProgress.addExperience(5);
            this.profile.awardExperience(5);
            this.audio?.play('hit');
            this.events.emit('notice', 'Infected defeated. Salvage recovered.');
        }
        this.emitUpdate();
    }

    snapshot() {
        return {
            character: this.characterData, health: this.state.health, stamina: this.state.stamina,
            bloodlust: this.bloodlustSystem.bloodlustMeter, bloodlustState: this.bloodlustSystem.state,
            inventory: this.inventorySystem.getAllItems(), quests: this.quests.getAvailable(), region: this.activeRegion,
            regions: this.worldProgress.getMapData(), level: this.worldProgress.level, experience: this.worldProgress.experience,
            factions: this.factions.getAll(), journal: this.story.journal, chapters: this.story.getChapters(), profile: this.profile.serialize()
        };
    }

    emitUpdate() { this.events.emit('hud:update', this.snapshot()); }

    saveGame(slot = 1) {
        const result = this.saveSystem.saveSlot(slot, {
            character: this.characterData, position: { x: this.player.x, y: this.player.y }, inventory: this.inventorySystem.getAllItems(),
            playerState: this.state, bloodlust: this.bloodlustSystem.bloodlustMeter, cannabis: this.cannabisSystem.serialize(),
            quests: this.quests.serialize(), discovered: this.worldProgress.serialize(), experience: this.worldProgress.experience,
            factions: this.factions.serialize(), story: this.story.serialize(), profile: this.profile.serialize()
        });
        if (result.success) this.profile.save();
        return result;
    }

    update(time, delta) {
        if (!this.player?.active || this.paused) return;
        const x = Number(this.keys.right.isDown || this.keys.arrowRight.isDown) - Number(this.keys.left.isDown || this.keys.arrowLeft.isDown);
        const y = Number(this.keys.down.isDown || this.keys.arrowDown.isDown) - Number(this.keys.up.isDown || this.keys.arrowUp.isDown);
        const length = Math.hypot(x, y) || 1;
        const speed = this.bloodlustSystem.getStateEffects().speedMultiplier * 175;
        this.player.setVelocity(x / length * speed, y / length * speed);
        this.player.play(x || y ? 'player-walk' : 'player-idle', true);
        if (Phaser.Input.Keyboard.JustDown(this.keys.attack) && this.cooldowns.attack <= 0) {
            this.attack(); this.cooldowns.attack = 420;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.interact();
        this.cooldowns.attack = Math.max(0, this.cooldowns.attack - delta);
        this.cooldowns.interact = Math.max(0, this.cooldowns.interact - delta);
        this.bloodlustSystem.update(delta);
        this.cannabisSystem.update(delta);
        this.enemies.forEach((enemy) => this.enemyAI.update(enemy, this.player, delta, this));
        const region = this.worldProgress.discoverAt(this.player.x, this.player.y);
        if (region) {
            this.activeRegion = region.id;
            this.profile.discover(region.id);
            this.profile.save();
            this.story.addEntry('Region discovered', `${region.name} — ${region.biome}`);
            this.events.emit('notice', `Discovered ${region.name} (${region.biome}).`);
        }
        const event = this.worldEvents.update(delta, this);
        if (event) this.events.emit('notice', event.message);
        this.updateMinimap();
        this.cooldowns.autosave += delta;
        if (this.cooldowns.autosave >= 30000) {
            this.cooldowns.autosave = 0;
            this.saveGame(1);
        }
        if (this.state.health <= 0) {
            this.state.health = 100;
            this.player.setPosition(180, 180);
            this.events.emit('notice', 'You were overwhelmed and woke at the outskirts.');
        }
        this.emitUpdate();
    }

    onShutdown() {
        this.audio?.destroy();
    }
}

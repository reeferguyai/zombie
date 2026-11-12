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
import { FactionSystem } from '../systems/FactionSystem.js';
import { WorldEventSystem } from '../systems/WorldEventSystem.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

const WORLD = { width: 2200, height: 1600, tile: 64 };

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.playerState = { health: 100, stamina: 100 };
        this.enemies = [];
        this.npcs = [];
        this.inventorySystem = new InventorySystem(24);
        this.bloodlustSystem = new BloodlustSystem();
        this.combatSystem = new CombatSystem();
        this.craftingSystem = new CraftingSystem();
        this.saveSystem = new SaveSystem();
        this.aiSystem = new AISystem();
        this.difficulty = 'normal';
        this.activeRegion = 'outskirts';
        this.attackCooldown = 0;
        this.interactCooldown = 0;
        this.autoSaveElapsed = 0;
    }

    create(data = {}) {
        this.characterData = data.characterData || PlayerDataManager.getCharacter() || { name: 'Survivor', skills: [] };
        this.difficulty = data.difficulty || localStorage.getItem('phoenix-blaze-difficulty') || 'normal';
        this.cameras.main.setBackgroundColor('#18251a');
        this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
        this.createTextures();
        this.createAnimations();
        this.drawWorld();

        const saved = data.loadSaved ? this.saveSystem.loadState() : { success: false };
        if (saved.success && saved.state.character) this.characterData = saved.state.character;
        if (saved.success && saved.state.inventory) this.inventorySystem.restore(saved.state.inventory);
        else starterInventory.forEach(({ id, quantity }) => this.inventorySystem.addItem(itemCatalog[id], quantity));
        if (saved.success) {
            this.playerState = { ...this.playerState, ...saved.state.playerState };
            this.bloodlustSystem.bloodlustMeter = saved.state.bloodlust || 0;
        }
        this.worldProgress = new WorldProgressionSystem(saved.success ? saved.state.discovered : {});
        this.worldProgress.experience = saved.success ? (saved.state.experience || 0) : 0;
        this.worldProgress.level = 1 + Math.floor(this.worldProgress.experience / 100);
        this.questSystem = new QuestSystem(saved.success ? saved.state.quests : {});
        this.factionSystem = new FactionSystem(saved.success ? saved.state.factions : {});
        this.worldEventSystem = new WorldEventSystem();

        const px = saved.success ? (saved.state.position?.x || 180) : 180;
        const py = saved.success ? (saved.state.position?.y || 180) : 180;
        this.player = this.physics.add.sprite(px, py, 'player-idle-0').setCollideWorldBounds(true).setDepth(5).setScale(1.3);
        this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.createObstacles();
        this.createPickups();
        this.createZombies();
        this.createNPCs();
        this.createCraftingStation();
        this.setupInput();
        this.createMinimap();
        this.scene.launch('UIScene', { gameScene: this });
        this.events.emit('hud:update', this.getSnapshot());
        if (data.loadSaved && !saved.success) this.events.emit('notice', 'No valid save found. Starting a new run.');
        this.events.emit('notice', `Difficulty: ${this.difficulty.toUpperCase()} • Find a workbench to craft.`);
    }

    createTextures() {
        const drawFrame = (key, bodyColor, accentColor, frame) => {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            const sway = frame ? 2 : 0;
            g.fillStyle(bodyColor).fillRoundedRect(4, 4 + sway, 24, 27, 7);
            g.fillStyle(accentColor).fillCircle(11, 12 + sway, 2).fillCircle(21, 12 + sway, 2);
            g.fillStyle(0x111111).fillRect(10, 22 + sway, 12, 3);
            g.fillStyle(bodyColor).fillRect(7, 27 + sway, 6, 5 - sway).fillRect(19, 27 + sway, 6, 5 + sway);
            g.generateTexture(key, 32, 34);
            g.destroy();
        };
        drawFrame('player-idle-0', 0x39a34a, 0x172317, 0);
        drawFrame('player-idle-1', 0x329344, 0x172317, 0);
        drawFrame('player-walk-0', 0x39ff14, 0x172317, 0);
        drawFrame('player-walk-1', 0x2fe60f, 0x172317, 1);
        drawFrame('zombie-idle-0', 0x9b332c, 0xd7b99a, 0);
        drawFrame('zombie-idle-1', 0x872b27, 0xd7b99a, 0);
        drawFrame('zombie-walk-0', 0xb23b32, 0xe0c2a2, 0);
        drawFrame('zombie-walk-1', 0x9e302b, 0xe0c2a2, 1);
        drawFrame('zombie-attack-0', 0xcf3a30, 0xffd0a6, 0);
        drawFrame('zombie-attack-1', 0xa92d28, 0xffd0a6, 1);
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xe4c76d).fillRoundedRect(5, 4, 22, 27, 7);
        g.fillStyle(0x2a2115).fillCircle(11, 12, 2).fillCircle(21, 12, 2);
        g.generateTexture('npc', 32, 34);
        g.clear(); g.fillStyle(0xbde66d).fillCircle(8, 8, 8); g.generateTexture('pickup', 16, 16);
        g.clear(); g.fillStyle(0x8c633d).fillRect(0, 9, 48, 30); g.fillStyle(0x5b412b).fillRect(4, 4, 40, 8); g.generateTexture('workbench', 48, 42);
        g.destroy();
    }

    createAnimations() {
        const add = (key, frames, rate, repeat = -1) => this.anims.create({ key, frames: frames.map((frame) => ({ key: frame })), frameRate: rate, repeat });
        add('player-idle', ['player-idle-0', 'player-idle-1'], 2);
        add('player-walk', ['player-walk-0', 'player-walk-1'], 7);
        add('zombie-idle', ['zombie-idle-0', 'zombie-idle-1'], 2);
        add('zombie-walk', ['zombie-walk-0', 'zombie-walk-1'], 5);
        add('zombie-attack', ['zombie-attack-0', 'zombie-attack-1'], 7);
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
        for (let i = 0; i < 17; i += 1) {
            const x = 820 + (i % 5) * 112; const y = 190 + Math.floor(i / 5) * 108;
            g.fillStyle(0x272b2a).fillRect(x, y, 68, 54); g.lineStyle(3, 0x757260).strokeRect(x, y, 68, 54);
            g.fillStyle(0x594a35).fillRect(x + 8, y + 9, 15, 13).fillRect(x + 43, y + 9, 15, 13);
        }
    }

    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();
        for (let i = 0; i < 24; i += 1) {
            const x = 380 + (i % 6) * 115; const y = 360 + Math.floor(i / 6) * 105;
            const block = this.add.rectangle(x, y, 30, 30, i % 2 ? 0x47633d : 0x635444).setDepth(2);
            this.physics.add.existing(block, true); this.obstacles.add(block);
        }
        this.physics.add.collider(this.player, this.obstacles);
    }

    createPickups() {
        const spawns = [[310,260,'scrap',2],[460,520,'stick',2],[620,280,'herb',1],[900,600,'cloth',2],[1320,390,'water',1],[1690,1120,'scrap',2],[450,1120,'herb',1],[1860,460,'bandage',1],[1580,1300,'stick',2]];
        this.pickupGroup = this.physics.add.group();
        spawns.forEach(([x,y,id,amount]) => {
            const pickup = this.physics.add.image(x,y,'pickup').setDepth(3); pickup.setData({itemId:id,amount});
            pickup.body.setAllowGravity(false).setImmovable(true); this.pickupGroup.add(pickup);
        });
        this.physics.add.overlap(this.player, this.pickupGroup, (_, pickup) => this.collectPickup(pickup));
    }

    createZombies() {
        this.zombieGroup = this.physics.add.group();
        [[660,240],[1080,470],[1450,390],[1780,980],[340,1120],[1220,1250]].forEach(([x,y],i) => {
            const zombie = this.physics.add.sprite(x,y,'zombie-idle-0').setDepth(4);
            zombie.health = 36; zombie.aiPhase = i * 0.7; zombie.aiState = 'idle'; zombie.attackTimer = 0;
            zombie.play('zombie-idle'); this.zombieGroup.add(zombie); this.enemies.push(zombie);
        });
        this.physics.add.collider(this.player, this.zombieGroup);
    }

    createNPCs() {
        this.factionInfo = [
            { id:'resistance',name:'Resistance Scout',x:260,y:410,color:'#62a8ff',line:'The outskirts need supplies. Can you help us?',quest:'first-supplies' },
            { id:'cultists',name:'Green Remnant',x:520,y:1040,color:'#b28cff',line:'We believe the changed can choose who they become.',quest:'calm-the-hunger' }
        ];
        this.npcGroup = this.physics.add.group();
        this.factionInfo.forEach((faction) => {
            const npc = this.physics.add.sprite(faction.x,faction.y,'npc').setDepth(4);
            npc.setData('factionId',faction.id); this.npcGroup.add(npc); this.npcs.push(npc);
            this.aiSystem.createNPC({id:faction.id,name:faction.name,faction:faction.id,behavior:'human',position:{x:faction.x,y:faction.y}});
            this.add.text(faction.x-62,faction.y-36,faction.name,{font:'12px Arial',fill:faction.color}).setDepth(8);
        });
        this.physics.add.collider(this.player,this.npcGroup);
    }

    createCraftingStation() {
        this.station = this.physics.add.staticImage(360, 230, 'workbench').setDepth(3).setData('stationId','outskirts-bench');
        this.add.text(320, 194, 'WORKBENCH', {font:'12px Arial',fill:'#ffe0a6'}).setDepth(8);
        this.physics.add.collider(this.player, this.station);
    }

    createMinimap() {
        this.minimap = this.add.graphics().setScrollFactor(0).setDepth(90);
        this.minimapPlayer = this.add.circle(0,0,3,0xff5a24).setScrollFactor(0).setDepth(92);
        this.minimapBounds = { x: this.scale.width - 190, y: 18, w: 170, h: 124 };
    }

    drawMinimap() {
        const {x,y,w,h} = this.minimapBounds; const sx = w / WORLD.width; const sy = h / WORLD.height;
        this.minimap.clear(); this.minimap.fillStyle(0x101710,0.88).fillRoundedRect(x,y,w,h,7).lineStyle(2,0xaab99b).strokeRoundedRect(x,y,w,h,7);
        this.minimap.fillStyle(0x52534e).fillRect(x + 960*sx,y,190*sx,h).fillRect(x,y + 690*sy,w,190*sy);
        this.worldProgress.getMapData().forEach((region) => {
            const marker = { outskirts:[240,260], downtown:[1060,280], greenbelt:[420,1040], industrial:[1540,1020] }[region.id];
            this.minimap.fillStyle(region.discovered ? 0x8bd169 : 0x596257).fillCircle(x + marker[0]*sx,y + marker[1]*sy,region.discovered?4:3);
        });
        this.minimapPlayer.setPosition(x + this.player.x*sx,y + this.player.y*sy);
    }

    setupInput() {
        this.keys = this.input.keyboard.addKeys({up:'W',down:'S',left:'A',right:'D',arrowUp:'UP',arrowDown:'DOWN',arrowLeft:'LEFT',arrowRight:'RIGHT',attack:'SPACE',interact:'E',craft:'C',map:'M',pause:'ESC'});
        this.keys.craft.on('down', () => this.events.emit('panel:craft'));
        this.keys.map.on('down', () => this.events.emit('panel:map'));
        this.keys.pause.on('down', () => this.events.emit('panel:pause'));
    }

    collectPickup(pickup) {
        if (!pickup.active) return;
        const {itemId,amount} = pickup.data.values;
        const result = this.inventorySystem.addItem(itemCatalog[itemId],amount);
        if (!result.success) { this.events.emit('notice','Inventory is full or too heavy.'); return; }
        this.questSystem.recordGather(itemId,amount); pickup.destroy();
        this.events.emit('notice',`Collected ${itemCatalog[itemId].name} x${amount}`); this.emitUpdate();
    }

    interact() {
        if (this.interactCooldown > 0) return;
        this.interactCooldown = 450;
        if (Phaser.Math.Distance.Between(this.player.x,this.player.y,this.station.x,this.station.y) < 105) {
            this.events.emit('panel:craft', {atStation:true}); return;
        }
        const nearest = this.npcs.filter((npc)=>npc.active && Phaser.Math.Distance.Between(this.player.x,this.player.y,npc.x,npc.y)<100)
            .sort((a,b)=>Phaser.Math.Distance.Between(this.player.x,this.player.y,a.x,a.y)-Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y))[0];
        if (nearest) {
            const faction = this.factionInfo.find((entry)=>entry.id===nearest.getData('factionId'));
            const quest = this.questSystem.quests.find((entry)=>entry.id===faction.quest);
            this.events.emit('panel:dialogue',{faction,quest,reputation:this.factionSystem.getReputation(faction.id)}); return;
        }
        this.events.emit('notice','Move close to a workbench or survivor and press E.');
    }

    resolveQuest(faction, questId) {
        const quest = this.questSystem.quests.find((entry)=>entry.id===questId);
        if (!quest) return;
        if (quest.progress >= quest.required && !quest.completed) {
            const reward = this.questSystem.complete(quest.id);
            if (reward) {
                this.inventorySystem.addItem(itemCatalog[reward.itemId],1); this.worldProgress.addExperience(reward.xp);
                this.factionSystem.adjustReputation(faction.id,10); this.events.emit('notice',`Quest complete: ${quest.title} (+${reward.xp} XP)`);
            }
        } else if (!quest.accepted) {
            quest.accepted = true; this.factionSystem.adjustReputation(faction.id,1);
            this.events.emit('notice',`Accepted: ${quest.title}`);
        } else this.events.emit('notice',`${quest.title}: ${quest.progress}/${quest.required} ${quest.target}`);
        this.emitUpdate();
    }

    applyMoralChoice(factionId, choice) {
        const deltas = {help:2,truth:3,threaten:-4,lie:-2};
        this.factionSystem.adjustReputation(factionId,deltas[choice] || 0);
        this.events.emit('notice',`Choice recorded. ${factionId} reputation: ${this.factionSystem.getReputation(factionId)}`);
        this.emitUpdate();
    }

    trade(itemId, quantity = 1) {
        const price = {bandage:2,water:1,stick:1}[itemId];
        const currency = this.inventorySystem.getItem('scrap');
        if (!price || !currency || currency.quantity < price*quantity) { this.events.emit('notice','Trade needs more salvage.'); return false; }
        if (!this.inventorySystem.removeItem('scrap',price*quantity)) return false;
        const result = this.inventorySystem.addItem(itemCatalog[itemId],quantity);
        if (!result.success) { this.inventorySystem.addItem(itemCatalog.scrap,price*quantity); this.events.emit('notice','Inventory full; trade cancelled.'); return false; }
        this.factionSystem.adjustReputation('resistance',1);
        this.events.emit('notice',`Traded ${price*quantity} salvage for ${itemCatalog[itemId].name}.`); this.emitUpdate(); return true;
    }

    attack() {
        const target = this.enemies.filter((enemy)=>enemy.active).map((enemy)=>({enemy,distance:Phaser.Math.Distance.Between(this.player.x,this.player.y,enemy.x,enemy.y)})).filter(({distance})=>distance<76).sort((a,b)=>a.distance-b.distance)[0]?.enemy;
        if (!target) return;
        const weapon = this.inventorySystem.getItem('spear');
        const strength = 8 + (this.characterData.skills?.includes('combat')?4:0);
        const result = this.combatSystem.resolveAttack({strength},{health:target.health,defense:1},{accuracy:1,weapon:weapon?itemCatalog.spear:null});
        target.health -= result.damage; this.bloodlustSystem.bloodlustMeter = Math.min(100,this.bloodlustSystem.bloodlustMeter+5);
        if (target.health<=0) { target.destroy(); this.enemies=this.enemies.filter((enemy)=>enemy!==target); this.inventorySystem.addItem(itemCatalog.scrap,1); this.events.emit('notice','Zombie defeated. Salvage recovered.'); }
        this.emitUpdate();
    }

    getSnapshot() {
        return {character:this.characterData,health:this.playerState.health,bloodlust:this.bloodlustSystem.bloodlustMeter,bloodlustState:this.bloodlustSystem.state,
            inventory:this.inventorySystem.getAllItems(),quests:this.questSystem.getAvailable(),region:this.activeRegion,regions:this.worldProgress.getMapData(),
            level:this.worldProgress.level,experience:this.worldProgress.experience,factions:this.factionSystem.getAll()};
    }

    emitUpdate() { this.events.emit('hud:update',this.getSnapshot()); }

    saveGame() {
        const result = this.saveSystem.saveState({character:this.characterData,position:{x:this.player.x,y:this.player.y},inventory:this.inventorySystem.getAllItems(),playerState:this.playerState,
            bloodlust:this.bloodlustSystem.bloodlustMeter,quests:this.questSystem.serialize(),discovered:this.worldProgress.serialize(),experience:this.worldProgress.experience,factions:this.factionSystem.serialize()});
        this.events.emit('notice',result.success?'Game saved.':`Save failed: ${result.error}`); return result;
    }

    update(time, delta) {
        if (!this.player?.active) return;
        const moveX=Number(this.keys.right.isDown||this.keys.arrowRight.isDown)-Number(this.keys.left.isDown||this.keys.arrowLeft.isDown);
        const moveY=Number(this.keys.down.isDown||this.keys.arrowDown.isDown)-Number(this.keys.up.isDown||this.keys.arrowUp.isDown);
        const magnitude=Math.hypot(moveX,moveY)||1; const speed=this.bloodlustSystem.getStateEffects().speedMultiplier*175;
        this.player.setVelocity(moveX/magnitude*speed,moveY/magnitude*speed);
        this.player.play(moveX||moveY?'player-walk':'player-idle',true);
        if (Phaser.Input.Keyboard.JustDown(this.keys.attack)&&this.attackCooldown<=0) { this.attack(); this.attackCooldown=400; }
        if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.interact();
        this.attackCooldown=Math.max(0,this.attackCooldown-delta); this.interactCooldown=Math.max(0,this.interactCooldown-delta);
        this.bloodlustSystem.update(delta);

        this.enemies.forEach((enemy)=>{
            if (!enemy.active) return;
            const distance=Phaser.Math.Distance.Between(enemy.x,enemy.y,this.player.x,this.player.y);
            const difficultyScale={easy:0.65,normal:1,hard:1.45}[this.difficulty]||1;
            if (distance<44) {
                enemy.aiState='attack'; enemy.setVelocity(0,0); enemy.play('zombie-attack',true); enemy.attackTimer=(enemy.attackTimer||0)-delta;
                if(enemy.attackTimer<=0){this.playerState.health=Math.max(0,this.playerState.health-5*difficultyScale);enemy.attackTimer=950;}
            } else if(distance<300) { enemy.aiState='chase'; this.physics.moveToObject(enemy,this.player,48*difficultyScale); enemy.play('zombie-walk',true); }
            else if(Math.sin(time/1300+enemy.aiPhase)>0.97) { enemy.aiState='wander'; enemy.setVelocity(Phaser.Math.Between(-35,35),Phaser.Math.Between(-35,35)); enemy.play('zombie-walk',true); }
            else { enemy.aiState='idle'; enemy.setVelocity(0,0); enemy.play('zombie-idle',true); }
        });

        const discovered=this.worldProgress.discoverAt(this.player.x,this.player.y);
        if(discovered){this.activeRegion=discovered.id;this.events.emit('notice',`Region discovered: ${discovered.name} (+${discovered.xp||10} XP)`);}
        const event=this.worldEventSystem.update(delta,this);
        if(event)this.events.emit('notice',event.message);
        this.drawMinimap(); this.autoSaveElapsed+=delta;
        if(this.autoSaveElapsed>=30000){this.autoSaveElapsed=0;this.saveGame();}
        if(this.playerState.health<=0){this.playerState.health=100;this.player.setPosition(180,180);this.events.emit('notice','You were overwhelmed and woke at the outskirts.');}
        this.emitUpdate();
    }
}

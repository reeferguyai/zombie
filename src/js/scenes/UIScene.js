import Phaser from 'phaser';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.gameScene=null; this.panel=null; this.craftingSystem=new CraftingSystem(); this.saveSystem=new SaveSystem();
    }

    create(data={}) {
        this.gameScene=data.gameScene;
        this.hud=this.add.text(18,16,'',{font:'15px Arial',fill:'#eaffdf',backgroundColor:'#101810cc',padding:{x:10,y:8},stroke:'#080808',strokeThickness:3}).setScrollFactor(0).setDepth(100);
        this.help=this.add.text(18,58,'WASD move • Space attack • E talk/trade • C craft • M map • Esc pause',{font:'13px Arial',fill:'#e3e6dd',backgroundColor:'#101810aa',padding:{x:8,y:5}}).setScrollFactor(0).setDepth(100);
        this.noticeText=this.add.text(640,104,'',{font:'16px Arial',fill:'#fff',backgroundColor:'#17251a',padding:{x:12,y:8},align:'center',wordWrap:{width:700}}).setOrigin(.5).setScrollFactor(0).setDepth(120);
        this.panel=this.add.container(0,0).setScrollFactor(0).setDepth(110).setVisible(false);
        this.gameScene.events.on('hud:update',this.updateHud,this); this.gameScene.events.on('notice',this.showNotice,this);
        this.gameScene.events.on('panel:craft',this.showCrafting,this); this.gameScene.events.on('panel:map',this.showMap,this); this.gameScene.events.on('panel:pause',this.showPause,this);
        this.gameScene.events.on('panel:dialogue',this.showDialogue,this); this.updateHud(this.gameScene.getSnapshot());
        this.input.keyboard.on('keydown-ESC',()=>{if(!this.panel.visible)this.showPause();else this.closePanel();});
    }

    updateHud(state){this.hud.setText(`${state.character?.name||'Survivor'} | HP ${Math.ceil(state.health)} | Bloodlust ${Math.ceil(state.bloodlust)}% (${state.bloodlustState}) | ${state.region} | Lv ${state.level} ${state.experience} XP`);}
    showNotice(message){this.noticeText.setText(message).setAlpha(1);this.tweens.killTweensOf(this.noticeText);this.tweens.add({targets:this.noticeText,alpha:0,delay:2200,duration:500});}
    clearPanel(){this.panel.removeAll(true);this.panel.setVisible(true);this.panel.add(this.add.rectangle(640,360,660,540,0x101710,.98).setStrokeStyle(3,0xff5a24));}
    addText(x,y,text,style={}){const object=this.add.text(x,y,text,{font:'17px Arial',fill:'#eef3e8',...style});this.panel.add(object);return object;}
    addButton(x,y,text,action,width=400){const bg=this.add.rectangle(x,y,width,42,0x263628).setStrokeStyle(1,0x8ea17f).setInteractive({useHandCursor:true});const label=this.add.text(x,y,text,{font:'15px Arial',fill:'#fff',align:'center',wordWrap:{width:width-18}}).setOrigin(.5);bg.on('pointerover',()=>bg.setFillStyle(0x3a523b));bg.on('pointerout',()=>bg.setFillStyle(0x263628));bg.on('pointerdown',action);label.setInteractive({useHandCursor:true}).on('pointerdown',action);this.panel.add([bg,label]);}

    showCrafting(data={}){
        this.clearPanel();const atStation=Boolean(data.atStation)||Phaser.Math.Distance.Between(this.gameScene.player.x,this.gameScene.player.y,this.gameScene.station.x,this.gameScene.station.y)<105;
        this.addText(640,120,atStation?'WORKBENCH CRAFTING':'CRAFTING STATION REQUIRED',{font:'bold 26px Arial',fill:'#ff7040'}).setOrigin(.5);
        this.addText(640,154,atStation?'Choose a recipe; materials are deducted on success.':'Use E beside the marked workbench to access recipes.',{font:'14px Arial'}).setOrigin(.5);
        if(atStation)this.craftingSystem.getAllRecipes().forEach((recipe,index)=>{const ingredients=Object.entries(recipe.ingredients).map(([id,q])=>`${q} ${id}`).join(' + ');const available=this.craftingSystem.canCraft(recipe.id,this.gameScene.inventorySystem);this.addButton(640,210+index*58,`${available?'✓':'·'} ${recipe.name}: ${ingredients}`,()=>{const crafted=this.craftingSystem.craft(recipe.id,this.gameScene.inventorySystem);if(crafted){this.showNotice(`Crafted ${crafted.name}`);this.gameScene.emitUpdate();this.showCrafting({atStation:true});}else this.showNotice('Missing ingredients or inventory capacity.');},510);});
        this.addButton(640,490,'Close [Esc]',()=>this.closePanel());
    }

    showDialogue({faction,quest,reputation}){
        this.clearPanel();this.addText(640,120,faction.name,{font:'bold 26px Arial',fill:faction.color}).setOrigin(.5);
        this.addText(640,158,faction.line,{font:'15px Arial',align:'center',wordWrap:{width:520}}).setOrigin(.5);
        this.addText(640,194,`Faction standing: ${reputation}`,{font:'14px Arial',fill:'#d9c681'}).setOrigin(.5);
        const status=quest.completed?'Complete':`${quest.progress}/${quest.required} ${quest.target}`;
        this.addText(640,226,`${quest.title} — ${status}\n${quest.description}`,{font:'14px Arial',align:'center',wordWrap:{width:520}}).setOrigin(.5);
        this.addButton(640,300,quest.accepted?'Check quest progress':'Accept quest',()=>{this.gameScene.resolveQuest(faction,quest.id);this.closePanel();});
        this.addButton(640,352,'Trade: 2 salvage → bandage',()=>this.gameScene.trade('bandage',1));
        this.addButton(640,404,'Help them (+2 standing)',()=>{this.gameScene.applyMoralChoice(faction.id,'help');this.closePanel();});
        this.addButton(640,456,'Threaten them (-4 standing)',()=>{this.gameScene.applyMoralChoice(faction.id,'threaten');this.closePanel();});
        this.addButton(640,508,'Leave',()=>this.closePanel());
    }

    showMap(){
        this.clearPanel();this.addText(640,112,'REGION MAP',{font:'bold 27px Arial',fill:'#ff7040'}).setOrigin(.5);
        this.add.rectangle(640,310,500,310,0x293d2d).setStrokeStyle(2,0x9eae8d).setScrollFactor(0).setDepth(110).setData('panelmap',true);
        const positions={outskirts:[470,230],downtown:[760,230],greenbelt:[470,390],industrial:[760,390]};
        this.gameScene.worldProgress.getMapData().forEach((region)=>{const [x,y]=positions[region.id];const mark=this.add.rectangle(x,y,130,64,region.discovered?0x8bd169:0x535b50,.9).setStrokeStyle(2,region.id===this.gameScene.activeRegion?0xff5a24:0xb7c5aa);this.panel.add(mark);this.addText(x,y,region.discovered?region.name:'Unknown',{font:'13px Arial',align:'center',wordWrap:{width:120}}).setOrigin(.5);});
        this.addText(640,475,'Explore new regions to reveal them and earn experience.',{font:'14px Arial'}).setOrigin(.5);this.addButton(640,520,'Close [M / Esc]',()=>this.closePanel());
    }

    showPause(){this.clearPanel();this.addText(640,135,'PAUSED',{font:'bold 30px Arial',fill:'#ff7040'}).setOrigin(.5);this.addButton(640,210,'Resume',()=>this.closePanel());this.addButton(640,264,'Save Game',()=>this.gameScene.saveGame());this.addButton(640,318,'Load Last Save',()=>this.loadSave());this.addButton(640,372,'Crafting',()=>this.showCrafting());this.addButton(640,426,'Return to Title',()=>{this.gameScene.saveGame();this.scene.stop('GameScene');this.scene.stop('UIScene');this.scene.start('TitleMenuScene');});}
    loadSave(){const result=this.saveSystem.loadState();if(!result.success){this.showNotice('No valid save is available.');return;}this.scene.stop('UIScene');this.gameScene.scene.restart({characterData:result.state.character,loadSaved:true});}
    closePanel(){this.panel.setVisible(false);this.panel.removeAll(true);}
    shutdown(){if(this.gameScene){this.gameScene.events.off('hud:update',this.updateHud,this);this.gameScene.events.off('notice',this.showNotice,this);}}
}

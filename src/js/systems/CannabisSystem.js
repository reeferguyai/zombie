export class CannabisSystem {
    constructor() { this.activeEffectMs=0;this.effectStrength=0; }
    consume(inventory,bloodlustSystem,itemId='cannabis_flower') {
        if(!inventory.getItem(itemId)||!inventory.removeItem(itemId,1))return{success:false,message:'No fictional calming blend available.'};
        const reduction=itemId==='calming_tonic'?35:22;bloodlustSystem.bloodlustMeter=Math.max(0,bloodlustSystem.bloodlustMeter-reduction);bloodlustSystem.updateState();this.activeEffectMs=30000;this.effectStrength=.12;return{success:true,reduction,message:'The fictional Emberleaf blend eases bloodlust and briefly steadies your senses.'};
    }
    update(delta){this.activeEffectMs=Math.max(0,this.activeEffectMs-delta);}
    getStealthBonus(){return this.activeEffectMs>0?this.effectStrength:0;}
    serialize(){return{activeEffectMs:this.activeEffectMs,effectStrength:this.effectStrength};}
    restore(data={}){this.activeEffectMs=Number(data.activeEffectMs)||0;this.effectStrength=Number(data.effectStrength)||0;}
}

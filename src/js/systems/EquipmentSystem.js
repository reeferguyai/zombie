export class EquipmentSystem {
    upgradeWeapon(inventory,weaponId='spear') {
        const weapon=inventory.getItem(weaponId),scrap=inventory.getItem('scrap');
        if(!weapon)return{success:false,message:'You need a weapon first.'};
        const level=Number(weapon.upgradeLevel)||0;if(level>=3)return{success:false,message:'This weapon is fully upgraded.'};
        const cost=(level+1)*3;if(!scrap||scrap.quantity<cost)return{success:false,message:`Upgrade requires ${cost} salvage.`};
        inventory.removeItem('scrap',cost);weapon.upgradeLevel=level+1;weapon.damage=(Number(weapon.damage)||10)+5;weapon.name=`Scrap Spear +${weapon.upgradeLevel}`;return{success:true,message:`${weapon.name}: damage increased.`,cost};
    }
    getWeaponDamage(inventory,id){return Number(inventory.getItem(id)?.damage)||0;}
}

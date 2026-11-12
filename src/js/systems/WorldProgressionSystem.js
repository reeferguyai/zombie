const REGIONS = [
    {id:'outskirts',name:'Overgrown Outskirts',x:300,y:320,radius:430,xp:0,biome:'Temperate ruins'},
    {id:'downtown',name:'Ruined Downtown',x:1350,y:330,radius:470,xp:25,biome:'Urban'},
    {id:'greenbelt',name:'Deep Greenbelt',x:400,y:1320,radius:460,xp:35,biome:'Forest'},
    {id:'industrial',name:'Industrial Quarter',x:1900,y:1320,radius:480,xp:50,biome:'Industrial'},
    {id:'wetlands',name:'Flooded Wetlands',x:3100,y:400,radius:500,xp:65,biome:'Wetland'},
    {id:'highlands',name:'Ashen Highlands',x:3100,y:2100,radius:520,xp:80,biome:'Highland'}
];

export class WorldProgressionSystem {
    constructor(saved={}) { this.regions=REGIONS.map((region)=>({...region,discovered:Boolean(saved[region.id])}));this.experience=0;this.level=1; }
    discoverAt(x,y) { const region=this.regions.find((entry)=>!entry.discovered&&Math.hypot(entry.x-x,entry.y-y)<entry.radius);if(!region)return null;region.discovered=true;this.addExperience(region.xp||10);return region; }
    addExperience(amount) { this.experience+=Math.max(0,amount);this.level=1+Math.floor(this.experience/100); }
    serialize() { return Object.fromEntries(this.regions.map(({id,discovered})=>[id,discovered])); }
    getMapData() { return this.regions.map(({id,name,x,y,discovered,biome})=>({id,name,x,y,discovered,biome})); }
}

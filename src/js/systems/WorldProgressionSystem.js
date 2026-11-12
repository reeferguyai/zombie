const REGIONS = [
    { id: 'outskirts', name: 'Overgrown Outskirts', x: 240, y: 260, radius: 390, xp: 0 },
    { id: 'downtown', name: 'Ruined Downtown', x: 1060, y: 280, radius: 420, xp: 25 },
    { id: 'greenbelt', name: 'Deep Greenbelt', x: 420, y: 1040, radius: 410, xp: 35 },
    { id: 'industrial', name: 'Industrial Quarter', x: 1540, y: 1020, radius: 430, xp: 50 }
];

export class WorldProgressionSystem {
    constructor(saved = {}) {
        this.regions = REGIONS.map((region) => ({ ...region, discovered: Boolean(saved[region.id]) }));
        this.experience = 0;
        this.level = 1;
    }

    discoverAt(x, y) {
        const region = this.regions.find((entry) =>
            !entry.discovered && Math.hypot(entry.x - x, entry.y - y) < entry.radius
        );
        if (!region) return null;
        region.discovered = true;
        this.addExperience(region.xp || 10);
        return region;
    }

    addExperience(amount) {
        this.experience += Math.max(0, amount);
        this.level = 1 + Math.floor(this.experience / 100);
    }

    serialize() {
        return Object.fromEntries(this.regions.map(({ id, discovered }) => [id, discovered]));
    }

    getMapData() {
        return this.regions.map(({ id, name, x, y, discovered }) => ({ id, name, x, y, discovered }));
    }
}

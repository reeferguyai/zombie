export class FactionSystem {
    constructor(saved = {}) {
        this.factions = {
            resistance: { name: 'The Resistance', reputation: Number(saved.resistance) || 0, alignment: 'humanity' },
            cultists: { name: 'Green Remnant', reputation: Number(saved.cultists) || 0, alignment: 'transformation' },
            scavengers: { name: 'The Scavengers', reputation: Number(saved.scavengers) || 0, alignment: 'self-interest' }
        };
    }

    adjustReputation(id, amount) {
        const faction = this.factions[id];
        if (!faction) return null;
        faction.reputation = Math.max(-100, Math.min(100, faction.reputation + amount));
        return faction.reputation;
    }

    getReputation(id) { return this.factions[id]?.reputation ?? 0; }
    getAll() { return Object.entries(this.factions).map(([id, faction]) => ({ id, ...faction })); }
    serialize() { return Object.fromEntries(Object.entries(this.factions).map(([id, faction]) => [id, faction.reputation])); }
}

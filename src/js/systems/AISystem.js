/**
 * AI System
 * Manages NPC behavior and AI-driven interactions
 */

export class AISystem {
    constructor() {
        this.npcs = [];
        this.factions = new Map();
        this.initializeFactions();
    }

    initializeFactions() {
        this.factions.set('resistance', {
            name: 'The Resistance',
            alignment: 'helpful',
            description: 'Survivors fighting against the outbreak'
        });
        this.factions.set('scavengers', {
            name: 'The Scavengers',
            alignment: 'hostile',
            description: 'Ruthless survivors looking for resources'
        });
        this.factions.set('cultists', {
            name: 'The Cultists',
            alignment: 'chaotic',
            description: 'Humans embracing the zombie transformation'
        });
    }

    /**
     * Create an NPC with AI
     * @param {Object} config - NPC configuration
     */
    createNPC(config) {
        const npc = {
            id: config.id,
            name: config.name,
            faction: config.faction,
            health: config.health || 50,
            state: 'idle', // idle, patrol, pursue, attack
            position: config.position,
            behaviorTree: this.buildBehaviorTree(config.behavior),
            relationships: new Map(),
            inventory: []
        };
        
        this.npcs.push(npc);
        return npc;
    }

    /**
     * Build behavior tree for NPC
     * @param {string} behavior - Behavior type
     */
    buildBehaviorTree(behavior) {
        const trees = {
            zombie: {
                root: 'zombieBehavior',
                nodes: [
                    { id: 'zombieBehavior', type: 'selector' },
                    { id: 'search', type: 'search_for_prey' },
                    { id: 'patrol', type: 'patrol' }
                ]
            },
            human: {
                root: 'humanBehavior',
                nodes: [
                    { id: 'humanBehavior', type: 'selector' },
                    { id: 'flee', type: 'flee_from_threat' },
                    { id: 'trade', type: 'trade_with_player' },
                    { id: 'patrol', type: 'patrol' }
                ]
            }
        };
        return trees[behavior] || trees.zombie;
    }

    /**
     * Update all NPCs
     * @param {number} delta - Time elapsed in milliseconds
     */
    updateAllNPCs(delta) {
        this.npcs.forEach(npc => {
            this.updateNPC(npc, delta);
        });
    }

    /**
     * Update individual NPC
     * @param {Object} npc - NPC to update
     * @param {number} delta - Time elapsed
     */
    updateNPC(npc, delta) {
        // Execute behavior tree
        // Update state based on surroundings
        // Handle interactions
    }
}
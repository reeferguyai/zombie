/**
 * Resource Gathering System
 * Handles collection and management of resources from the environment
 */

export class ResourceGatheringSystem {
    constructor() {
        this.resources = new Map();
        this.gatheringLocations = [];
        this.initializeResources();
    }

    initializeResources() {
        // Basic resources
        this.resources.set('stick', {
            id: 'stick',
            name: 'Stick',
            weight: 0.5,
            rarity: 'common',
            locations: ['forest', 'ruins'],
            gatherTool: 'hands',
            gatherTime: 3
        });

        this.resources.set('stone', {
            id: 'stone',
            name: 'Stone',
            weight: 2,
            rarity: 'common',
            locations: ['mountain', 'beach'],
            gatherTool: 'pickaxe',
            gatherTime: 5
        });

        this.resources.set('hemp', {
            id: 'hemp',
            name: 'Hemp Plant',
            weight: 1,
            rarity: 'common',
            locations: ['forest', 'field'],
            gatherTool: 'hands',
            gatherTime: 4
        });

        this.resources.set('cannabis-flower', {
            id: 'cannabis-flower',
            name: 'Cannabis Flower',
            weight: 0.2,
            rarity: 'uncommon',
            locations: ['field'],
            gatherTool: 'hands',
            gatherTime: 6
        });

        this.resources.set('grass', {
            id: 'grass',
            name: 'Grass',
            weight: 0.1,
            rarity: 'common',
            locations: ['field', 'forest'],
            gatherTool: 'hands',
            gatherTime: 2
        });
    }

    /**
     * Gather a resource
     * @param {string} resourceId - Resource to gather
     * @param {Object} gatherTool - Tool being used
     */
    gatherResource(resourceId, gatherTool = null) {
        const resource = this.resources.get(resourceId);
        if (!resource) return null;

        // Check if tool is appropriate
        if (gatherTool && gatherTool.type !== resource.gatherTool) {
            return {
                success: false,
                message: `Need ${resource.gatherTool} to gather this resource`
            };
        }

        return {
            success: true,
            resource: resource,
            gatherTime: resource.gatherTime,
            quantity: this.calculateQuantity(resource.rarity)
        };
    }

    /**
     * Calculate quantity based on rarity
     * @param {string} rarity - Resource rarity
     */
    calculateQuantity(rarity) {
        const quantities = {
            'common': Math.floor(Math.random() * 3) + 2,
            'uncommon': Math.floor(Math.random() * 2) + 1,
            'rare': 1
        };
        return quantities[rarity] || 1;
    }

    /**
     * Get all available resources
     */
    getAllResources() {
        return Array.from(this.resources.values());
    }
}
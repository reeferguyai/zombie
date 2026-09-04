/**
 * Inventory System
 * Manages player items, resources, and equipment
 */

export class InventorySystem {
    constructor(maxSlots = 20) {
        this.maxSlots = maxSlots;
        this.items = [];
        this.weight = 0;
        this.maxWeight = 50; // kg
    }

    /**
     * Add an item to inventory
     * @param {Object} item - Item to add
     * @param {number} quantity - Quantity to add
     */
    addItem(item, quantity = 1) {
        // Check if item already exists
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...item,
                quantity
            });
        }

        this.weight += (item.weight || 0) * quantity;
        return this.canCarry();
    }

    /**
     * Remove an item from inventory
     * @param {string} itemId - Item ID to remove
     * @param {number} quantity - Quantity to remove
     */
    removeItem(itemId, quantity = 1) {
        const item = this.items.find(i => i.id === itemId);
        
        if (!item) return false;
        
        item.quantity -= quantity;
        if (item.quantity <= 0) {
            this.items = this.items.filter(i => i.id !== itemId);
        }
        
        this.weight -= (item.weight || 0) * quantity;
        return true;
    }

    /**
     * Check if inventory can carry more items
     */
    canCarry() {
        return this.weight <= this.maxWeight && this.items.length < this.maxSlots;
    }

    /**
     * Get item by ID
     * @param {string} itemId - Item ID
     */
    getItem(itemId) {
        return this.items.find(i => i.id === itemId);
    }

    /**
     * Get all items
     */
    getAllItems() {
        return this.items;
    }

    /**
     * Clear inventory
     */
    clear() {
        this.items = [];
        this.weight = 0;
    }
}
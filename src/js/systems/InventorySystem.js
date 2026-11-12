export class InventorySystem {
    constructor(maxSlots = 20, maxWeight = 50) {
        this.maxSlots = maxSlots;
        this.maxWeight = maxWeight;
        this.items = [];
        this.weight = 0;
    }

    addItem(item, quantity = 1) {
        if (!item || typeof item.id !== 'string' || !Number.isInteger(quantity) || quantity <= 0) {
            return { success: false, reason: 'invalid' };
        }
        const existing = this.items.find((entry) => entry.id === item.id);
        const addedWeight = (Number(item.weight) || 0) * quantity;
        if ((!existing && this.items.length >= this.maxSlots) || this.weight + addedWeight > this.maxWeight) {
            return { success: false, reason: 'capacity' };
        }
        if (existing) existing.quantity += quantity;
        else this.items.push({ ...item, quantity });
        this.weight += addedWeight;
        return { success: true, canCarry: this.canCarry() };
    }

    removeItem(itemId, quantity = 1) {
        const item = this.items.find((entry) => entry.id === itemId);
        if (!item || !Number.isInteger(quantity) || quantity <= 0 || item.quantity < quantity) return false;
        item.quantity -= quantity;
        this.weight = Math.max(0, this.weight - (Number(item.weight) || 0) * quantity);
        if (item.quantity === 0) this.items = this.items.filter((entry) => entry.id !== itemId);
        return true;
    }

    canCarry() {
        return this.weight <= this.maxWeight && (this.items.length < this.maxSlots || this.items.length === 0);
    }

    getItem(itemId) {
        return this.items.find((item) => item.id === itemId);
    }

    getAllItems() {
        return this.items.map((item) => ({ ...item }));
    }

    restore(items = []) {
        this.clear();
        items.forEach((item) => this.addItem(item, item.quantity));
    }

    clear() {
        this.items = [];
        this.weight = 0;
    }
}

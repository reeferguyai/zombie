import { itemCatalog } from '../data/items.js';

export class CraftingSystem {
    constructor() {
        this.recipes = [
            { id: 'rope', name: 'Twisted Rope', description: 'A simple length of rope.', ingredients: { cloth: 2 }, output: { id: 'rope', quantity: 1 } },
            { id: 'spear', name: 'Scrap Spear', description: 'A basic weapon for staying safe.', ingredients: { stick: 1, scrap: 1 }, output: { id: 'spear', quantity: 1 } },
            { id: 'bandage', name: 'Bandage', description: 'A small first-aid wrap.', ingredients: { cloth: 2 }, output: { id: 'bandage', quantity: 1 } },
            { id: 'calming_tonic', name: 'Calming Tonic', description: 'A fictional calming survival item.', ingredients: { herb: 1, water: 1 }, output: { id: 'calming_tonic', quantity: 1 } }
        ];
    }

    getAllRecipes() {
        return this.recipes.map((recipe) => ({ ...recipe }));
    }

    canCraft(recipeId, inventory) {
        const recipe = this.recipes.find((entry) => entry.id === recipeId);
        return Boolean(recipe && Object.entries(recipe.ingredients).every(([id, quantity]) =>
            (inventory.getItem(id)?.quantity || 0) >= quantity
        ));
    }

    craft(recipeId, inventory) {
        const recipe = this.recipes.find((entry) => entry.id === recipeId);
        if (!recipe || !this.canCraft(recipeId, inventory)) return null;
        for (const [id, quantity] of Object.entries(recipe.ingredients)) {
            if (!inventory.removeItem(id, quantity)) return null;
        }
        const item = itemCatalog[recipe.output.id];
        const added = inventory.addItem(item, recipe.output.quantity);
        if (!added) {
            inventory.removeItem(recipe.output.id, recipe.output.quantity);
            Object.entries(recipe.ingredients).forEach(([id, quantity]) => inventory.addItem(itemCatalog[id], quantity));
            return null;
        }
        return { ...recipe, item: itemCatalog[recipe.output.id] };
    }
}

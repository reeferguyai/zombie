import { itemCatalog } from '../data/items.js';

const RECIPES = [
    { id: 'rope', name: 'Twisted Rope', description: 'A simple length of rope.', ingredients: { cloth: 2 }, output: { id: 'rope', quantity: 1 }, station: 'workbench' },
    { id: 'spear', name: 'Scrap Spear', description: 'A basic defensive weapon.', ingredients: { stick: 1, scrap: 1 }, output: { id: 'spear', quantity: 1 }, station: 'workbench' },
    { id: 'bandage', name: 'Bandage', description: 'A small first-aid wrap.', ingredients: { cloth: 2 }, output: { id: 'bandage', quantity: 1 }, station: 'medical' },
    { id: 'calming_tonic', name: 'Calming Tonic', description: 'A fictional calming game item.', ingredients: { cannabis_flower: 1, water: 1 }, output: { id: 'calming_tonic', quantity: 1 }, station: 'workbench' }
];

export class CraftingSystem {
    getAllRecipes() { return RECIPES.map((recipe) => ({ ...recipe })); }
    canCraft(recipeId, inventory) {
        const recipe = RECIPES.find((entry) => entry.id === recipeId);
        return Boolean(recipe && Object.entries(recipe.ingredients).every(([id, quantity]) => (inventory.getItem(id)?.quantity || 0) >= quantity));
    }
    craft(recipeId, inventory, station = 'workbench') {
        const recipe = RECIPES.find((entry) => entry.id === recipeId);
        if (!recipe || recipe.station !== station || !this.canCraft(recipeId, inventory)) return null;
        for (const [id, quantity] of Object.entries(recipe.ingredients)) inventory.removeItem(id, quantity);
        const result = inventory.addItem(itemCatalog[recipe.output.id], recipe.output.quantity);
        if (!result.success) {
            Object.entries(recipe.ingredients).forEach(([id, quantity]) => inventory.addItem(itemCatalog[id], quantity));
            return null;
        }
        return { ...recipe, item: itemCatalog[recipe.output.id] };
    }
}

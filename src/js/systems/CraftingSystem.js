/**
 * Crafting System
 * Handles recipe management, crafting mechanics, and item creation
 */

export class CraftingSystem {
    constructor() {
        this.recipes = new Map();
        this.craftingStations = [];
        this.initializeRecipes();
    }

    initializeRecipes() {
        // Multi-Stick (First craftable item)
        this.addRecipe('multi-stick', {
            name: 'Multi-Stick',
            description: 'A versatile stick tool for multiple uses',
            ingredients: {
                'stick': 1
            },
            craftTime: 5,
            difficulty: 'beginner'
        });

        // Rope
        this.addRecipe('rope', {
            name: 'Rope',
            description: 'Crafted from hemp or grass',
            ingredients: {
                'hemp': 3,
                'grass': 2
            },
            craftTime: 10,
            difficulty: 'beginner'
        });

        // Sharpened Stick
        this.addRecipe('sharpened-stick', {
            name: 'Sharpened Stick',
            description: 'A stick sharpened on a rock for cutting',
            ingredients: {
                'stick': 1,
                'stone': 1
            },
            craftTime: 8,
            difficulty: 'beginner'
        });

        // Bloodlust Suppressant
        this.addRecipe('bloodlust-suppressant', {
            name: 'Bloodlust Suppressant',
            description: 'Cannabis-based potion to manage bloodlust',
            ingredients: {
                'cannabis-flower': 2,
                'water': 1,
                'bottle': 1
            },
            craftTime: 15,
            difficulty: 'intermediate'
        });
    }

    addRecipe(id, recipeData) {
        this.recipes.set(id, {
            id,
            ...recipeData
        });
    }

    getRecipe(id) {
        return this.recipes.get(id);
    }

    canCraft(recipeId, inventory) {
        const recipe = this.getRecipe(recipeId);
        if (!recipe) return false;

        for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
            if (!inventory[ingredient] || inventory[ingredient] < amount) {
                return false;
            }
        }
        return true;
    }

    craft(recipeId, inventory) {
        if (!this.canCraft(recipeId, inventory)) {
            return null;
        }

        const recipe = this.getRecipe(recipeId);
        
        // Consume ingredients
        for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
            inventory[ingredient] -= amount;
        }

        return {
            itemId: recipeId,
            name: recipe.name,
            craftTime: recipe.craftTime
        };
    }

    getAllRecipes() {
        return Array.from(this.recipes.values());
    }
}
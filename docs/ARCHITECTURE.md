# Phoenix Blaze - Architecture Documentation

## Overview
This document outlines the technical architecture of Phoenix Blaze, an HTML5-based 2D zombie survival game built with Phaser 3.

## Project Structure

### `/src`
Main source code directory

#### `/src/js/scenes`
- **GameScene.js**: Main game world, player, and NPC rendering
- **UIScene.js**: HUD, menus, and UI elements overlaid on game
- **MenuScene.js**: Main menu and character creation
- **CharacterCreationScene.js**: Detailed character customization

#### `/src/js/systems`
Core game systems implementing major mechanics

- **CraftingSystem.js**: Recipe management and item crafting
- **CombatSystem.js**: Combat mechanics and damage calculation
- **BloodlustSystem.js**: Player bloodlust meter and effects
- **InventorySystem.js**: Item storage and management
- **AISystem.js**: NPC behavior and decision-making
- **ResourceGatheringSystem.js**: Environmental resource collection
- **SaveSystem.js**: Game state persistence
- **WeatherSystem.js**: Dynamic weather and time cycles

#### `/src/js/entities`
GameObject definitions

- **Player.js**: Player character class
- **Zombie.js**: Zombie enemy class
- **NPC.js**: Non-player character class
- **Item.js**: Item base class
- **Projectile.js**: Projectile objects

#### `/src/js/ui`
User interface components

- **HUD.js**: Health, bloodlust, inventory displays
- **Menu.js**: Main menu and pause menu
- **Inventory.js**: Inventory UI
- **Dialog.js**: NPC dialogue system
- **CraftingUI.js**: Crafting interface

#### `/src/assets`
Game assets

- `/sprites`: Character and environment sprites
- `/audio`: Sound effects and music
- `/data`: JSON config files for items, recipes, NPCs

## Core Systems

### 1. Crafting System
**File**: `systems/CraftingSystem.js`

Handles recipe management and crafting mechanics.

```javascript
const craftingSystem = new CraftingSystem();
craftingSystem.addRecipe('multi-stick', { /* recipe data */ });
if (craftingSystem.canCraft('multi-stick', playerInventory)) {
    craftingSystem.craft('multi-stick', playerInventory);
}
```

### 2. Bloodlust System
**File**: `systems/BloodlustSystem.js`

Manages the unique bloodlust mechanic affecting player abilities.

```javascript
const bloodlustSystem = new BloodlustSystem();
bloodlustSystem.update(delta); // Update meter
bloodlustSystem.consumeCannabis('indicia', { bloodlustReduction: 25 });
const effects = bloodlustSystem.getStateEffects();
```

### 3. Combat System
**File**: `systems/CombatSystem.js`

Handles combat mechanics and damage calculation.

```javascript
const combatSystem = new CombatSystem();
const result = combatSystem.resolveAttack(player, enemy, { weapon: playerWeapon });
```

### 4. Inventory System
**File**: `systems/InventorySystem.js`

Manages item storage and weight limits.

```javascript
const inventory = new InventorySystem(20);
inventory.addItem(cannabisSeed, 5);
const hasItem = inventory.getItem('cannabis-flower');
```

### 5. AI System
**File**: `systems/AISystem.js`

Manages NPC behavior and faction interactions.

```javascript
const aiSystem = new AISystem();
const zombie = aiSystem.createNPC({
    id: 'zombie-001',
    name: 'Zombie',
    faction: 'undead',
    behavior: 'zombie'
});
```

## Data Flow

```
Player Input
    ↓
GameScene (Input Handling)
    ↓
Related System (Crafting/Combat/etc)
    ↓
Inventory/Bloodlust Updates
    ↓
UIScene (Render Updates)
    ↓
Screen Display
```

## State Management

Game state is managed through:
1. **Scene State**: Phaser scene properties
2. **System State**: Individual system instances hold state
3. **Persistent State**: SaveSystem serializes to localStorage/backend

## Extensibility

New systems should:
1. Extend base `System` class (if created)
2. Implement `update()` and `reset()` methods
3. Be initialized in `GameScene.create()`
4. Emit events for UI updates

## Performance Considerations

- **Object Pooling**: Reuse projectiles and temporary objects
- **Spatial Partitioning**: Divide world into quadrants for NPC updates
- **Lazy Loading**: Load assets for regions only when needed
- **Event System**: Use events instead of direct calls for loose coupling

## Testing

Each system has corresponding unit tests in `/tests`:
```bash
npm run test
```
/**
 * Combat System
 * Handles combat mechanics, damage calculation, and combat interactions
 */

export class CombatSystem {
    constructor() {
        this.combatStates = new Map();
    }

    /**
     * Calculate damage from attacker to defender
     * @param {Object} attacker - Attacker entity
     * @param {Object} defender - Defender entity
     * @param {Object} weapon - Weapon used (optional)
     */
    calculateDamage(attacker, defender, weapon = null) {
        let baseDamage = attacker.strength || 5;
        
        if (weapon) {
            baseDamage += weapon.damage || 0;
        }

        // Apply random variation (±20%)
        const variance = baseDamage * 0.2;
        const finalDamage = baseDamage + (Math.random() * variance - variance / 2);
        
        // Apply defender armor/resistance
        const defense = defender.defense || 0;
        const actualDamage = Math.max(1, finalDamage - defense);

        return Math.floor(actualDamage);
    }

    /**
     * Resolve an attack
     * @param {Object} attacker - Attacking entity
     * @param {Object} defender - Defending entity
     * @param {Object} attackData - Attack metadata
     */
    resolveAttack(attacker, defender, attackData = {}) {
        const hitChance = attackData.accuracy || 0.85;
        
        if (Math.random() > hitChance) {
            return {
                hit: false,
                damage: 0,
                message: 'Attack missed!'
            };
        }

        const damage = this.calculateDamage(attacker, defender, attackData.weapon);
        defender.health -= damage;

        return {
            hit: true,
            damage,
            message: `Hit for ${damage} damage!`,
            defenderDefeated: defender.health <= 0
        };
    }
}
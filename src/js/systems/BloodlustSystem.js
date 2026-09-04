/**
 * Bloodlust System
 * Manages the player's bloodlust meter and its effects on gameplay
 */

export class BloodlustSystem {
    constructor() {
        this.bloodlustMeter = 0; // 0-100
        this.maxBloodlust = 100;
        this.state = 'calm'; // calm, hungry, uncontrolled
        this.decayRate = 0.1; // per second
    }

    /**
     * Update bloodlust meter
     * @param {number} delta - Time elapsed in milliseconds
     */
    update(delta) {
        const seconds = delta / 1000;
        this.bloodlustMeter += this.decayRate * seconds;
        this.bloodlustMeter = Math.min(this.bloodlustMeter, this.maxBloodlust);
        this.updateState();
    }

    /**
     * Update the bloodlust state based on meter value
     */
    updateState() {
        if (this.bloodlustMeter < 30) {
            this.state = 'calm';
        } else if (this.bloodlustMeter < 70) {
            this.state = 'hungry';
        } else {
            this.state = 'uncontrolled';
        }
    }

    /**
     * Consume cannabis to suppress bloodlust
     * @param {string} strain - Cannabis strain type
     * @param {Object} strainEffects - Effects of the strain
     */
    consumeCannabis(strain, strainEffects = {}) {
        const reduction = strainEffects.bloodlustReduction || 20;
        this.bloodlustMeter = Math.max(0, this.bloodlustMeter - reduction);
        this.updateState();
        
        return {
            success: true,
            newMeter: this.bloodlustMeter,
            state: this.state
        };
    }

    /**
     * Consume blood to satisfy hunger
     * @param {string} bloodType - Type of blood (human, animal, zombie)
     */
    consumeBlood(bloodType) {
        const bloodValues = {
            'human': 30,
            'zombie': 20,
            'animal': 15
        };
        
        const reduction = bloodValues[bloodType] || 10;
        this.bloodlustMeter = Math.max(0, this.bloodlustMeter - reduction);
        this.updateState();
        
        return {
            success: true,
            newMeter: this.bloodlustMeter,
            state: this.state
        };
    }

    /**
     * Get current state effects on player
     */
    getStateEffects() {
        const effects = {
            calm: {
                damageMultiplier: 1.0,
                speedMultiplier: 1.0,
                stealthBonus: 0.2,
                craftingSpeedMultiplier: 1.0
            },
            hungry: {
                damageMultiplier: 1.3,
                speedMultiplier: 1.1,
                stealthBonus: -0.1,
                craftingSpeedMultiplier: 0.8
            },
            uncontrolled: {
                damageMultiplier: 1.8,
                speedMultiplier: 1.3,
                stealthBonus: -0.5,
                craftingSpeedMultiplier: 0.0,
                playerControl: false // Player loses control
            }
        };
        return effects[this.state];
    }
}
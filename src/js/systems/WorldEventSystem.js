export class WorldEventSystem {
    constructor() {
        this.elapsed = 0;
        this.nextEventAt = 45000;
        this.events = [
            { id: 'distant_howl', message: 'A distant howl echoes through the ruins. Zombies are restless.', effect: 'alert' },
            { id: 'supply_cache', message: 'A survivor cache was spotted near you.', effect: 'cache' },
            { id: 'quiet_moment', message: 'The wind shifts. The streets fall quiet for a moment.', effect: 'calm' }
        ];
    }

    update(delta, scene) {
        this.elapsed += delta;
        if (this.elapsed < this.nextEventAt) return null;
        this.elapsed = 0;
        this.nextEventAt = 45000 + Math.floor(Math.random() * 30000);
        const event = this.events[Math.floor(Math.random() * this.events.length)];
        if (event.effect === 'alert') {
            scene.enemies.filter((enemy) => enemy.active).forEach((enemy) => { enemy.aiState = 'alert'; });
        }
        if (event.effect === 'cache' && scene.pickupGroup) {
            const x = Phaser.Math.Clamp(scene.player.x + Phaser.Math.Between(-150, 150), 32, 2168);
            const y = Phaser.Math.Clamp(scene.player.y + Phaser.Math.Between(-150, 150), 32, 1568);
            const pickup = scene.physics.add.image(x, y, 'pickup').setDepth(3);
            pickup.setData({ itemId: 'scrap', amount: 2 });
            pickup.body.setAllowGravity(false).setImmovable(true);
            scene.pickupGroup.add(pickup);
        }
        if (event.effect === 'calm') scene.bloodlustSystem.bloodlustMeter = Math.max(0, scene.bloodlustSystem.bloodlustMeter - 5);
        return event;
    }
}

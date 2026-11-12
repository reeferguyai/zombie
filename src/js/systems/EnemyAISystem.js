import Phaser from 'phaser';

const ROUTES = [
    [[660,240],[730,240],[730,330],[650,330]], [[1080,470],[1210,470],[1210,570],[1080,570]],
    [[1450,390],[1560,390],[1560,510],[1430,510]], [[1780,980],[1900,980],[1900,1120],[1770,1120]],
    [[340,1120],[440,1120],[440,1230],[340,1230]], [[1220,1250],[1340,1250],[1340,1370],[1210,1370]]
];

export class EnemyAISystem {
    constructor() { this.alertRadius = 300; this.attackRadius = 42; this.loseTargetRadius = 430; }

    initialize(enemy, index) {
        enemy.aiRoute = ROUTES[index % ROUTES.length].map(([x,y]) => new Phaser.Math.Vector2(x,y));
        enemy.aiWaypoint = index % enemy.aiRoute.length;
        enemy.aiState = 'patrol';
        enemy.aiAttackTimer = 0;
        enemy.aiInvestigateTimer = 0;
    }

    update(enemy, player, delta, scene) {
        if (!enemy.active || !player?.active) return;
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
        enemy.aiAttackTimer = Math.max(0, enemy.aiAttackTimer - delta);
        if (distance < this.attackRadius) {
            enemy.aiState = 'attack'; enemy.setVelocity(0, 0); enemy.play('zombie-attack', true);
            if (enemy.aiAttackTimer === 0) {
                const damageScale = { easy: 0.65, normal: 1, hard: 1.45 }[scene.difficulty] || 1;
                scene.playerState.health = Math.max(0, scene.playerState.health - 5 * damageScale);
                enemy.aiAttackTimer = 950;
            }
            return;
        }
        if (distance < this.alertRadius || (enemy.aiState === 'chase' && distance < this.loseTargetRadius)) {
            enemy.aiState = 'chase';
            scene.physics.moveToObject(enemy, player, 48);
            enemy.play('zombie-walk', true);
            return;
        }
        if (enemy.aiState === 'chase') {
            enemy.aiState = 'investigate'; enemy.aiInvestigateTimer = 2600;
            enemy.aiTarget = { x: player.x, y: player.y };
        }
        if (enemy.aiState === 'investigate' && enemy.aiInvestigateTimer > 0) {
            enemy.aiInvestigateTimer -= delta;
            scene.physics.moveTo(enemy, enemy.aiTarget.x, enemy.aiTarget.y, 36);
            enemy.play('zombie-walk', true);
            if (Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.aiTarget.x, enemy.aiTarget.y) < 14) enemy.aiInvestigateTimer = 0;
            return;
        }
        enemy.aiState = 'patrol';
        const point = enemy.aiRoute[enemy.aiWaypoint];
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, point.x, point.y) < 12) {
            enemy.aiWaypoint = (enemy.aiWaypoint + 1) % enemy.aiRoute.length;
            enemy.setVelocity(0, 0); enemy.play('zombie-idle', true);
        } else {
            scene.physics.moveTo(enemy, point.x, point.y, 32);
            enemy.play('zombie-walk', true);
        }
    }
}

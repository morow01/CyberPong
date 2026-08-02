/* ==========================================================================
   CyberPong v2.0 Core Game Physics & State Engine
   ========================================================================== */

const POWERUP_TYPES = {
    SPEED: { id: 'SPEED', icon: '⚡', name: 'Speed Boost', color: '#00f3ff' },
    SHIELD: { id: 'SHIELD', icon: '🛡️', name: 'Cyber Shield', color: '#00ff66' },
    MAGNET: { id: 'MAGNET', icon: '🧲', name: 'Magnetic Field', color: '#a855f7' },
    FROST: { id: 'FROST', icon: '❄️', name: 'Frost Stasis', color: '#3b82f6' },
    MULTIBALL: { id: 'MULTIBALL', icon: '💥', name: 'Multi-Ball', color: '#ff0055' },
    SIZE: { id: 'SIZE', icon: '📏', name: 'Titan Size', color: '#ffaa00' },
    LASER: { id: 'LASER', icon: '🔫', name: 'Plasma Blaster', color: '#ff3300' }
};

class Ball {
    constructor(x, y, vx = 350, vy = 150) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.baseSpeed = 400;
        this.speed = this.baseSpeed;
        this.vx = vx;
        this.vy = vy;
        this.color = '#00f3ff';
        this.lastHitter = null;
        this.heldBy = null;
        this.holdTimer = 0;
    }

    update(dt, particleSystem) {
        if (this.heldBy) {
            this.x = this.heldBy.id === 'p1' ? this.heldBy.x + this.heldBy.width + 12 : this.heldBy.x - 12;
            this.y = this.heldBy.y + this.heldBy.height / 2;
            this.holdTimer -= dt;
            if (this.holdTimer <= 0) {
                this.releaseFromMagnet();
            }
            return;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (particleSystem && Math.random() < 0.6) {
            particleSystem.addTrail(this.x, this.y, this.color, this.radius);
        }
    }

    releaseFromMagnet() {
        if (!this.heldBy) return;
        const dir = this.heldBy.id === 'p1' ? 1 : -1;
        this.vx = dir * this.speed * 1.2;
        this.vy = (Math.random() - 0.5) * 200;
        this.heldBy = null;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Paddle {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 14;
        this.baseHeight = 90;
        this.height = this.baseHeight;
        this.score = 0;
        this.color = id === 'p1' ? '#00f3ff' : '#ff0055';

        // Ultimate Meter (0 - 100)
        this.ultEnergy = 0;

        // Upgrades & Timers
        this.hasShield = false;
        this.hasMagnet = false;
        this.isFrozen = false;
        this.frostTimer = 0;
        this.sizeBoostTimer = 0;
        this.laserAmmo = 0;
        this.stunTimer = 0;
        this.shootLaser = false;
        this.isSplit = false;
        this.splitTimer = 0;
    }

    addUlt(amount) {
        this.ultEnergy = Math.min(100, this.ultEnergy + amount);
    }

    update(dt) {
        if (this.frostTimer > 0) {
            this.frostTimer -= dt;
            if (this.frostTimer <= 0) this.isFrozen = false;
        }

        if (this.sizeBoostTimer > 0) {
            this.sizeBoostTimer -= dt;
            if (this.sizeBoostTimer <= 0) this.height = this.baseHeight;
        }

        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
        }

        if (this.splitTimer > 0) {
            this.splitTimer -= dt;
            if (this.splitTimer <= 0) this.isSplit = false;
        }
    }

    draw(ctx) {
        ctx.save();
        const drawColor = this.stunTimer > 0 ? '#ffaa00' : (this.isFrozen ? '#3b82f6' : this.color);
        ctx.fillStyle = drawColor;
        ctx.shadowColor = drawColor;
        ctx.shadowBlur = 18;

        if (this.isSplit) {
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height * 0.45, 6);
            ctx.roundRect(this.x, this.y + this.height * 0.55, this.width, this.height * 0.45, 6);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, 8);
            ctx.fill();
        }

        if (this.laserAmmo > 0) {
            ctx.fillStyle = '#ff3300';
            ctx.fillRect(this.id === 'p1' ? this.x + this.width : this.x - 4, this.y + 4, 4, 10);
            ctx.fillRect(this.id === 'p1' ? this.x + this.width : this.x - 4, this.y + this.height - 14, 4, 10);
        }

        ctx.restore();
    }
}

class PinballBumper {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 24;
        this.pulse = 0;
        this.color = '#ff0055';
    }

    update(dt) {
        if (this.pulse > 0) this.pulse -= 4 * dt;
    }

    draw(ctx) {
        ctx.save();
        const r = this.radius + Math.max(0, this.pulse * 8);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', this.x, this.y);
        ctx.restore();
    }
}

class PowerUpOrb {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.type = type;
        this.pulse = 0;
        this.life = 15;
    }

    update(dt) {
        this.pulse += 3 * dt;
        this.life -= dt;
    }

    draw(ctx) {
        ctx.save();
        const pulseScale = 1 + Math.sin(this.pulse) * 0.12;
        const drawRadius = this.radius * pulseScale;

        ctx.shadowColor = this.type.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        ctx.strokeStyle = this.type.color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.icon, this.x, this.y + 1);

        ctx.restore();
    }
}

class LaserBeam {
    constructor(x, y, owner) {
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.vx = owner === 'p1' ? 800 : -800;
        this.width = 16;
        this.height = 4;
        this.color = owner === 'p1' ? '#00f3ff' : '#ff0055';
    }

    update(dt) {
        this.x += this.vx * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(this.x, this.y - this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

class GameEngine {
    constructor(canvas, sound, particleSystem) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sound = sound;
        this.particles = particleSystem;

        this.width = canvas.width;
        this.height = canvas.height;

        this.mode = '1p';
        this.bossStage = 1;
        this.bossHealth = 5;
        this.maxBossHealth = 5;

        this.aiDiff = 'medium';
        this.targetScore = 7;
        this.state = 'MENU';

        this.p1 = new Paddle('p1', 30, this.height / 2 - 45);
        this.p2 = new Paddle('p2', this.width - 44, this.height / 2 - 45);
        this.balls = [];
        this.powerUps = [];
        this.lasers = [];
        this.bumpers = [];

        this.ai = new AIController(this.aiDiff);
        this.powerUpSpawnTimer = 5;
        this.bulletTimeTimer = 0;

        this.stats = { rallies: 0, currentRally: 0, maxRally: 0, powerUpsCollected: 0 };
    }

    startMatch(mode, aiDiff, targetScore, bossStage = 1) {
        this.mode = mode;
        this.aiDiff = aiDiff;
        this.targetScore = targetScore;
        this.bossStage = bossStage;

        if (this.mode === 'boss') {
            if (bossStage === 1) {
                this.aiDiff = 'boss_mothership';
                this.bossHealth = 5;
            } else if (bossStage === 2) {
                this.aiDiff = 'boss_glitch';
                this.bossHealth = 7;
            } else {
                this.aiDiff = 'boss_twin';
                this.bossHealth = 10;
            }
            this.maxBossHealth = this.bossHealth;
        }

        this.ai.setDifficulty(this.aiDiff);

        this.p1 = new Paddle('p1', 30, this.height / 2 - 45);
        this.p2 = new Paddle('p2', this.width - 44, this.height / 2 - 45);

        this.balls = [];
        this.powerUps = [];
        this.lasers = [];
        this.powerUpSpawnTimer = 4;
        this.bulletTimeTimer = 0;

        // Init Pinball Bumpers
        this.bumpers = [
            new PinballBumper(this.width / 2, this.height * 0.3),
            new PinballBumper(this.width / 2, this.height * 0.7)
        ];

        this.stats = { rallies: 0, currentRally: 0, maxRally: 0, powerUpsCollected: 0 };

        this.spawnBall(1);
        this.state = 'PLAYING';
    }

    spawnBall(dir = 1) {
        const speed = 360;
        const angle = (Math.random() - 0.5) * (Math.PI / 3);
        const vx = Math.cos(angle) * speed * dir;
        const vy = Math.sin(angle) * speed;
        this.balls.push(new Ball(this.width / 2, this.height / 2, vx, vy));
    }

    triggerUltimate(paddle) {
        if (paddle.ultEnergy < 100) return;
        paddle.ultEnergy = 0;

        this.sound.playUltimate();
        this.particles.triggerShake(18, 0.4);

        const opponent = paddle.id === 'p1' ? this.p2 : this.p1;
        opponent.stunTimer = 1.5;
        paddle.isSplit = true;
        paddle.splitTimer = 6.0;

        this.bulletTimeTimer = 3.0;
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        let effectiveDt = dt;
        if (this.bulletTimeTimer > 0) {
            this.bulletTimeTimer -= dt;
            effectiveDt = dt * 0.35;
        }

        if (this.balls.length > 0) {
            const ballSpeed = Math.hypot(this.balls[0].vx, this.balls[0].vy);
            this.sound.setBgmSpeed(ballSpeed / 400);
        }

        this.p1.update(dt);
        this.p2.update(dt);
        this.bumpers.forEach(b => b.update(dt));

        if (this.mode === '1p' || this.mode === 'boss') {
            this.ai.update(dt, this.p2, this.balls, this.powerUps, this.p1, this.height, this.width);
        }

        this.checkLaserLaunch(this.p1);
        this.checkLaserLaunch(this.p2);

        // Update Lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.update(effectiveDt);

            if (laser.x < 0 || laser.x > this.width) {
                this.lasers.splice(i, 1);
                continue;
            }

            const target = laser.owner === 'p1' ? this.p2 : this.p1;
            if (
                laser.x >= target.x &&
                laser.x <= target.x + target.width &&
                laser.y >= target.y &&
                laser.y <= target.y + target.height
            ) {
                target.stunTimer = 0.85;
                this.particles.addSparks(laser.x, laser.y, laser.color, 15);
                this.sound.playLaser();
                this.lasers.splice(i, 1);
            }
        }

        // Power-Up Spawner
        this.powerUpSpawnTimer -= effectiveDt;
        if (this.powerUpSpawnTimer <= 0 && this.powerUps.length < 2) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 8 + Math.random() * 6;
        }

        // Update Power-Ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const orb = this.powerUps[i];
            orb.update(effectiveDt);

            if (orb.life <= 0) {
                this.powerUps.splice(i, 1);
                continue;
            }

            let collected = false;
            let collector = null;

            for (const b of this.balls) {
                const dist = Math.hypot(b.x - orb.x, b.y - orb.y);
                if (dist < b.radius + orb.radius) {
                    collected = true;
                    collector = b.lastHitter ? (b.lastHitter === 'p1' ? this.p1 : this.p2) : (b.vx > 0 ? this.p1 : this.p2);
                    break;
                }
            }

            if (collected && collector) {
                this.applyPowerUp(collector, orb.type);
                collector.addUlt(25);
                this.particles.addPowerupBurst(orb.x, orb.y, orb.type.color);
                this.sound.playPowerup();
                this.stats.powerUpsCollected++;
                this.powerUps.splice(i, 1);
            }
        }

        // Update Balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.update(effectiveDt, this.particles);

            // Wall Bounce
            if (ball.y - ball.radius <= 0) {
                ball.y = ball.radius;
                ball.vy *= -1;
                this.sound.playBounce(false);
                this.particles.addSparks(ball.x, ball.y, '#00f3ff', 6);
            } else if (ball.y + ball.radius >= this.height) {
                ball.y = this.height - ball.radius;
                ball.vy *= -1;
                this.sound.playBounce(false);
                this.particles.addSparks(ball.x, ball.y, '#00f3ff', 6);
            }

            // Pinball Bumpers
            for (const bumper of this.bumpers) {
                const d = Math.hypot(ball.x - bumper.x, ball.y - bumper.y);
                if (d < ball.radius + bumper.radius) {
                    const angle = Math.atan2(ball.y - bumper.y, ball.x - bumper.x);
                    const speed = Math.hypot(ball.vx, ball.vy) * 1.3;
                    ball.vx = Math.cos(angle) * speed;
                    ball.vy = Math.sin(angle) * speed;
                    bumper.pulse = 1.0;
                    this.sound.playBumper();
                    this.particles.addSparks(bumper.x, bumper.y, '#ff0055', 18);
                }
            }

            // Shield Barriers
            if (this.p1.hasShield && ball.x <= 15) {
                ball.vx = Math.abs(ball.vx);
                this.p1.hasShield = false;
                this.sound.playShield();
                this.particles.addSparks(15, ball.y, '#00ff66', 25);
            }
            if (this.p2.hasShield && ball.x >= this.width - 15) {
                ball.vx = -Math.abs(ball.vx);
                this.p2.hasShield = false;
                this.sound.playShield();
                this.particles.addSparks(this.width - 15, ball.y, '#00ff66', 25);
            }

            // Paddle 1 Bounce
            if (
                ball.vx < 0 &&
                ball.x - ball.radius <= this.p1.x + this.p1.width &&
                ball.x + ball.radius >= this.p1.x &&
                ball.y >= this.p1.y &&
                ball.y <= this.p1.y + this.p1.height
            ) {
                this.handlePaddleBounce(ball, this.p1);
            }

            // Paddle 2 Bounce
            if (
                ball.vx > 0 &&
                ball.x + ball.radius >= this.p2.x &&
                ball.x - ball.radius <= this.p2.x + this.p2.width &&
                ball.y >= this.p2.y &&
                ball.y <= this.p2.y + this.p2.height
            ) {
                this.handlePaddleBounce(ball, this.p2);
            }

            // Goal Scoring
            if (ball.x < 0) {
                this.handleGoal('p2', i);
            } else if (ball.x > this.width) {
                this.handleGoal('p1', i);
            }
        }

        if (this.balls.length === 0) {
            this.spawnBall(1);
        }

        this.particles.update(effectiveDt);
    }

    checkLaserLaunch(paddle) {
        if (paddle.shootLaser && paddle.laserAmmo > 0 && paddle.stunTimer <= 0) {
            paddle.laserAmmo--;
            paddle.shootLaser = false;

            const startX = paddle.id === 'p1' ? paddle.x + paddle.width + 4 : paddle.x - 16;
            this.lasers.push(new LaserBeam(startX, paddle.y + 12, paddle.id));
            this.lasers.push(new LaserBeam(startX, paddle.y + paddle.height - 12, paddle.id));

            this.sound.playLaser();
        }
        paddle.shootLaser = false;
    }

    handlePaddleBounce(ball, paddle) {
        ball.lastHitter = paddle.id;
        paddle.addUlt(8);
        this.stats.currentRally++;
        this.stats.maxRally = Math.max(this.stats.maxRally, this.stats.currentRally);

        if (paddle.hasMagnet) {
            ball.heldBy = paddle;
            ball.holdTimer = 1.5;
            paddle.hasMagnet = false;
            return;
        }

        const relativeIntersectY = (paddle.y + paddle.height / 2) - ball.y;
        const normalizedIntersectY = relativeIntersectY / (paddle.height / 2);
        const bounceAngle = normalizedIntersectY * (Math.PI / 3);

        const currentSpeed = Math.hypot(ball.vx, ball.vy);
        const newSpeed = Math.min(850, currentSpeed * 1.04);

        const dir = paddle.id === 'p1' ? 1 : -1;
        ball.vx = dir * newSpeed * Math.cos(bounceAngle);
        ball.vy = newSpeed * -Math.sin(bounceAngle);

        ball.color = paddle.color;
        this.sound.playBounce(true, 1 + newSpeed / 850);
        this.particles.addSparks(paddle.id === 'p1' ? paddle.x + paddle.width : paddle.x, ball.y, paddle.color, 12);
    }

    spawnPowerUp() {
        const typesKeys = Object.keys(POWERUP_TYPES);
        const randomKey = typesKeys[Math.floor(Math.random() * typesKeys.length)];
        const type = POWERUP_TYPES[randomKey];

        const x = this.width * 0.25 + Math.random() * (this.width * 0.5);
        const y = 60 + Math.random() * (this.height - 120);

        this.powerUps.push(new PowerUpOrb(x, y, type));
    }

    applyPowerUp(paddle, type) {
        const opponent = paddle.id === 'p1' ? this.p2 : this.p1;

        switch (type.id) {
            case 'SPEED':
                this.balls.forEach(b => { b.vx *= 1.35; b.vy *= 1.35; });
                break;
            case 'SHIELD':
                paddle.hasShield = true;
                break;
            case 'MAGNET':
                paddle.hasMagnet = true;
                break;
            case 'FROST':
                opponent.isFrozen = true;
                opponent.frostTimer = 5.0;
                this.sound.playFreeze();
                break;
            case 'MULTIBALL':
                if (this.balls.length > 0) {
                    const primary = this.balls[0];
                    this.balls.push(new Ball(primary.x, primary.y, -primary.vx, primary.vy * 1.2));
                    this.balls.push(new Ball(primary.x, primary.y, primary.vx * 0.8, -primary.vy));
                }
                break;
            case 'SIZE':
                paddle.height = paddle.baseHeight * 1.5;
                paddle.sizeBoostTimer = 8.0;
                break;
            case 'LASER':
                paddle.laserAmmo += 3;
                break;
        }
    }

    handleGoal(scorerId, ballIndex) {
        const scorer = scorerId === 'p1' ? this.p1 : this.p2;
        scorer.score++;
        scorer.addUlt(15);

        if (this.mode === 'boss' && scorerId === 'p1') {
            this.bossHealth--;
        }

        const goalX = scorerId === 'p1' ? this.width - 10 : 10;
        this.particles.addGoalExplosion(goalX, this.height / 2, scorer.color);
        this.sound.playScore(scorerId === 'p1');

        this.balls.splice(ballIndex, 1);
        this.stats.currentRally = 0;

        if ((this.mode !== 'boss' && scorer.score >= this.targetScore) || (this.mode === 'boss' && (this.bossHealth <= 0 || this.p2.score >= 5))) {
            this.state = 'GAMEOVER';
            this.sound.playVictory();
            return;
        }

        if (this.balls.length === 0) {
            const nextDir = scorerId === 'p1' ? -1 : 1;
            setTimeout(() => {
                if (this.state === 'PLAYING') this.spawnBall(nextDir);
            }, 600);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        this.particles.applyShakeTransform(this.ctx);

        this.particles.drawBackgroundGrid(this.ctx, this.width, this.height);

        this.bumpers.forEach(b => b.draw(this.ctx));

        if (this.p1.hasShield) this.drawShieldWall(12, '#00ff66');
        if (this.p2.hasShield) this.drawShieldWall(this.width - 12, '#00ff66');

        for (const orb of this.powerUps) orb.draw(this.ctx);
        for (const laser of this.lasers) laser.draw(this.ctx);

        this.p1.draw(this.ctx);
        this.p2.draw(this.ctx);

        for (const ball of this.balls) ball.draw(this.ctx);

        this.particles.drawParticles(this.ctx);
        this.ctx.restore();
    }

    drawShieldWall(x, color) {
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
        this.ctx.stroke();
        this.ctx.restore();
    }
}

window.GameEngine = GameEngine;

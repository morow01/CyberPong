/* ==========================================================================
   Manic Miner: Cyber Edition - Platformer Physics & Logic Engine (v3.0.3)
   ========================================================================== */

class MinerWilly {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 34;
        this.vx = 0;
        this.vy = 0;
        this.speed = 280;
        this.jumpForce = -540;
        this.gravity = 1200;
        this.isGrounded = false;
        this.hasDoubleJumped = false;
        this.facing = 'right';
        this.lives = 3;
        this.score = 0;
        this.invulnerableTimer = 0;
    }

    resetPos(startPos) {
        this.x = startPos.x;
        this.y = startPos.y;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.hasDoubleJumped = false;
        this.invulnerableTimer = 1.5; // 1.5s invincibility on respawn
    }
}

class MinerEngine {
    constructor(canvas, sound, particles) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sound = sound;
        this.particles = particles;

        this.width = canvas.width;
        this.height = canvas.height;

        this.currentLevelIdx = 0;
        this.level = null;
        this.willy = new MinerWilly(50, 460);
        this.airSupply = 120;
        this.portalUnlocked = false;
        this.state = 'MENU';

        this.crumblingTiles = [];
        this.prevJumpInput = false;
    }

    loadLevel(levelIdx = 0) {
        this.currentLevelIdx = levelIdx;
        const rawLevel = CAVERN_LEVELS[levelIdx];

        this.level = JSON.parse(JSON.stringify(rawLevel));
        if (levelIdx === 0) {
            this.willy.lives = 3;
            this.willy.score = 0;
        }
        this.willy.resetPos(this.level.startPos);
        this.airSupply = this.level.airLimit;
        this.portalUnlocked = false;

        this.crumblingTiles = this.level.platforms
            .filter(p => p.type === TILE_TYPES.CRUMBLING)
            .map(p => ({ ...p, crumbleTimer: -1, isDestroyed: false }));

        this.state = 'PLAYING';
    }

    update(dt, input) {
        if (this.state !== 'PLAYING') return;

        // Invulnerability Timer Decay
        if (this.willy.invulnerableTimer > 0) {
            this.willy.invulnerableTimer -= dt;
        }

        // Air Supply decay
        this.airSupply -= dt * 1.0;
        if (this.airSupply <= 0) {
            this.handlePlayerDeath("AIR EXPIRED!");
            return;
        }

        // Horizontal Movement
        this.willy.vx = 0;
        if (input.left) {
            this.willy.vx = -this.willy.speed;
            this.willy.facing = 'left';
        }
        if (input.right) {
            this.willy.vx = this.willy.speed;
            this.willy.facing = 'right';
        }

        // Jump & Double Jump Thruster
        const isJumpPressed = input.jump && !this.prevJumpInput;
        if (isJumpPressed) {
            if (this.willy.isGrounded) {
                this.willy.vy = this.willy.jumpForce;
                this.willy.isGrounded = false;
                this.willy.hasDoubleJumped = false;
                if (this.sound) this.sound.playBounce(true, 1.4);
                if (this.particles) this.particles.addSparks(this.willy.x + 12, this.willy.y + 34, '#00f3ff', 8);
            } else if (!this.willy.hasDoubleJumped) {
                this.willy.vy = this.willy.jumpForce * 0.85;
                this.willy.hasDoubleJumped = true;
                if (this.sound) this.sound.playBounce(true, 1.8);
                if (this.particles) this.particles.addFloatingText(this.willy.x, this.willy.y - 10, "DOUBLE JUMP!", "#00ff66");
                if (this.particles) this.particles.addSparks(this.willy.x + 12, this.willy.y + 34, '#00ff66', 15);
            }
        }
        this.prevJumpInput = input.jump;

        // Apply Gravity
        this.willy.vy += this.willy.gravity * dt;

        // Integrate Position
        this.willy.x += this.willy.vx * dt;
        this.resolveHorizontalCollisions();

        this.willy.y += this.willy.vy * dt;
        this.willy.isGrounded = false;
        this.resolveVerticalCollisions(dt);

        // Bound Willy inside arena
        this.willy.x = Math.max(0, Math.min(this.width - this.willy.width, this.willy.x));
        if (this.willy.y > this.height) {
            this.handlePlayerDeath("FELL INTO THE ABYSS!");
            return;
        }

        // Key Collection Check
        let remainingKeys = 0;
        for (const k of this.level.keys) {
            if (!k.collected) {
                if (this.checkAABB(this.willy, { x: k.x, y: k.y, width: 22, height: 22 })) {
                    k.collected = true;
                    this.willy.score += 500;
                    if (this.sound) this.sound.playPowerup();
                    if (this.particles) this.particles.addPowerupBurst(k.x, k.y, '#ffaa00');
                } else {
                    remainingKeys++;
                }
            }
        }

        if (remainingKeys === 0 && !this.portalUnlocked) {
            this.portalUnlocked = true;
            if (this.particles) this.particles.addFloatingText(this.width / 2, 80, "PORTAL UNLOCKED!", "#00ff66");
        }

        // Portal Entry Check
        if (this.portalUnlocked) {
            const portalBox = { x: this.level.portalPos.x, y: this.level.portalPos.y, width: 40, height: 40 };
            if (this.checkAABB(this.willy, portalBox)) {
                this.handleLevelComplete();
                return;
            }
        }

        // Enemy Patrol & Collision Check (Protected by Invulnerability)
        for (const e of this.level.enemies) {
            e.x += e.speed * dt;
            if (e.x <= e.minX || e.x >= e.maxX) {
                e.speed *= -1;
            }

            if (this.willy.invulnerableTimer <= 0 && this.checkAABB(this.willy, e)) {
                this.handlePlayerDeath("MUTANT COLLISION!");
                return;
            }
        }

        // Update Crumbling Tile timers
        for (const tile of this.crumblingTiles) {
            if (tile.crumbleTimer >= 0 && !tile.isDestroyed) {
                tile.crumbleTimer += dt;
                if (tile.crumbleTimer > 0.45) {
                    tile.isDestroyed = true;
                    if (this.particles) this.particles.addSparks(tile.x + tile.width / 2, tile.y, '#ffaa00', 12);
                }
            }
        }

        if (this.particles) this.particles.update(dt);
    }

    resolveHorizontalCollisions() {
        for (const p of this.getAllActivePlatforms()) {
            if (this.checkAABB(this.willy, p)) {
                if (this.willy.vx > 0) {
                    this.willy.x = p.x - this.willy.width;
                } else if (this.willy.vx < 0) {
                    this.willy.x = p.x + p.width;
                }
            }
        }
    }

    resolveVerticalCollisions(dt) {
        for (const p of this.getAllActivePlatforms()) {
            if (this.checkAABB(this.willy, p)) {
                if (this.willy.vy > 0) {
                    this.willy.y = p.y - this.willy.height;
                    this.willy.vy = 0;
                    this.willy.isGrounded = true;
                    this.willy.hasDoubleJumped = false;

                    if (p.type === TILE_TYPES.CONVEYOR_LEFT) {
                        this.willy.x -= 120 * dt;
                    } else if (p.type === TILE_TYPES.CONVEYOR_RIGHT) {
                        this.willy.x += 120 * dt;
                    }

                    if (p.type === TILE_TYPES.CRUMBLING && p.crumbleTimer < 0) {
                        p.crumbleTimer = 0;
                    }
                } else if (this.willy.vy < 0) {
                    this.willy.y = p.y + p.height;
                    this.willy.vy = 0;
                }
            }
        }
    }

    getAllActivePlatforms() {
        const solidAndConveyors = this.level.platforms.filter(p => p.type !== TILE_TYPES.CRUMBLING);
        const activeCrumbling = this.crumblingTiles.filter(t => !t.isDestroyed);
        return [...solidAndConveyors, ...activeCrumbling];
    }

    checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    handlePlayerDeath(reason) {
        if (this.willy.invulnerableTimer > 0) return;

        this.willy.lives--;
        if (this.sound) this.sound.playLaser();
        if (this.particles) this.particles.addSparks(this.willy.x + 12, this.willy.y + 17, '#ff0055', 25);

        if (this.willy.lives <= 0) {
            this.state = 'GAMEOVER';
        } else {
            this.willy.resetPos(this.level.startPos);
            this.airSupply = this.level.airLimit;
            if (this.particles) this.particles.addFloatingText(this.width / 2, 100, reason, "#ff0055");
        }
    }

    handleLevelComplete() {
        if (this.sound) this.sound.playVictory();
        this.willy.score += Math.floor(this.airSupply) * 10;

        if (this.currentLevelIdx + 1 < CAVERN_LEVELS.length) {
            this.loadLevel(this.currentLevelIdx + 1);
        } else {
            this.state = 'VICTORY';
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        this.ctx.fillStyle = '#060610';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (!this.level) {
            this.ctx.restore();
            return;
        }

        // Draw Platforms
        for (const p of this.level.platforms) {
            if (p.type === TILE_TYPES.SOLID) {
                this.ctx.fillStyle = '#3b82f6';
                this.ctx.shadowColor = '#3b82f6';
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.roundRect(p.x, p.y, p.width, p.height, 4);
                this.ctx.fill();
            } else if (p.type === TILE_TYPES.CONVEYOR_LEFT || p.type === TILE_TYPES.CONVEYOR_RIGHT) {
                this.ctx.fillStyle = '#a855f7';
                this.ctx.shadowColor = '#a855f7';
                this.ctx.shadowBlur = 12;
                this.ctx.beginPath();
                this.ctx.roundRect(p.x, p.y, p.width, p.height, 4);
                this.ctx.fill();

                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px sans-serif';
                const arrow = p.type === TILE_TYPES.CONVEYOR_LEFT ? '«««' : '»»»';
                this.ctx.fillText(arrow, p.x + p.width / 2 - 12, p.y + 13);
            }
        }

        // Draw Crumbling Tiles
        for (const tile of this.crumblingTiles) {
            if (!tile.isDestroyed) {
                const alpha = tile.crumbleTimer >= 0 ? Math.max(0.2, 1 - tile.crumbleTimer * 2) : 1;
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.shadowColor = '#ffaa00';
                this.ctx.shadowBlur = 12;
                this.ctx.beginPath();
                this.ctx.roundRect(tile.x, tile.y, tile.width, tile.height, 4);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        }

        // Draw Energy Crystal Keys
        for (const k of this.level.keys) {
            if (!k.collected) {
                this.ctx.shadowColor = '#ffaa00';
                this.ctx.shadowBlur = 16;
                this.ctx.font = '18px sans-serif';
                this.ctx.fillText('🗝️', k.x, k.y + 16);
            }
        }

        // Draw Portal Exit
        const portal = this.level.portalPos;
        this.ctx.save();
        this.ctx.shadowColor = this.portalUnlocked ? '#00ff66' : '#ff0055';
        this.ctx.shadowBlur = 20;
        this.ctx.font = '32px sans-serif';
        this.ctx.fillText(this.portalUnlocked ? '🌀' : '🔒', portal.x, portal.y + 30);
        this.ctx.restore();

        // Draw Enemies
        for (const e of this.level.enemies) {
            this.ctx.shadowColor = '#ff0055';
            this.ctx.shadowBlur = 12;
            this.ctx.font = '22px sans-serif';
            this.ctx.fillText(e.icon, e.x, e.y + 20);
        }

        // Draw Miner Willy Player (Flashes when invulnerable)
        const isFlashing = this.willy.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0;
        if (!isFlashing) {
            this.ctx.shadowColor = '#00f3ff';
            this.ctx.shadowBlur = 18;
            this.ctx.fillStyle = '#00f3ff';
            this.ctx.beginPath();
            this.ctx.roundRect(this.willy.x, this.willy.y, this.willy.width, this.willy.height, 6);
            this.ctx.fill();

            this.ctx.fillStyle = '#ffffff';
            const eyeX = this.willy.facing === 'right' ? this.willy.x + 15 : this.willy.x + 4;
            this.ctx.fillRect(eyeX, this.willy.y + 6, 5, 5);
        }

        // Draw Particles
        if (this.particles) this.particles.drawParticles(this.ctx);

        this.ctx.restore();
    }
}

window.MinerEngine = MinerEngine;

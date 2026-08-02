/* ==========================================================================
   Particle System & Visual FX Engine (v2.0)
   ========================================================================== */

class Particle {
    constructor(x, y, color, size, vx, vy, life = 1.0, shape = 'circle', text = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.shape = shape; // 'circle', 'spark', 'ring', 'matrix', 'text'
        this.text = text;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= 1.5 * dt;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.5, this.size * alpha), 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'spark') {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 0.08, this.y - this.vy * 0.08);
            ctx.stroke();
        } else if (this.shape === 'ring') {
            ctx.lineWidth = 3;
            ctx.beginPath();
            const radius = (1 - alpha) * 45;
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.shape === 'matrix') {
            ctx.font = '12px monospace';
            ctx.fillText(this.text || '0', this.x, this.y);
        } else if (this.shape === 'text') {
            ctx.font = 'bold 16px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.text, this.x, this.y);
        }

        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.gridOffset = 0;
        this.theme = 'cyber';
    }

    setTheme(themeName) {
        this.theme = themeName;
    }

    triggerShake(intensity = 10, duration = 0.25) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    addTrail(x, y, color, size = 6) {
        const vx = (Math.random() - 0.5) * 20;
        const vy = (Math.random() - 0.5) * 20;
        this.particles.push(new Particle(x, y, color, size, vx, vy, 0.4, 'circle'));
    }

    addFloatingText(x, y, text, color = '#ffaa00') {
        this.particles.push(new Particle(x, y - 10, color, 16, 0, -40, 1.2, 'text', text));
    }

    addSparks(x, y, color, count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 240;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const shape = Math.random() > 0.5 ? 'spark' : 'circle';
            this.particles.push(new Particle(x, y, color, 3 + Math.random() * 4, vx, vy, 0.6 + Math.random() * 0.3, shape));
        }
    }

    addPowerupBurst(x, y, color) {
        this.particles.push(new Particle(x, y, color, 1, 0, 0, 0.5, 'ring'));
        this.addSparks(x, y, color, 24);
    }

    addGoalExplosion(x, y, color) {
        this.triggerShake(16, 0.4);
        this.particles.push(new Particle(x, y, color, 1, 0, 0, 0.8, 'ring'));
        this.addSparks(x, y, color, 40);
    }

    update(dt) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;
            if (this.shakeDuration <= 0) {
                this.shakeIntensity = 0;
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.gridOffset = (this.gridOffset + 15 * dt) % 40;

        if (this.theme === 'matrix' && Math.random() < 0.4) {
            const chars = '0123456789ABCDEF';
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = Math.random() * 1000;
            this.particles.push(new Particle(x, 0, '#00ff66', 10, 0, 150 + Math.random() * 200, 2.5, 'matrix', char));
        }
    }

    applyShakeTransform(ctx) {
        if (this.shakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(dx, dy);
        }
    }

    drawBackgroundGrid(ctx, width, height) {
        ctx.save();

        if (this.theme === 'synthwave') {
            ctx.strokeStyle = 'rgba(255, 0, 128, 0.15)';
            ctx.fillStyle = 'rgba(255, 170, 0, 0.08)';
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 80, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.theme === 'matrix') {
            ctx.strokeStyle = 'rgba(0, 255, 102, 0.08)';
        } else {
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
        }

        ctx.lineWidth = 1;

        for (let x = 0; x <= width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = this.gridOffset; y <= height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        const netColor = this.theme === 'synthwave' ? '#ff007f' : (this.theme === 'matrix' ? '#00ff66' : '#00f3ff');
        ctx.strokeStyle = netColor;
        ctx.globalAlpha = 0.4;
        ctx.setLineDash([12, 12]);
        ctx.lineWidth = 3;
        ctx.shadowColor = netColor;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawParticles(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
}

window.ParticleSystem = ParticleSystem;

/* ==========================================================================
   Cyber AI & Boss AI Controller Engine (v2.0)
   ========================================================================== */

class AIController {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty; // 'easy', 'medium', 'impossible', 'boss_mothership', 'boss_glitch', 'boss_twin'
        this.targetY = 300;
        this.reactionTimer = 0;
        this.errorOffset = 0;
        this.glitchTimer = 0;
    }

    setDifficulty(diff) {
        this.difficulty = diff;
    }

    update(dt, paddle, balls, powerUps, playerPaddle, canvasHeight, canvasWidth) {
        if (!paddle || balls.length === 0) return;

        let targetBall = balls[0];
        for (const b of balls) {
            if (b.vx > 0 && b.x > (targetBall ? targetBall.x : 0)) {
                targetBall = b;
            }
        }

        // --- Standard Difficulties --- //
        if (this.difficulty === 'easy') {
            if (this.reactionTimer > 0.3) {
                this.reactionTimer = 0;
                this.errorOffset = (Math.random() - 0.5) * 60;
            }
            this.targetY = targetBall.y + this.errorOffset;
            this.movePaddle(paddle, this.targetY, 4.8, dt, canvasHeight);

        } else if (this.difficulty === 'medium') {
            if (targetBall.vx > 0) {
                const timeToGoal = (paddle.x - targetBall.x) / targetBall.vx;
                let predictedY = targetBall.y + targetBall.vy * timeToGoal;
                while (predictedY < 0 || predictedY > canvasHeight) {
                    if (predictedY < 0) predictedY = -predictedY;
                    if (predictedY > canvasHeight) predictedY = 2 * canvasHeight - predictedY;
                }
                this.targetY = predictedY;
            } else {
                this.targetY = canvasHeight / 2;
            }
            this.movePaddle(paddle, this.targetY, 7.5, dt, canvasHeight);

        } else if (this.difficulty === 'impossible') {
            if (targetBall.vx > 0) {
                const timeToGoal = (paddle.x - targetBall.x) / targetBall.vx;
                let predictedY = targetBall.y + targetBall.vy * timeToGoal;
                while (predictedY < 0 || predictedY > canvasHeight) {
                    if (predictedY < 0) predictedY = -predictedY;
                    if (predictedY > canvasHeight) predictedY = 2 * canvasHeight - predictedY;
                }
                this.targetY = predictedY;
            } else {
                this.targetY = powerUps.length > 0 ? powerUps[0].y : canvasHeight / 2;
            }
            this.movePaddle(paddle, this.targetY, 10.5, dt, canvasHeight);

            if (paddle.laserAmmo > 0 && Math.abs(paddle.y - playerPaddle.y) < 40) {
                paddle.shootLaser = true;
            }

        // --- Boss Behaviors --- //
        } else if (this.difficulty === 'boss_mothership') {
            // Mothership Core: High stability, heavy movement
            this.targetY = targetBall.y;
            this.movePaddle(paddle, this.targetY, 8.5, dt, canvasHeight);

        } else if (this.difficulty === 'boss_glitch') {
            // Glitch Overlord: Teleports every 2.2 seconds!
            this.glitchTimer += dt;
            if (this.glitchTimer > 2.2) {
                this.glitchTimer = 0;
                paddle.y = Math.random() * (canvasHeight - paddle.height);
                if (window.sound) window.sound.playWarp();
            } else {
                this.movePaddle(paddle, targetBall.y, 6.0, dt, canvasHeight);
            }

        } else if (this.difficulty === 'boss_twin') {
            // Twin Cores: Moves towards ball
            this.targetY = targetBall.y;
            this.movePaddle(paddle, this.targetY, 9.0, dt, canvasHeight);
        }
    }

    movePaddle(paddle, targetY, maxSpeed, dt, canvasHeight) {
        const paddleCenter = paddle.y + paddle.height / 2;
        const diff = targetY - paddleCenter;

        if (Math.abs(diff) > 5) {
            const dir = Math.sign(diff);
            const moveDist = Math.min(Math.abs(diff), maxSpeed * 60 * dt);
            paddle.y += dir * moveDist * (paddle.isFrozen ? 0.5 : 1.0);
        }

        paddle.y = Math.max(10, Math.min(canvasHeight - paddle.height - 10, paddle.y));
    }
}

window.AIController = AIController;

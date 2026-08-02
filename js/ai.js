/* ==========================================================================
   Cyber AI & Boss AI Controller Engine (v2.2.3)
   ========================================================================== */

class AIController {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.targetY = 300;
        this.reactionTimer = 0;
        this.errorOffset = 0;
        this.glitchTimer = 0;
        this.variationAngleTimer = Math.random() * Math.PI * 2;
    }

    setDifficulty(diff) {
        this.difficulty = diff;
    }

    update(dt, paddle, balls, powerUps, playerPaddle, canvasHeight, canvasWidth) {
        if (!paddle || balls.length === 0) return;

        const isLeft = paddle.x < canvasWidth / 2;

        let targetBall = balls[0];
        for (const b of balls) {
            const isHeadingTowardsMe = isLeft ? b.vx < 0 : b.vx > 0;
            if (isHeadingTowardsMe && (isLeft ? b.x < targetBall.x : b.x > targetBall.x)) {
                targetBall = b;
            }
        }

        const isMovingTowardsMe = isLeft ? targetBall.vx < 0 : targetBall.vx > 0;

        // Dynamic target variation
        this.variationAngleTimer += 1.5 * dt;
        const paddleHitOffset = Math.sin(this.variationAngleTimer) * 22;

        // Auto-fire Laser Ammo whenever equipped and aligned with opponent!
        if (paddle.laserAmmo > 0 && playerPaddle) {
            const paddleCenter = paddle.y + paddle.height / 2;
            const enemyCenter = playerPaddle.y + playerPaddle.height / 2;
            if (Math.abs(paddleCenter - enemyCenter) < 70) {
                paddle.shootLaser = true;
            }
        }

        if (this.difficulty === 'easy') {
            if (this.reactionTimer > 0.3) {
                this.reactionTimer = 0;
                this.errorOffset = (Math.random() - 0.5) * 60;
            }
            this.targetY = targetBall.y + this.errorOffset;
            this.movePaddle(paddle, this.targetY, 4.8, dt, canvasHeight);

        } else if (this.difficulty === 'medium') {
            if (isMovingTowardsMe) {
                const paddleTargetX = isLeft ? paddle.x + paddle.width : paddle.x;
                const timeToGoal = (paddleTargetX - targetBall.x) / targetBall.vx;
                let predictedY = targetBall.y + targetBall.vy * timeToGoal;

                while (predictedY < 0 || predictedY > canvasHeight) {
                    if (predictedY < 0) predictedY = -predictedY;
                    if (predictedY > canvasHeight) predictedY = 2 * canvasHeight - predictedY;
                }
                this.targetY = predictedY + paddleHitOffset;
            } else {
                this.targetY = canvasHeight / 2;
            }
            this.movePaddle(paddle, this.targetY, 7.5, dt, canvasHeight);

        } else if (this.difficulty === 'impossible') {
            if (isMovingTowardsMe) {
                const paddleTargetX = isLeft ? paddle.x + paddle.width : paddle.x;
                const timeToGoal = (paddleTargetX - targetBall.x) / targetBall.vx;
                let predictedY = targetBall.y + targetBall.vy * timeToGoal;

                while (predictedY < 0 || predictedY > canvasHeight) {
                    if (predictedY < 0) predictedY = -predictedY;
                    if (predictedY > canvasHeight) predictedY = 2 * canvasHeight - predictedY;
                }
                this.targetY = predictedY + paddleHitOffset * 0.7;
            } else {
                this.targetY = powerUps.length > 0 ? powerUps[0].y : canvasHeight / 2;
            }
            this.movePaddle(paddle, this.targetY, 10.5, dt, canvasHeight);

        } else if (this.difficulty === 'boss_mothership') {
            this.targetY = targetBall.y + paddleHitOffset;
            this.movePaddle(paddle, this.targetY, 8.5, dt, canvasHeight);

        } else if (this.difficulty === 'boss_glitch') {
            this.glitchTimer += dt;
            if (this.glitchTimer > 2.2) {
                this.glitchTimer = 0;
                paddle.y = Math.random() * (canvasHeight - paddle.height);
                if (window.sound) window.sound.playWarp();
            } else {
                this.movePaddle(paddle, targetBall.y + paddleHitOffset, 6.0, dt, canvasHeight);
            }

        } else if (this.difficulty === 'boss_twin') {
            this.targetY = targetBall.y + paddleHitOffset;
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

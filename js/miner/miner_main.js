/* ==========================================================================
   Manic Miner: Cyber Edition - Application Entrypoint & Input Controller (v3.0.1)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const airFill = document.getElementById('airFill');
    const airText = document.getElementById('airText');
    const scoreText = document.getElementById('scoreText');
    const livesText = document.getElementById('livesText');
    const levelNameEl = document.getElementById('levelName');

    const startModal = document.getElementById('startModal');
    const pauseModal = document.getElementById('pauseModal');
    const gameOverModal = document.getElementById('gameOverModal');

    const btnStartGame = document.getElementById('btnStartGame');
    const btnResume = document.getElementById('btnResume');
    const btnQuit = document.getElementById('btnQuit');
    const btnPlayAgain = document.getElementById('btnPlayAgain');
    const btnReturnMenu = document.getElementById('btnReturnMenu');

    const btnSoundToggle = document.getElementById('btnSoundToggle');
    const volumeSlider = document.getElementById('volumeSlider');

    const particles = new ParticleSystem();
    const miner = new MinerEngine(canvas, window.sound, particles);

    const keys = {};
    const input = { left: false, right: false, jump: false };

    // Lazy Audio Init
    document.addEventListener('keydown', () => window.sound.init(), { once: true });
    document.addEventListener('click', () => window.sound.init(), { once: true });

    if (btnStartGame) {
        btnStartGame.addEventListener('click', () => {
            if (startModal) startModal.classList.remove('active');
            miner.loadLevel(0);
        });
    }

    if (btnResume) {
        btnResume.addEventListener('click', () => {
            if (pauseModal) pauseModal.classList.remove('active');
            miner.state = 'PLAYING';
        });
    }

    if (btnQuit) {
        btnQuit.addEventListener('click', () => {
            if (pauseModal) pauseModal.classList.remove('active');
            if (startModal) startModal.classList.add('active');
            miner.state = 'MENU';
        });
    }

    if (btnPlayAgain) {
        btnPlayAgain.addEventListener('click', () => {
            if (gameOverModal) gameOverModal.classList.remove('active');
            miner.loadLevel(0);
        });
    }

    if (btnReturnMenu) {
        btnReturnMenu.addEventListener('click', () => {
            if (gameOverModal) gameOverModal.classList.remove('active');
            if (startModal) startModal.classList.add('active');
            miner.state = 'MENU';
        });
    }

    if (btnSoundToggle) {
        btnSoundToggle.addEventListener('click', () => {
            window.sound.muted = !window.sound.muted;
            btnSoundToggle.textContent = window.sound.muted ? '🔇' : '🔊';
            window.sound.setMuted(window.sound.muted);
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            window.sound.setVolume(parseFloat(e.target.value));
        });
    }

    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        if (e.code === 'KeyP' || e.code === 'Escape') {
            if (miner.state === 'PLAYING') {
                miner.state = 'PAUSED';
                if (pauseModal) pauseModal.classList.add('active');
            } else if (miner.state === 'PAUSED') {
                miner.state = 'PLAYING';
                if (pauseModal) pauseModal.classList.remove('active');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    function processInput() {
        input.left = keys['KeyA'] || keys['ArrowLeft'];
        input.right = keys['KeyD'] || keys['ArrowRight'];
        input.jump = keys['Space'] || keys['KeyW'] || keys['ArrowUp'];

        // Gamepad API Poller
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        if (gamepads[0]) {
            const gp = gamepads[0];
            const axisX = gp.axes[0];
            if (axisX < -0.25 || (gp.buttons[14] && gp.buttons[14].pressed)) input.left = true;
            if (axisX > 0.25 || (gp.buttons[15] && gp.buttons[15].pressed)) input.right = true;
            if ((gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[12] && gp.buttons[12].pressed)) input.jump = true;
        }
    }

    function updateHUD() {
        if (!miner.level) return;

        if (levelNameEl) levelNameEl.textContent = miner.level.name;
        if (scoreText) scoreText.textContent = miner.willy.score;
        if (livesText) livesText.textContent = '❤️'.repeat(miner.willy.lives);

        const airPct = Math.max(0, (miner.airSupply / miner.level.airLimit) * 100);
        if (airFill) airFill.style.width = `${airPct}%`;
        if (airText) airText.textContent = `${Math.ceil(miner.airSupply)}s`;

        if (gameOverModal && (miner.state === 'GAMEOVER' || miner.state === 'VICTORY') && !gameOverModal.classList.contains('active')) {
            const winnerText = document.getElementById('winnerText');
            const finalScoreText = document.getElementById('finalScoreText');
            const statsSummary = document.getElementById('statsSummary');

            if (winnerText) {
                if (miner.state === 'VICTORY') {
                    winnerText.textContent = "ALL CAVERNS ESCAPED!";
                    winnerText.style.color = "#00ff66";
                } else {
                    winnerText.textContent = "MINER WILLY DEFEATED!";
                    winnerText.style.color = "#ff0055";
                }
            }

            if (finalScoreText) finalScoreText.textContent = `SCORE: ${miner.willy.score}`;
            if (statsSummary) statsSummary.innerHTML = `<div>🏆 Stage Reached: <strong>${miner.currentLevelIdx + 1}</strong></div>`;
            gameOverModal.classList.add('active');
        }
    }

    let lastTime = performance.now();

    function gameLoop(now) {
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        processInput();
        miner.update(dt, input);
        miner.render();
        updateHUD();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});

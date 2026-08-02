/* ==========================================================================
   CyberPong v2.0 Application Entrypoint & UI Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('gameCanvas');
    const p1ScoreEl = document.getElementById('p1Score');
    const p2ScoreEl = document.getElementById('p2Score');
    const p1NameEl = document.getElementById('p1Name');
    const p2NameEl = document.getElementById('p2Name');
    const p1PowerupsEl = document.getElementById('p1Powerups');
    const p2PowerupsEl = document.getElementById('p2Powerups');
    const p1UltFill = document.getElementById('p1UltFill');
    const p2UltFill = document.getElementById('p2UltFill');
    const matchInfoEl = document.getElementById('matchInfo');

    // Boss Bar Elements
    const bossBarWrapper = document.getElementById('bossBarWrapper');
    const bossNameEl = document.getElementById('bossName');
    const bossHealthFill = document.getElementById('bossHealthFill');

    // Audio & Theme Controls
    const btnSoundToggle = document.getElementById('btnSoundToggle');
    const btnBgmToggle = document.getElementById('btnBgmToggle');
    const volumeSlider = document.getElementById('volumeSlider');
    const themeButtons = document.querySelectorAll('.btn-theme');

    // Modals
    const startModal = document.getElementById('startModal');
    const pauseModal = document.getElementById('pauseModal');
    const gameOverModal = document.getElementById('gameOverModal');

    // Mode / Difficulty / Score Selectors
    const btnMode1P = document.getElementById('btnMode1P');
    const btnMode2P = document.getElementById('btnMode2P');
    const btnModeBoss = document.getElementById('btnModeBoss');
    const aiDifficultyGroup = document.getElementById('aiDifficultyGroup');
    const targetScoreGroup = document.getElementById('targetScoreGroup');
    const diffButtons = document.querySelectorAll('.btn-diff');
    const scoreButtons = document.querySelectorAll('.btn-score');
    const btnStartGame = document.getElementById('btnStartGame');
    const btnResume = document.getElementById('btnResume');
    const btnQuit = document.getElementById('btnQuit');
    const btnPlayAgain = document.getElementById('btnPlayAgain');
    const btnReturnMenu = document.getElementById('btnReturnMenu');

    // Game Engine & FX
    const particles = new ParticleSystem();
    const game = new GameEngine(canvas, window.sound, particles);

    // Settings State
    let selectedMode = '1p';
    let selectedDiff = 'medium';
    let selectedScore = 7;
    let selectedTheme = 'cyber';
    let currentBossStage = 1;

    const keys = {};

    // Sound Lazy Init
    document.addEventListener('keydown', () => window.sound.init(), { once: true });
    document.addEventListener('click', () => window.sound.init(), { once: true });

    // Mode Selection
    btnMode1P.addEventListener('click', () => {
        selectedMode = '1p';
        btnMode1P.classList.add('active');
        btnMode2P.classList.remove('active');
        btnModeBoss.classList.remove('active');
        aiDifficultyGroup.style.display = 'block';
        targetScoreGroup.style.display = 'block';
        bossBarWrapper.style.display = 'none';
        p2NameEl.textContent = 'CYBER AI';
    });

    btnMode2P.addEventListener('click', () => {
        selectedMode = '2p';
        btnMode2P.classList.add('active');
        btnMode1P.classList.remove('active');
        btnModeBoss.classList.remove('active');
        aiDifficultyGroup.style.display = 'none';
        targetScoreGroup.style.display = 'block';
        bossBarWrapper.style.display = 'none';
        p2NameEl.textContent = 'PLAYER 2';
    });

    btnModeBoss.addEventListener('click', () => {
        selectedMode = 'boss';
        btnModeBoss.classList.add('active');
        btnMode1P.classList.remove('active');
        btnMode2P.classList.remove('active');
        aiDifficultyGroup.style.display = 'none';
        targetScoreGroup.style.display = 'none';
        bossBarWrapper.style.display = 'flex';
        p2NameEl.textContent = 'MOTHERSHIP CORE';
    });

    // Theme Switcher
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTheme = btn.dataset.theme;

            document.body.className = '';
            if (selectedTheme !== 'cyber') {
                document.body.classList.add(`theme-${selectedTheme}`);
            }
            particles.setTheme(selectedTheme);
        });
    });

    // Difficulty Selector
    diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            diffButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDiff = btn.dataset.diff;
        });
    });

    // Target Score Selector
    scoreButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            scoreButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedScore = parseInt(btn.dataset.score, 10);
        });
    });

    // Start Game
    btnStartGame.addEventListener('click', () => {
        startModal.classList.remove('active');

        if (selectedMode === 'boss') {
            currentBossStage = 1;
            matchInfoEl.textContent = `BOSS CAMPAIGN - STAGE 1`;
            bossNameEl.textContent = `MOTHERSHIP CORE`;
            p2NameEl.textContent = `MOTHERSHIP CORE`;
            bossBarWrapper.style.display = 'flex';
            game.startMatch('boss', 'boss_mothership', 5, 1);
        } else {
            bossBarWrapper.style.display = 'none';
            matchInfoEl.textContent = `FIRST TO ${selectedScore} WINS`;
            game.startMatch(selectedMode, selectedDiff, selectedScore);
        }
    });

    // Pause Controls
    btnResume.addEventListener('click', () => {
        pauseModal.classList.remove('active');
        game.state = 'PLAYING';
    });

    btnQuit.addEventListener('click', () => {
        pauseModal.classList.remove('active');
        startModal.classList.add('active');
        game.state = 'MENU';
    });

    // Game Over Actions
    btnPlayAgain.addEventListener('click', () => {
        gameOverModal.classList.remove('active');
        if (selectedMode === 'boss') {
            game.startMatch('boss', 'boss_mothership', 5, currentBossStage);
        } else {
            game.startMatch(selectedMode, selectedDiff, selectedScore);
        }
    });

    btnReturnMenu.addEventListener('click', () => {
        gameOverModal.classList.remove('active');
        startModal.classList.add('active');
        game.state = 'MENU';
    });

    // Audio Controls
    btnSoundToggle.addEventListener('click', () => {
        window.sound.muted = !window.sound.muted;
        btnSoundToggle.textContent = window.sound.muted ? '🔇' : '🔊';
        window.sound.setMuted(window.sound.muted);
    });

    btnBgmToggle.addEventListener('click', () => {
        const bgmState = window.sound.toggleBgm();
        btnBgmToggle.textContent = bgmState ? '🎵 BGM: ON' : '🎵 BGM: OFF';
    });

    volumeSlider.addEventListener('input', (e) => {
        window.sound.setVolume(parseFloat(e.target.value));
    });

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        if (e.code === 'KeyP' || e.code === 'Escape') {
            if (game.state === 'PLAYING') {
                game.state = 'PAUSED';
                pauseModal.classList.add('active');
            } else if (game.state === 'PAUSED') {
                game.state = 'PLAYING';
                pauseModal.classList.remove('active');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Input Processing
    function processInput(dt) {
        if (game.state !== 'PLAYING') return;

        const moveSpeed = 480;

        // P1 Controls (W/S for move, Space/D for laser, Q for Ultimate)
        if (!game.p1.isFrozen && game.p1.stunTimer <= 0) {
            if (keys['KeyW']) game.p1.y -= moveSpeed * dt;
            if (keys['KeyS']) game.p1.y += moveSpeed * dt;
        } else if (game.p1.isFrozen && game.p1.stunTimer <= 0) {
            if (keys['KeyW']) game.p1.y -= moveSpeed * 0.5 * dt;
            if (keys['KeyS']) game.p1.y += moveSpeed * 0.5 * dt;
        }

        if (keys['Space'] || keys['KeyD']) game.p1.shootLaser = true;
        if (keys['KeyQ'] || keys['KeyE']) game.triggerUltimate(game.p1);

        game.p1.y = Math.max(10, Math.min(game.height - game.p1.height - 10, game.p1.y));

        // P2 Controls in 2P Mode (Arrow Up/Down, Enter for laser, Shift for Ultimate)
        if (game.mode === '2p') {
            if (!game.p2.isFrozen && game.p2.stunTimer <= 0) {
                if (keys['ArrowUp']) game.p2.y -= moveSpeed * dt;
                if (keys['ArrowDown']) game.p2.y += moveSpeed * dt;
            } else if (game.p2.isFrozen && game.p2.stunTimer <= 0) {
                if (keys['ArrowUp']) game.p2.y -= moveSpeed * 0.5 * dt;
                if (keys['ArrowDown']) game.p2.y += moveSpeed * 0.5 * dt;
            }

            if (keys['Enter'] || keys['ArrowLeft']) game.p2.shootLaser = true;
            if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyM']) game.triggerUltimate(game.p2);

            game.p2.y = Math.max(10, Math.min(game.height - game.p2.height - 10, game.p2.y));
        }
    }

    // HUD Update Loop
    function updateHUD() {
        p1ScoreEl.textContent = game.p1.score;
        p2ScoreEl.textContent = game.p2.score;

        // Ultimate Meters
        p1UltFill.style.width = `${game.p1.ultEnergy}%`;
        p2UltFill.style.width = `${game.p2.ultEnergy}%`;
        if (game.p1.ultEnergy >= 100) p1UltFill.classList.add('ready'); else p1UltFill.classList.remove('ready');
        if (game.p2.ultEnergy >= 100) p2UltFill.classList.add('ready'); else p2UltFill.classList.remove('ready');

        // Boss Health Bar
        if (game.mode === 'boss') {
            const healthPct = Math.max(0, (game.bossHealth / game.maxBossHealth) * 100);
            bossHealthFill.style.width = `${healthPct}%`;
        }

        renderPowerupBadges(game.p1, p1PowerupsEl);
        renderPowerupBadges(game.p2, p2PowerupsEl);

        // Check Game Over
        if (game.state === 'GAMEOVER' && !gameOverModal.classList.contains('active')) {
            const winner = game.p1.score >= game.targetScore || (game.mode === 'boss' && game.bossHealth <= 0) ? 'PLAYER 1' : (game.mode === 'boss' ? 'CYBER BOSS' : (game.mode === '1p' ? 'CYBER AI' : 'PLAYER 2'));
            const winnerText = document.getElementById('winnerText');
            const finalScoreText = document.getElementById('finalScoreText');
            const statsSummary = document.getElementById('statsSummary');

            winnerText.textContent = `${winner} VICTORIOUS!`;
            winnerText.style.color = game.p1.score >= game.targetScore || (game.mode === 'boss' && game.bossHealth <= 0) ? '#00f3ff' : '#ff0055';
            finalScoreText.textContent = `${game.p1.score} - ${game.p2.score}`;

            statsSummary.innerHTML = `
                <div>🔥 Max Rally: <strong>${game.stats.maxRally}</strong></div>
                <div>⚡ Upgrades Claimed: <strong>${game.stats.powerUpsCollected}</strong></div>
            `;

            gameOverModal.classList.add('active');
        }
    }

    function renderPowerupBadges(paddle, container) {
        let html = '';
        if (paddle.hasShield) html += `<div class="badge-powerup" title="Shield Barrier">🛡️</div>`;
        if (paddle.hasMagnet) html += `<div class="badge-powerup" title="Magnetic Field">🧲</div>`;
        if (paddle.isFrozen) html += `<div class="badge-powerup" title="Frozen">❄️</div>`;
        if (paddle.sizeBoostTimer > 0) html += `<div class="badge-powerup" title="Titan Size">📏</div>`;
        if (paddle.laserAmmo > 0) html += `<div class="badge-powerup" title="Laser Ammo (${paddle.laserAmmo})">🔫${paddle.laserAmmo}</div>`;
        if (paddle.isSplit) html += `<div class="badge-powerup" title="Splitter Paddle">🪓</div>`;

        container.innerHTML = html;
    }

    // Main 60 FPS Loop
    let lastTime = performance.now();

    function gameLoop(now) {
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        processInput(dt);
        game.update(dt);
        game.render();
        updateHUD();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});

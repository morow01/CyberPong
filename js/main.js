/* ==========================================================================
   CyberPong v3.1.3 Application Entrypoint & UI Controller
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

    // Gamepad Badges
    const p1GamepadBadge = document.getElementById('p1GamepadBadge');
    const p2GamepadBadge = document.getElementById('p2GamepadBadge');
    const gp1Status = document.getElementById('gp1Status');
    const gp2Status = document.getElementById('gp2Status');

    // Boss Bar Elements
    const bossBarWrapper = document.getElementById('bossBarWrapper');
    const bossNameEl = document.getElementById('bossName');
    const bossHealthFill = document.getElementById('bossHealthFill');

    // Audio & Theme Controls
    const btnSoundToggle = document.getElementById('btnSoundToggle');
    const btnBgmToggle = document.getElementById('btnBgmToggle');
    const btnAimAssistToggle = document.getElementById('btnAimAssistToggle');
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
    const btnModeDemo = document.getElementById('btnModeDemo');
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

    // Register immediate Game Over callback
    game.onGameOverCallback = showGameOverModal;

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
    if (btnMode1P) {
        btnMode1P.addEventListener('click', () => {
            selectedMode = '1p';
            btnMode1P.classList.add('active');
            if (btnMode2P) btnMode2P.classList.remove('active');
            if (btnModeBoss) btnModeBoss.classList.remove('active');
            if (btnModeDemo) btnModeDemo.classList.remove('active');
            if (aiDifficultyGroup) aiDifficultyGroup.style.display = 'block';
            if (targetScoreGroup) targetScoreGroup.style.display = 'block';
            if (bossBarWrapper) bossBarWrapper.style.display = 'none';
            if (p1NameEl) p1NameEl.textContent = 'PLAYER 1';
            if (p2NameEl) p2NameEl.textContent = 'CYBER AI';
        });
    }

    if (btnMode2P) {
        btnMode2P.addEventListener('click', () => {
            selectedMode = '2p';
            btnMode2P.classList.add('active');
            if (btnMode1P) btnMode1P.classList.remove('active');
            if (btnModeBoss) btnModeBoss.classList.remove('active');
            if (btnModeDemo) btnModeDemo.classList.remove('active');
            if (aiDifficultyGroup) aiDifficultyGroup.style.display = 'none';
            if (targetScoreGroup) targetScoreGroup.style.display = 'block';
            if (bossBarWrapper) bossBarWrapper.style.display = 'none';
            if (p1NameEl) p1NameEl.textContent = 'PLAYER 1';
            if (p2NameEl) p2NameEl.textContent = 'PLAYER 2';
        });
    }

    if (btnModeBoss) {
        btnModeBoss.addEventListener('click', () => {
            selectedMode = 'boss';
            btnModeBoss.classList.add('active');
            if (btnMode1P) btnMode1P.classList.remove('active');
            if (btnMode2P) btnMode2P.classList.remove('active');
            if (btnModeDemo) btnModeDemo.classList.remove('active');
            if (aiDifficultyGroup) aiDifficultyGroup.style.display = 'none';
            if (targetScoreGroup) targetScoreGroup.style.display = 'none';
            if (bossBarWrapper) bossBarWrapper.style.display = 'flex';
            if (p1NameEl) p1NameEl.textContent = 'PLAYER 1';
            if (p2NameEl) p2NameEl.textContent = 'MOTHERSHIP CORE';
        });
    }

    if (btnModeDemo) {
        btnModeDemo.addEventListener('click', () => {
            selectedMode = 'demo';
            btnModeDemo.classList.add('active');
            if (btnMode1P) btnMode1P.classList.remove('active');
            if (btnMode2P) btnMode2P.classList.remove('active');
            if (btnModeBoss) btnModeBoss.classList.remove('active');
            if (aiDifficultyGroup) aiDifficultyGroup.style.display = 'none';
            if (targetScoreGroup) targetScoreGroup.style.display = 'block';
            if (bossBarWrapper) bossBarWrapper.style.display = 'none';
            if (p1NameEl) p1NameEl.textContent = 'CYBER AI 1';
            if (p2NameEl) p2NameEl.textContent = 'CYBER AI 2';
        });
    }

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

    // Aim Assist Toggle
    if (btnAimAssistToggle) {
        btnAimAssistToggle.addEventListener('click', () => {
            game.showAimAssist = !game.showAimAssist;
            if (game.showAimAssist) {
                btnAimAssistToggle.classList.add('active');
                btnAimAssistToggle.textContent = '🎯 AIM: ON';
            } else {
                btnAimAssistToggle.classList.remove('active');
                btnAimAssistToggle.textContent = '🎯 AIM: OFF';
            }
        });
    }

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
    if (btnStartGame) {
        btnStartGame.addEventListener('click', () => {
            if (startModal) startModal.classList.remove('active');

            if (selectedMode === 'boss') {
                currentBossStage = 1;
                if (matchInfoEl) matchInfoEl.textContent = `BOSS CAMPAIGN - STAGE 1`;
                if (bossNameEl) bossNameEl.textContent = `MOTHERSHIP CORE`;
                if (p2NameEl) p2NameEl.textContent = `MOTHERSHIP CORE`;
                if (bossBarWrapper) bossBarWrapper.style.display = 'flex';
                game.startMatch('boss', 'boss_mothership', 5, 1);
            } else if (selectedMode === 'demo') {
                if (matchInfoEl) matchInfoEl.textContent = `AI VS AI DEMO MATCH`;
                if (bossBarWrapper) bossBarWrapper.style.display = 'none';
                game.startMatch('demo', 'medium', selectedScore);
            } else {
                if (bossBarWrapper) bossBarWrapper.style.display = 'none';
                if (matchInfoEl) matchInfoEl.textContent = `FIRST TO ${selectedScore} WINS`;
                game.startMatch(selectedMode, selectedDiff, selectedScore);
            }
        });
    }

    // Pause Controls
    if (btnResume) {
        btnResume.addEventListener('click', () => {
            if (pauseModal) pauseModal.classList.remove('active');
            game.state = 'PLAYING';
        });
    }

    if (btnQuit) {
        btnQuit.addEventListener('click', () => {
            if (pauseModal) pauseModal.classList.remove('active');
            if (startModal) startModal.classList.add('active');
            game.state = 'MENU';
        });
    }

    // Game Over Actions
    if (btnPlayAgain) {
        btnPlayAgain.addEventListener('click', () => {
            if (gameOverModal) gameOverModal.classList.remove('active');
            if (selectedMode === 'boss') {
                game.startMatch('boss', 'boss_mothership', 5, currentBossStage);
            } else {
                game.startMatch(selectedMode, selectedDiff, selectedScore);
            }
        });
    }

    if (btnReturnMenu) {
        btnReturnMenu.addEventListener('click', () => {
            if (gameOverModal) gameOverModal.classList.remove('active');
            if (startModal) startModal.classList.add('active');
            game.state = 'MENU';
        });
    }

    // Audio Controls
    if (btnSoundToggle) {
        btnSoundToggle.addEventListener('click', () => {
            window.sound.muted = !window.sound.muted;
            btnSoundToggle.textContent = window.sound.muted ? '🔇' : '🔊';
            window.sound.setMuted(window.sound.muted);
        });
    }

    if (btnBgmToggle) {
        btnBgmToggle.addEventListener('click', () => {
            const bgmState = window.sound.toggleBgm();
            btnBgmToggle.textContent = bgmState ? '🎵 BGM: ON' : '🎵 BGM: OFF';
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            window.sound.setVolume(parseFloat(e.target.value));
        });
    }

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        if (e.code === 'KeyP' || e.code === 'Escape') {
            if (game.state === 'PLAYING') {
                game.state = 'PAUSED';
                if (pauseModal) pauseModal.classList.add('active');
            } else if (game.state === 'PAUSED') {
                game.state = 'PLAYING';
                if (pauseModal) pauseModal.classList.remove('active');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Gamepad Event Listeners
    window.addEventListener('gamepadconnected', (e) => {
        window.sound.init();
        updateGamepadStatusBadges();
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        updateGamepadStatusBadges();
    });

    function updateGamepadStatusBadges() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp1 = gamepads[0];
        const gp2 = gamepads[1];

        if (p1GamepadBadge && gp1Status) {
            if (gp1) {
                p1GamepadBadge.classList.add('connected');
                gp1Status.innerHTML = `🎮 Controller 1: <span class="status-on">${gp1.id.substring(0, 20)}</span>`;
            } else {
                p1GamepadBadge.classList.remove('connected');
                gp1Status.innerHTML = `🎮 Controller 1: <span class="status-off">Disconnected</span>`;
            }
        }

        if (p2GamepadBadge && gp2Status) {
            if (gp2) {
                p2GamepadBadge.classList.add('connected');
                gp2Status.innerHTML = `🎮 Controller 2: <span class="status-on">${gp2.id.substring(0, 20)}</span>`;
            } else {
                p2GamepadBadge.classList.remove('connected');
                gp2Status.innerHTML = `🎮 Controller 2: <span class="status-off">Disconnected</span>`;
            }
        }
    }

    // Process Input
    function processInput(dt) {
        if (game.state !== 'PLAYING') return;

        const moveSpeed = 500;
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

        if (game.mode !== 'demo' && !game.p1.isFrozen && game.p1.stunTimer <= 0) {
            let p1Move = 0;
            if (keys['KeyW']) p1Move -= 1;
            if (keys['KeyS']) p1Move += 1;

            if (gamepads[0]) {
                const gp = gamepads[0];
                const axisY = gp.axes[1];
                if (Math.abs(axisY) > 0.15) p1Move += axisY;
                if (gp.buttons[12] && gp.buttons[12].pressed) p1Move -= 1;
                if (gp.buttons[13] && gp.buttons[13].pressed) p1Move += 1;

                if ((gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[7] && gp.buttons[7].pressed)) {
                    game.p1.shootLaser = true;
                }
                if ((gp.buttons[3] && gp.buttons[3].pressed) || (gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[6] && gp.buttons[6].pressed)) {
                    game.triggerUltimate(game.p1);
                }
            }

            const speedMult = game.p1.isFrozen ? 0.5 : 1.0;
            game.p1.y += p1Move * moveSpeed * speedMult * dt;
        }

        if (game.mode !== 'demo') {
            if (keys['Space'] || keys['KeyD']) game.p1.shootLaser = true;
            if (keys['KeyQ'] || keys['KeyE']) game.triggerUltimate(game.p1);
            game.p1.y = Math.max(10, Math.min(game.height - game.p1.height - 10, game.p1.y));
        }

        if (game.mode === '2p') {
            if (!game.p2.isFrozen && game.p2.stunTimer <= 0) {
                let p2Move = 0;
                if (keys['ArrowUp']) p2Move -= 1;
                if (keys['ArrowDown']) p2Move += 1;

                if (gamepads[1]) {
                    const gp = gamepads[1];
                    const axisY = gp.axes[1];
                    if (Math.abs(axisY) > 0.15) p2Move += axisY;
                    if (gp.buttons[12] && gp.buttons[12].pressed) p2Move -= 1;
                    if (gp.buttons[13] && gp.buttons[13].pressed) p2Move += 1;

                    if ((gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[7] && gp.buttons[7].pressed)) {
                        game.p2.shootLaser = true;
                    }
                    if ((gp.buttons[3] && gp.buttons[3].pressed) || (gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[6] && gp.buttons[6].pressed)) {
                        game.triggerUltimate(game.p2);
                    }
                }

                const speedMult = game.p2.isFrozen ? 0.5 : 1.0;
                game.p2.y += p2Move * moveSpeed * speedMult * dt;
            }

            if (keys['Enter'] || keys['ArrowLeft']) game.p2.shootLaser = true;
            if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyM']) game.triggerUltimate(game.p2);
            game.p2.y = Math.max(10, Math.min(game.height - game.p2.height - 10, game.p2.y));
        }
    }

    // Show Game Over Modal
    function showGameOverModal() {
        let winner = 'PLAYER 1';
        let winnerColor = '#00f3ff';

        if (game.mode === 'boss') {
            if (game.bossHealth <= 0) {
                winner = 'PLAYER 1 VICTORIOUS!';
                winnerColor = '#00f3ff';
            } else {
                winner = 'CYBER BOSS VICTORIOUS!';
                winnerColor = '#ff0055';
            }
        } else if (game.mode === 'demo') {
            winner = game.p1.score >= game.targetScore ? 'CYBER AI 1 VICTORIOUS!' : 'CYBER AI 2 VICTORIOUS!';
            winnerColor = game.p1.score >= game.targetScore ? '#00f3ff' : '#ff0055';
        } else if (game.mode === '1p') {
            if (game.p1.score >= game.targetScore) {
                winner = 'PLAYER 1 VICTORIOUS!';
                winnerColor = '#00f3ff';
            } else {
                winner = 'CYBER AI VICTORIOUS!';
                winnerColor = '#ff0055';
            }
        } else {
            winner = game.p1.score >= game.targetScore ? 'PLAYER 1 VICTORIOUS!' : 'PLAYER 2 VICTORIOUS!';
            winnerColor = game.p1.score >= game.targetScore ? '#00f3ff' : '#ff0055';
        }

        const winnerText = document.getElementById('winnerText');
        const finalScoreText = document.getElementById('finalScoreText');
        const statsSummary = document.getElementById('statsSummary');

        if (winnerText) {
            winnerText.textContent = winner;
            winnerText.style.color = winnerColor;
        }
        if (finalScoreText) finalScoreText.textContent = `${game.p1.score} - ${game.p2.score}`;

        if (statsSummary) {
            statsSummary.innerHTML = `
                <div>🔥 Max Rally: <strong>${game.stats.maxRally}</strong></div>
                <div>⚡ Upgrades Claimed: <strong>${game.stats.powerUpsCollected}</strong></div>
            `;
        }

        if (gameOverModal) gameOverModal.classList.add('active');
    }

    // HUD Update Loop
    function updateHUD() {
        if (p1ScoreEl) p1ScoreEl.textContent = game.p1.score;
        if (p2ScoreEl) p2ScoreEl.textContent = game.p2.score;

        if (p1UltFill) {
            p1UltFill.style.width = `${game.p1.ultEnergy}%`;
            if (game.p1.ultEnergy >= 100) p1UltFill.classList.add('ready'); else p1UltFill.classList.remove('ready');
        }

        if (p2UltFill) {
            p2UltFill.style.width = `${game.p2.ultEnergy}%`;
            if (game.p2.ultEnergy >= 100) p2UltFill.classList.add('ready'); else p2UltFill.classList.remove('ready');
        }

        if (game.mode === 'boss' && bossHealthFill) {
            const healthPct = Math.max(0, (game.bossHealth / game.maxBossHealth) * 100);
            bossHealthFill.style.width = `${healthPct}%`;
        }

        // Safety Net: Ensure Game Over Modal shows up when game.state === 'GAMEOVER'
        if (game.state === 'GAMEOVER' && gameOverModal && !gameOverModal.classList.contains('active')) {
            showGameOverModal();
        }

        if (p1PowerupsEl) renderPowerupBadges(game.p1, p1PowerupsEl);
        if (p2PowerupsEl) renderPowerupBadges(game.p2, p2PowerupsEl);
        updateGamepadStatusBadges();
    }

    function renderPowerupBadges(paddle, container) {
        let html = '';
        if (paddle.hasShield) html += `<div class="badge-powerup" title="Shield Barrier">🛡️</div>`;
        if (paddle.hasMagnet) html += `<div class="badge-powerup" title="Magnetic Field">🧲</div>`;
        if (paddle.isFrozen) html += `<div class="badge-powerup" title="Frozen">❄️</div>`;
        if (paddle.hasSight) html += `<div class="badge-powerup" title="Cyber Sight">👁️</div>`;
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

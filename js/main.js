// Punto de entrada principal: mostrar menú al iniciar y arrancar juego al pulsar "Iniciar"
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Beach Kitten Cleanup (menu)...');

    const canvas = document.getElementById('gameCanvas');
    const menu = document.getElementById('menu');
    const startBtn = document.getElementById('startBtn');
    const levelsBtn = document.getElementById('levelsBtn');
    const exitBtn = document.getElementById('exitBtn');
    const levelsPanel = document.getElementById('levelsPanel');
    const startWithLevelBtn = document.getElementById('startWithLevelBtn');
    const backBtn = document.getElementById('backBtn');
    const levelSelect = document.getElementById('levelSelect');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const pausePanel = document.getElementById('pausePanel');
    const resumeBtn = document.getElementById('resumeBtn');
    const returnMenuBtn = document.getElementById('returnMenuBtn');
    const exitFromPauseBtn = document.getElementById('exitFromPauseBtn');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsBtnPause = document.getElementById('settingsBtnPause');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const contrastValueSpan = document.getElementById('contrastValue');
    const chooseCharacterBtn = document.getElementById('chooseCharacterBtn');
    const characterOverlay = document.getElementById('characterOverlay');
    const closeCharBtn = document.getElementById('closeCharBtn');
    const howToBtn = document.getElementById('howToBtn');
    const howToOverlay = document.getElementById('howToOverlay');
    const howToCloseBtn = document.getElementById('howToCloseBtn');

    let gameEngine = null;

    //Fondo de gatitos en el menú
    (function setMenuBackground() {
        const paths = ['./gatitos_meme.jpg', 'js/gatitos_meme.jpg', 'js/utils/gatitos_meme.jpg', 'assets/gatitos_meme.jpg', 'assets/kitten.jpg'];

        function tryLoad(index) {
            if (index >= paths.length) {
                console.warn('No se encontró imagen para el fondo del menú en las rutas configuradas.');
                return;
            }
            const path = paths[index];
            const img = new Image();
            img.onload = () => {
                menu.style.backgroundImage = `url('${path}')`;
                menu.style.backgroundSize = 'cover';
                menu.style.backgroundPosition = 'center';
                menu.style.backgroundRepeat = 'no-repeat';
                console.log('Fondo de menú cargado desde:', path);
            };
            img.onerror = () => {
                tryLoad(index + 1);
            };
            img.src = path;
        }

        tryLoad(0);
    })();

    // Ensure a global theme audio exists and is configured (reused by Game)
    function ensureThemeAudio() {
        try {
            if (window.themeAudio) return window.themeAudio;
            const a = new Audio('assets/Never%20gonna%20Meow%20you%20up.mp3');
            a.loop = true;
            a.volume = 0.6;
            window.themeAudio = a;
            return a;
        } catch (e) {
            return null;
        }
    }

    // Global mute state (persisted in localStorage 'gameMuted')
    try {
        window.isGameMuted = (localStorage.getItem('gameMuted') === '1');
    } catch (e) { window.isGameMuted = false; }

    function setGlobalMute(muted) {
        try {
            window.isGameMuted = !!muted;
            try { localStorage.setItem('gameMuted', window.isGameMuted ? '1' : '0'); } catch (e) {}
            // mute known global audio elements
            try { if (window.themeAudio) window.themeAudio.muted = window.isGameMuted; } catch (e) {}
            try { if (window.gameEngine && window.gameEngine.game) {
                const g = window.gameEngine.game;
                try { if (g.happyAudio) g.happyAudio.muted = window.isGameMuted; } catch (e) {}
                try { if (g.sadAudio) g.sadAudio.muted = window.isGameMuted; } catch (e) {}
            } } catch (e) {}
            // also mute any <audio> elements present
            try { Array.from(document.querySelectorAll('audio')).forEach(a => { try { a.muted = window.isGameMuted; } catch (e) {} }); } catch (e) {}
        } catch (e) {}
    }
    // apply initial mute to any existing audio elements
    try { setGlobalMute(window.isGameMuted); } catch (e) {}

    // NOTE: character cards are now defined statically in `index.html` (only assets/data characters appear)

        // --- Contraste: leer valor guardado, aplicarlo y conectar controles ---
        (function setupContrastControls() {
            const STORAGE_KEY = 'gameContrastPercent';
            const rangeEl = document.getElementById('contrastRangeSettings');
            const resetBtnSettings = document.getElementById('resetContrastBtnSettings');
            // display element for the numeric value
            const contrastValueEl = document.getElementById('contrastValue');
            const CHAR_KEY = 'selectedKitten';

        function applyContrast(valuePercent, persist = true) {
            // valuePercent: 0..100
            const cssContrast = (Number(valuePercent) || 0) / 100;
            if (canvas) {
                canvas.style.filter = `contrast(${cssContrast})`;
            }
            try { if (contrastValueEl) contrastValueEl.textContent = Number(valuePercent).toFixed(0) + '%'; } catch (e) {}
            try { if (rangeEl) rangeEl.value = valuePercent; } catch (e) {}
            if (persist) try { localStorage.setItem(STORAGE_KEY, String(valuePercent)); } catch (e) {}
        }

        // cargar valor guardado (o 100% si no existe)
        let saved = 100;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw !== null) saved = Math.max(0, Math.min(100, parseInt(raw, 10) || 100));
        } catch (e) { saved = 100; }
        applyContrast(saved, false);

        // conectar evento del slider
        if (rangeEl) {
            rangeEl.addEventListener('input', (ev) => {
                const v = parseInt(ev.target.value, 10) || 0;
                applyContrast(v, true);
            });
        }

        if (resetBtnSettings) resetBtnSettings.addEventListener('click', () => applyContrast(100, true));

        // Open/close settings overlay handlers
        try {
            if (settingsBtn) settingsBtn.addEventListener('click', () => {
                if (settingsOverlay) settingsOverlay.classList.remove('hidden');
                // hide main menu slightly to focus
                if (menu) menu.classList.add('hidden');
            });
            if (chooseCharacterBtn) chooseCharacterBtn.addEventListener('click', () => {
                // Open the character selection overlay
                if (characterOverlay) characterOverlay.classList.remove('hidden');
                // hide main menu to focus
                if (menu) menu.classList.add('hidden');
                // focus first card
                try { const first = document.querySelector('#charGrid .char-card'); if (first) first.focus(); } catch (e) {}
            });
            if (settingsBtnPause) settingsBtnPause.addEventListener('click', () => {
                if (settingsOverlay) settingsOverlay.classList.remove('hidden');
            });
            if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => {
                if (settingsOverlay) settingsOverlay.classList.add('hidden');
                // if menu was hidden because settings opened from main and no game running, restore it
                if (menu && !gameEngine) menu.classList.remove('hidden');
            });
            // Cómo jugar handlers
            try {
                if (howToBtn) howToBtn.addEventListener('click', () => {
                    if (howToOverlay) howToOverlay.classList.remove('hidden');
                    if (menu) menu.classList.add('hidden');
                });
                if (howToCloseBtn) howToCloseBtn.addEventListener('click', () => {
                    if (howToOverlay) howToOverlay.classList.add('hidden');
                    if (menu && !gameEngine) menu.classList.remove('hidden');
                });
            } catch (e) {}
        } catch (e) { /* ignore if elements missing */ }

        // Wire mute checkbox in settings
        try {
            const muteCheckbox = document.getElementById('muteCheckbox');
            if (muteCheckbox) {
                // initialize from stored value
                try { muteCheckbox.checked = !!window.isGameMuted; } catch (e) {}
                muteCheckbox.addEventListener('change', (ev) => {
                    try { setGlobalMute(!!ev.target.checked); } catch (e) {}
                });
            }
        } catch (e) {}

        // (Removed) Do not autoplay theme from menu selection — audio should start only when entering a level

        // Character select handler
        // Helper: remove near-white background pixels from an <img> by processing it on a canvas
        function removeWhiteBackgroundFromImg(imgEl, tolerance = 245) {
            return new Promise((resolve) => {
                if (!imgEl) return resolve(null);
                const process = () => {
                    try {
                        const w = imgEl.naturalWidth;
                        const h = imgEl.naturalHeight;
                        if (!w || !h) return resolve(null);
                        const c = document.createElement('canvas');
                        c.width = w; c.height = h;
                        const ctx2 = c.getContext('2d');
                        ctx2.drawImage(imgEl, 0, 0, w, h);
                        try {
                            const imgd = ctx2.getImageData(0, 0, w, h);
                            const data = imgd.data;
                            const thresh = Number(tolerance) || 245;
                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i], g = data[i+1], b = data[i+2];
                                // si el pixel es casi blanco, hacerlo transparente
                                if (r >= thresh && g >= thresh && b >= thresh) {
                                    data[i+3] = 0;
                                }
                            }
                            ctx2.putImageData(imgd, 0, 0);
                            try {
                                const url = c.toDataURL('image/png');
                                imgEl.src = url;
                                return resolve(url);
                            } catch (e) {
                                console.warn('No se pudo convertir canvas a dataURL:', e);
                                return resolve(null);
                            }
                        } catch (e) {
                            // getImageData puede lanzar si la imagen es cross-origin
                            console.warn('No se pudo procesar imagen en canvas (CORS o error):', e);
                            return resolve(null);
                        }
                    } catch (e) {
                        // general fallback
                        return resolve(null);
                    }
                };
                if (imgEl.complete && imgEl.naturalWidth) process();
                else imgEl.addEventListener('load', process, { once: true });
                // timeout por si no carga
                setTimeout(() => resolve(null), 2500);
            });
        }
        // Character card clicks: wire cards in #charGrid
        try {
            const cards = Array.from(document.querySelectorAll('.char-card'));
            cards.forEach(card => {
                const src = card.getAttribute('data-src');
                // procesar la miniatura para quitar fondo blanco si procede
                try {
                    const imgEl = card.querySelector('img');
                    if (imgEl) {
                        // procesar la miniatura para quitar fondo blanco (si posible)
                        removeWhiteBackgroundFromImg(imgEl, 245).catch(() => {});
                    }
                } catch (e) {}
                const onSelect = () => {
                    try { localStorage.setItem(CHAR_KEY, src); } catch (err) {}
                    console.log('Personaje seleccionado:', src);
                    // Update current kitten sprite if game running
                    try {
                        if (window.gameEngine && window.gameEngine.game && window.gameEngine.game.kitten) {
                            if (src && src !== 'default') window.gameEngine.game.kitten.sprite.src = src;
                            else {
                                // reset to default sprite
                                window.gameEngine.game.kitten.sprite.src = 'assets/b0b37662f658b5881f689f7ed6672d2a.png';
                            }
                        }
                    } catch (err) { }
                    // close overlay after selection
                    try { if (characterOverlay) characterOverlay.classList.add('hidden'); } catch (e) {}
                    // restore menu if appropriate
                    try { if (menu && !window.gameEngine) menu.classList.remove('hidden'); } catch (e) {}
                };
                card.addEventListener('click', onSelect);
                card.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onSelect(); } });
            });
            if (closeCharBtn) closeCharBtn.addEventListener('click', () => { if (characterOverlay) characterOverlay.classList.add('hidden'); if (menu && !window.gameEngine) menu.classList.remove('hidden'); });
        } catch (e) {}
        })();

    function showCanvas() {
        canvas.classList.remove('hidden');
    }

    function hideMenu() {
        menu.classList.add('hidden');
    }

    function startGameWithLevel(level) {
        // Always recreate the engine when starting a game to reset timers/state
        try {
            if (gameEngine && typeof gameEngine.stop === 'function') {
                try { gameEngine.stop(); } catch (e) {}
                gameEngine = null;
                window.gameEngine = null;
            }
        } catch (e) {}
        gameEngine = new GameEngine();
        // ocultar overlays si están visibles
        try { document.getElementById('levelCompleteOverlay').classList.add('hidden'); } catch (e) {}
        try { document.getElementById('gameOverOverlay').classList.add('hidden'); } catch (e) {}
        gameEngine.init(level);
        try { if (gameEngine && gameEngine.game) gameEngine.game.elapsedTime = 0; } catch (e) {}
        window.gameEngine = gameEngine; // useful for debugging from console
    }

    // Change level without reloading the page. Keeps global themeAudio playing between levels.
    window.changeLevel = function(nextLevel) {
        try {
            // stop current engine loop
            if (window.gameEngine && typeof window.gameEngine.stop === 'function') {
                window.gameEngine.stop();
            }
        } catch (e) {}
        try {
            // create a fresh engine and start next level
            const newEngine = new GameEngine();
            // hide overlays
            try { document.getElementById('levelCompleteOverlay').classList.add('hidden'); } catch (e) {}
            try { document.getElementById('gameOverOverlay').classList.add('hidden'); } catch (e) {}
            // show canvas and hide menu
            try { document.getElementById('gameCanvas').classList.remove('hidden'); } catch (e) {}
            try { document.getElementById('menu').classList.add('hidden'); } catch (e) {}
            newEngine.init(nextLevel);
            try { if (newEngine && newEngine.game) newEngine.game.elapsedTime = 0; } catch (e) {}
            window.gameEngine = newEngine;
            try { gameEngine = newEngine; } catch (e) {}
        } catch (e) {
            console.warn('changeLevel failed, falling back to navigation', e);
            try { window.location.href = window.location.pathname + '?level=' + nextLevel; } catch (e) {}
        }
    };

    // Stop and reset the global theme audio if present
    function stopThemeAudio() {
        try {
            if (window.themeAudio) {
                try { window.themeAudio.pause(); } catch (e) {}
                try { window.themeAudio.currentTime = 0; } catch (e) {}
            }
        } catch (e) {}
    }

    function startGame() {
        hideMenu();
        showCanvas();
        startGameWithLevel(levelSelect ? levelSelect.value : 1);
        console.log('✅ Juego iniciado');
    }

    // Auto-start if URL contains ?level=X
    (function autoStartFromQuery() {
        try {
            const params = new URLSearchParams(window.location.search);
            const lvl = params.get('level');
            if (lvl) {
                // start game with that level
                hideMenu();
                showCanvas();
                startGameWithLevel(lvl);
                console.log('🔁 Auto-iniciando nivel desde URL:', lvl);
            }
        } catch (e) {
            // ignore
        }
    })();

    // Manejo de tecla Escape para pausa/menu (usa el engine activo: preferir window.gameEngine)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.key === 'Esc') {
            const currentEngine = (window.gameEngine || gameEngine);
            // Si el juego está corriendo, mostrar panel de pausa
            if (currentEngine && currentEngine.state === 'PLAYING') {
                currentEngine.state = 'PAUSED';
                // Mostrar solo el overlay de pausa, no el menú principal
                if (pauseOverlay) pauseOverlay.classList.remove('hidden');
                if (levelsPanel) levelsPanel.classList.add('hidden');
            } else if (currentEngine && currentEngine.state === 'PAUSED') {
                // volver a juego
                currentEngine.state = 'PLAYING';
                if (pauseOverlay) pauseOverlay.classList.add('hidden');
            } else {
                // Si no hay juego en curso, no hacer nada al pulsar ESC (evita mostrar canvas en blanco)
                // Mantener cualquier overlay existente; no alternar el menú.
            }
        }
    });

    // Botones del menú
    startBtn.addEventListener('click', () => startGame());

    levelsBtn.addEventListener('click', () => {
        // Si existe el panel de niveles en esta página, mostrarlo; de lo contrario navegar
        try {
            if (levelsPanel) {
                levelsPanel.classList.remove('hidden');
                return;
            }
        } catch (e) {}
        window.location.href = 'levels.html';
    });

    backBtn.addEventListener('click', () => {
        if (levelsPanel) levelsPanel.classList.add('hidden');
    });

    startWithLevelBtn.addEventListener('click', () => {
        startGame();
        console.log('🎯 Iniciando con nivel:', levelSelect.value);
    });

    exitBtn.addEventListener('click', () => {
        // En navegadores normales no se puede cerrar la pestaña desde JS sin interacción de ventana.
        console.log('⛔ Salir pulsado — oculta menú');
        hideMenu();
    });

    // Handlers del panel de pausa
    if (resumeBtn) resumeBtn.addEventListener('click', () => {
        if (gameEngine) {
            gameEngine.state = 'PLAYING';
            if (pauseOverlay) pauseOverlay.classList.add('hidden');
        }
    });

    if (returnMenuBtn) returnMenuBtn.addEventListener('click', () => {
        // Detener y limpiar motor, volver al menú principal
        if (gameEngine && typeof gameEngine.stop === 'function') {
            gameEngine.stop();
        }
        gameEngine = null;
        window.gameEngine = null;
        // Detener música de tema al volver al menú
        try { stopThemeAudio(); } catch (e) {}
        // Mostrar menú principal y ocultar canvas
        if (pauseOverlay) pauseOverlay.classList.add('hidden');
        if (levelsPanel) levelsPanel.classList.add('hidden');
        canvas.classList.add('hidden');
        menu.classList.remove('hidden');
    });

    if (exitFromPauseBtn) exitFromPauseBtn.addEventListener('click', () => {
        // Intentar salir: redirigir a about:blank como comportamiento de "salir".
        window.location.href = 'about:blank';
    });

    console.log('🎮 Menú listo — pulsa "Iniciar juego"');
});
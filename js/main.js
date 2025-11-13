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

    let gameEngine = null;

    function showCanvas() {
        canvas.classList.remove('hidden');
    }

    function hideMenu() {
        menu.classList.add('hidden');
    }

    function startGameWithLevel(level) {
        if (!gameEngine) {
            gameEngine = new GameEngine();
            // If you later add level-specific setup, you can pass `level` to the engine or game here.
            gameEngine.init();
            window.gameEngine = gameEngine; // useful for debugging from console
        }
    }

    function startGame() {
        hideMenu();
        showCanvas();
        startGameWithLevel(levelSelect ? levelSelect.value : 1);
        console.log('✅ Juego iniciado');
    }

    // Manejo de tecla Escape para pausa/menu
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.key === 'Esc') {
            // Si el juego está corriendo, mostrar panel de pausa
            if (gameEngine && gameEngine.state === 'PLAYING') {
                gameEngine.state = 'PAUSED';
                // Mostrar solo el overlay de pausa, no el menú principal
                if (pauseOverlay) pauseOverlay.classList.remove('hidden');
                if (levelsPanel) levelsPanel.classList.add('hidden');
            } else if (gameEngine && gameEngine.state === 'PAUSED') {
                // volver a juego
                gameEngine.state = 'PLAYING';
                if (pauseOverlay) pauseOverlay.classList.add('hidden');
            } else {
                // Si no hay juego en curso, mostrar/ocultar menú principal
                if (menu.classList.contains('hidden')) {
                    menu.classList.remove('hidden');
                } else {
                    menu.classList.add('hidden');
                }
            }
        }
    });

    // Botones del menú
    startBtn.addEventListener('click', () => startGame());

    levelsBtn.addEventListener('click', () => {
        if (levelsPanel) levelsPanel.classList.remove('hidden');
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
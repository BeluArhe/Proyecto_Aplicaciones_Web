class InputHandler {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Teclado
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });

        // Controles táctiles (para móviles)
        this.setupTouchControls();
    }

    setupTouchControls() {
        // Para futura implementación móvil
        console.log('📱 Controles táctiles listos para implementar');
    }

    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    // Métodos helper para direcciones
    // getMovement(playerId): playerId 1 -> WASD, playerId 2 -> Arrow keys
    getMovement(playerId = 1) {
        if (Number(playerId) === 2) {
            // check configured mapping for player 2; default to IJKL if no preference stored
            try {
                let map = localStorage.getItem('controlsP2');
                if (!map) {
                    map = 'ijkl';
                }
                if (map === 'ijkl') {
                    return {
                        left: this.isKeyPressed('j'),
                        right: this.isKeyPressed('l'),
                        up: this.isKeyPressed('i'),
                        down: this.isKeyPressed('k')
                    };
                }
            } catch (e) {}
            // default arrows
            return {
                left: this.isKeyPressed('arrowleft'),
                right: this.isKeyPressed('arrowright'),
                up: this.isKeyPressed('arrowup'),
                down: this.isKeyPressed('arrowdown')
            };
        }
        // default: player 1 uses WASD (and fallbacks to arrows)
        return {
            left: this.isKeyPressed('a') || this.isKeyPressed('arrowleft'),
            right: this.isKeyPressed('d') || this.isKeyPressed('arrowright'),
            up: this.isKeyPressed('w') || this.isKeyPressed('arrowup'),
            down: this.isKeyPressed('s') || this.isKeyPressed('arrowdown')
        };
    }
}
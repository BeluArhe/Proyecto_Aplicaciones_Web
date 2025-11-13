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
    getMovement() {
        return {
            left: this.isKeyPressed('a') || this.isKeyPressed('arrowleft'),
            right: this.isKeyPressed('d') || this.isKeyPressed('arrowright'),
            up: this.isKeyPressed('w') || this.isKeyPressed('arrowup'),
            down: this.isKeyPressed('s') || this.isKeyPressed('arrowdown')
        };
    }
}
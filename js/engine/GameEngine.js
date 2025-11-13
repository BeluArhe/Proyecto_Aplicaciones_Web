class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 1000 / 60; // 60 FPS
        
        // Sistemas
        this.game = null;
        this.inputHandler = null;
        
        // Estado del juego
        this.state = 'PLAYING';
    }

    init() {
        console.log('🔄 Inicializando GameEngine...');
        
        // Inicializar sistemas
        this.inputHandler = new InputHandler();
        this.game = new Game(this);
        
        // Iniciar game loop
        this.gameLoop();
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Actualizar física y lógica
        this.update(deltaTime);
        
        // Renderizar
        this.render();
        
        // Siguiente frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.state === 'PLAYING') {
            this.game.update(deltaTime);
        }
    }

    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar fondo
        this.drawBackground();
        
        // Renderizar juego
        this.game.render(this.ctx);
        
        // Dibujar información de debug
        this.drawDebugInfo();
    }

    drawBackground() {
        const ctx = this.ctx;
        
        // Cielo
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
        
        // Arena
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(0, this.canvas.height * 0.6, this.canvas.width, this.canvas.height * 0.4);
        
        // Línea del mar
        ctx.strokeStyle = '#1E90FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height * 0.6);
        ctx.lineTo(this.canvas.width, this.canvas.height * 0.6);
        ctx.stroke();
    }

    drawDebugInfo() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Posición: (${Math.round(this.game.kitten.x)}, ${Math.round(this.game.kitten.y)})`, 10, 20);
        this.ctx.fillText(`Velocidad: ${this.game.kitten.speed}`, 10, 40);
        this.ctx.fillText(`Estado: ${this.state}`, 10, 60);
        this.ctx.fillText(`Controles: WASD para mover`, 10, 80);
    }
}
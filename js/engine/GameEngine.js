class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.accumulator = 0;
        this.timestep = 1000 / 60; // 60 FPS
        this.rafId = null;
        this.fps = 0; // smoothed frames-per-second value
        this.waveTime = 0; // tiempo para animar olas
        // parámetros ajustables de las olas
        this.waveSpeed = 1.4; // controla el desplazamiento de la fase de las olas
        this.waveTimeScale = 1.0; // multiplicador para la velocidad de avance del tiempo de ola
        
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
        // Game puede recibir un nivel a través de init's args; default 1
        const level = (arguments && arguments.length) ? arguments[0] : 1;
        this.game = new Game(this, level);
        // HUD: muestra contador en pantalla
        try { this.hud = new HUD(this.game); } catch (e) { this.hud = null; }
        
        // Iniciar game loop
        this.gameLoop();
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Calcular FPS (suavizado). Protegemos contra deltas inesperados.
        if (deltaTime > 0 && deltaTime < 1000) {
            const inst = 1000 / deltaTime;
            const alpha = 0.08; // factor de suavizado (EMA)
            this.fps = this.fps ? (this.fps * (1 - alpha) + inst * alpha) : inst;
        }
        // actualizar tiempo para animación de olas (en segundos)
        this.waveTime += (deltaTime / 1000) * (this.waveTimeScale || 1);

        // Actualizar física y lógica
        this.update(deltaTime);
        
        // Renderizar
        this.render();
        
        // Siguiente frame (guardamos el id para poder cancelar)
        this.rafId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.state === 'PLAYING') {
            this.game.update(deltaTime);
        }
    }

    render() {
        if (this.state === 'STOPPED') return;
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar fondo
        this.drawBackground();
        
        // Renderizar juego
        this.game.render(this.ctx);

        // Renderizar HUD encima
        if (this.hud && typeof this.hud.render === 'function') {
            this.hud.render(this.ctx);
        }
        
        // Dibujar información de debug (FPS, posición)
        this.drawDebugInfo();
    }

    drawBackground() {
        const ctx = this.ctx;
        // parámetros del mar
        const width = this.canvas.width;
        const height = this.canvas.height;
        const baseWaterY = height * 0.78; // borde entre agua y arena (más agua que tierra)
        const surfaceBase = height * 0.48; // altura base de la superficie (donde aparecen olas)

        // Cielo con degradado de atardecer
        const skyTop = 0;
        const skyBottom = Math.max(0, surfaceBase - 20);
        const skyGradient = ctx.createLinearGradient(0, skyTop, 0, skyBottom);
        skyGradient.addColorStop(0, '#FF7E5F'); // naranja
        skyGradient.addColorStop(0.5, '#FD5E53'); // rojo suave
        skyGradient.addColorStop(1, '#FFD194'); // amarillo tenue
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, skyBottom);

        // Agua con olas (dibujamos la línea de superficie usando getWaterSurface)
        ctx.fillStyle = '#1E90FF';
        ctx.beginPath();
        ctx.moveTo(0, baseWaterY);
        for (let x = 0; x <= width; x += 8) {
            ctx.lineTo(x, this.getWaterSurface(x));
        }
        ctx.lineTo(width, baseWaterY);
        ctx.closePath();
        ctx.fill();

        // Línea de espuma/olas (más clara)
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 8) {
            const y = this.getWaterSurface(x);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Arena debajo del agua
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(0, baseWaterY, width, height - baseWaterY);
    }

    drawDebugInfo() {
        // Mostrar solo FPS en la esquina superior izquierda (fondo pequeño para legibilidad)
        const fpsText = this.fps ? `${Math.round(this.fps)} FPS` : 'FPS: --';
        this.ctx.font = 'bold 14px Arial';
        const padding = 8;
        const textMetrics = this.ctx.measureText(fpsText);
        const boxW = Math.ceil(textMetrics.width) + padding * 2;
        const boxH = 26; // altura compacta

        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(8, 8, boxW, boxH);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(fpsText, 8 + padding, 8 + boxH / 2);

        // (Previously drew hearts here; removed per user request.)
    }

    getWaterSurface(x) {
        // Devuelve la coordenada y de la superficie del agua en la posición x
        const base = this.canvas.height * 0.48;
        // Olas más grandes: aumentar la amplitud relativa aún más
        const amplitude = Math.max(28, this.canvas.height * 0.08);
        // frecuencia más baja para olas más largas y visibles
        const frequency = 0.01;
        // velocidad de desplazamiento de las olas (ajustable)
        const speed = (typeof this.waveSpeed === 'number') ? this.waveSpeed : 1.4;
        return base + Math.sin(x * frequency + this.waveTime * speed) * amplitude;
    }

    stop() {
        // Cancela el bucle principal y marca el motor como detenido
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.state = 'STOPPED';
        console.log('🛑 GameEngine detenido');
    }
}
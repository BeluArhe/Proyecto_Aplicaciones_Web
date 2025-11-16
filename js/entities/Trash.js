// Clase base
class Trash {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.weight = 1;
        this.isHeld = false;
        this.points = 10;
        this.width = 22;
        this.height = 22;
    }
    
    update() {
        if (this.isHeld) return;
        // If this trash is floating, update its Y position according to the water surface
        if (this.isFloating && this.game && this.game.engine && typeof this.game.engine.getWaterSurface === 'function') {
            try {
                const engine = this.game.engine;
                // base surface at this x
                const base = engine.getWaterSurface(this.x);
                const amp = (this.buoyancy || 0.6) * 8; // amplitude scales with buoyancy
                const speed = 1.2 + (this.buoyancy || 0) * 0.6;
                const phase = (this._floatPhase || 0);
                this.y = base - 6 + Math.sin(engine.waveTime * speed + phase) * amp;
            } catch (e) {
                // fallback: keep current y
            }
            return;
        }
        // Non-floating trash: remains static (on sand) unless future physics applied
    }

    render(ctx) {
        // simple visual: small colored circle based on type
        const cx = this.x;
        const cy = this.y;
        let color = '#9e9e9e';
        if (this.type === 'plastic') color = '#4da6ff';
        else if (this.type === 'glass') color = '#69c24a';
        else if (this.type === 'can') color = '#d0c12a';
        else if (this.type === 'paper') color = '#ffffff';

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.ellipse(cx, cy, this.width/2, this.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Tipos específicos
class Plastic extends Trash {
    constructor(x, y) {
        super('plastic', x, y);
        this.weight = 0.5;
        this.buoyancy = 0.8; // Flota más
        this.points = 10;
    }
}

class Glass extends Trash {
    constructor(x, y) {
        super('glass', x, y);
        this.weight = 1.5;
        this.isDangerous = true;
        this.points = -20; // Penalización
    }
}
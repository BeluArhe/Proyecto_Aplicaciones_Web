class Shark {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 40;
        this.speed = 60; // px per second (used for patrol)
        this.dir = 1; // 1 right, -1 left
        this.patrolMinX = Math.max(40, x - 160);
        this.patrolMaxX = x + 160;
        this._offset = Math.random() * Math.PI * 2;
    }

    update(deltaTime, engine) {
        // Simple patrol: move horizontally and reverse at edges
        const dx = this.dir * this.speed * (deltaTime / 1000);
        this.x += dx;
        if (this.x < this.patrolMinX) { this.x = this.patrolMinX; this.dir = 1; }
        if (this.x > this.patrolMaxX) { this.x = this.patrolMaxX; this.dir = -1; }
        // slight vertical bobbing to feel like it's in water
        const wave = Math.sin(engine.waveTime * 1.2 + this._offset) * 6;
        this.renderY = (this.y + wave);
    }

    render(ctx) {
        const cx = this.x;
        const cy = this.renderY || this.y;
        const w = this.width;
        const h = this.height;

        ctx.save();
        ctx.translate(cx, cy);
        // body
        ctx.fillStyle = '#6b7c85';
        ctx.beginPath();
        ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI*2);
        ctx.fill();
        // tail
        ctx.fillStyle = '#51626a';
        ctx.beginPath();
        ctx.moveTo(-w/2, 0);
        ctx.lineTo(-w/2 - 18, -12);
        ctx.lineTo(-w/2 - 18, 12);
        ctx.closePath();
        ctx.fill();
        // dorsal fin
        ctx.fillStyle = '#51626a';
        ctx.beginPath();
        ctx.moveTo(-10, -h*0.2);
        ctx.lineTo(6, -h*0.6);
        ctx.lineTo(30, -h*0.1);
        ctx.closePath();
        ctx.fill();
        // eye
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(w*0.18, -h*0.12, 3, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    // approximate bbox for collision
    getBounds() {
        return { x: this.x - this.width/2, y: (this.renderY || this.y) - this.height/2, w: this.width, h: this.height };
    }
}

window.Shark = Shark;

class Lighthouse {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 120;
    }

    update(deltaTime, engine) {
        // static
    }

    render(ctx) {
        const cx = this.x;
        const cy = this.y;
        ctx.save();
        // tower
        ctx.fillStyle = '#fff7e6';
        ctx.fillRect(cx - 12, cy - this.height/2, 24, this.height);
        // red stripes
        ctx.fillStyle = '#e4572e';
        ctx.fillRect(cx - 12, cy - this.height/2 + 10, 24, 16);
        ctx.fillRect(cx - 12, cy - this.height/2 + 40, 24, 16);
        // light
        ctx.fillStyle = 'rgba(255, 240, 120, 0.95)';
        ctx.beginPath(); ctx.ellipse(cx, cy - this.height/2 - 6, 14, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    getBounds() {
        return { x: this.x - 12, y: this.y - this.height/2, w: 24, h: this.height };
    }
}

window.Lighthouse = Lighthouse;

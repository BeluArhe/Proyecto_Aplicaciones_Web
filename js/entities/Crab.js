class Crab {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 28;
        this.dir = Math.random() > 0.5 ? 1 : -1;
        this.speed = 40 + Math.random()*30; // px/s
        this.patrolRange = 80 + Math.random()*80;
        this.baseX = x;
        this._offset = Math.random()*Math.PI*2;
    }

    update(deltaTime, engine) {
        const dx = this.dir * this.speed * (deltaTime / 1000);
        this.x += dx;
        if (this.x < this.baseX - this.patrolRange) this.dir = 1;
        if (this.x > this.baseX + this.patrolRange) this.dir = -1;
        // small bob
        this.renderY = this.y + Math.sin(engine.waveTime * 1.6 + this._offset) * 4;
    }

    render(ctx) {
        const cx = this.x;
        const cy = this.renderY || this.y;
        ctx.save();
        ctx.translate(cx, cy);
        // body
        ctx.fillStyle = '#c94a2a';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        // eyes
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.arc(-8, -6, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -6, 3, 0, Math.PI*2); ctx.fill();
        // claws
        ctx.fillStyle = '#b83b1f';
        ctx.beginPath(); ctx.moveTo(-this.width/2, 0); ctx.lineTo(-this.width/2-10, -10); ctx.lineTo(-this.width/2+2, -2); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(this.width/2, 0); ctx.lineTo(this.width/2+10, -10); ctx.lineTo(this.width/2-2, -2); ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    getBounds() {
        return { x: this.x - this.width/2, y: (this.renderY||this.y) - this.height/2, w: this.width, h: this.height };
    }
}

window.Crab = Crab;

class HUD {
    constructor(game) {
        this.game = game;
        // estilo
        this.padding = 12;
        this.bgColor = 'rgba(0,0,0,0.45)';
        this.textColor = '#FFFFFF';
        this.font = '18px Arial';
        // animación de reinicio de temporizador
        this._resetAnimStart = null;
        this._resetAnimDuration = 700; // ms
        this._resetAnimScale = 0.35; // escala máxima adicional
    }

    render(ctx) {
        try {
            const canvas = this.game.engine.canvas;
            const cw = canvas.width;
            const pad = this.padding;

            // (Hearts are shown under the FPS box by the engine debug overlay.)

            const caught = (this.game.kitten && this.game.kitten.bag) ? this.game.kitten.bag.length : 0;
            const target = this.game.targetTrashCount || 0;

            const text = `Basuras: ${caught} / ${target}`;
            ctx.save();
            ctx.font = this.font;
            const metrics = ctx.measureText(text);
            const tw = metrics.width;
            const th = 20;

            const boxW = tw + pad * 2;
            const boxH = th + pad * 1.2;
            const boxX = cw - boxW - 16; // margen derecha
            const boxY = 12; // margen superior

            // fondo
            ctx.fillStyle = this.bgColor;
            roundRect(ctx, boxX, boxY, boxW, boxH, 8, true, false);

            // texto
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, boxX + pad, boxY + boxH / 2);

            ctx.restore();

            // --- dibujar barra de progreso debajo del contador de basuras ---
            try {
                const progressX = boxX;
                const progressY = boxY + boxH + 8;
                const progressW = boxW;
                const progressH = 10;
                const fraction = (target > 0) ? Math.max(0, Math.min(1, caught / target)) : 0;
                // fondo
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                roundRect(ctx, progressX, progressY, progressW, progressH, 6, true, false);
                // relleno
                ctx.fillStyle = 'rgba(50,200,120,0.95)';
                roundRect(ctx, progressX + 1, progressY + 1, Math.max(2, Math.floor((progressW - 2) * fraction)), progressH - 2, 6, true, false);
            } catch (e) {}

            // --- dibujar cronómetro en la parte superior central ---
            const elapsed = Math.floor((this.game.elapsedTime || 0));
            const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const ss = String(elapsed % 60).padStart(2, '0');
            const timeText = `${mm}:${ss}`;

            // manejar animación de reinicio: si el juego marcó un reinicio, arrancar animación
            const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            try {
                if (this.game && this.game._timeJustReset) {
                    this._resetAnimStart = now;
                    try { this.game._timeJustReset = false; } catch (e) {}
                }
            } catch (e) {}

            // calcular medidas base
            ctx.save();
            ctx.font = this.font;
            const timeMetrics = ctx.measureText(timeText);
            const ttw = timeMetrics.width;
            const tboxW = ttw + pad * 2;
            const tboxH = 24;
            const tboxX = Math.floor((cw - tboxW) / 2);
            const tboxY = 12;

            // determinar si la animación está activa
            let scale = 1;
            if (this._resetAnimStart) {
                const dt = now - this._resetAnimStart;
                if (dt <= this._resetAnimDuration) {
                    const p = Math.max(0, Math.min(1, dt / this._resetAnimDuration));
                    // easing out effect (quadratic)
                    const ease = 1 - (1 - p) * (1 - p);
                    // pulso: empieza grande y vuelve a 1
                    scale = 1 + this._resetAnimScale * (1 - ease);
                } else {
                    this._resetAnimStart = null;
                }
            }

            // dibujar caja y texto con posible escala centrada
            try {
                const cx = Math.floor(tboxX + tboxW / 2);
                const cy = Math.floor(tboxY + tboxH / 2);
                if (scale !== 1) {
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.scale(scale, scale);
                    ctx.translate(-cx, -cy);
                    // fondo (ligeramente más brillante durante la animación)
                    const animBg = this.bgColor;
                    ctx.fillStyle = animBg;
                    roundRect(ctx, tboxX, tboxY, tboxW, tboxH, 8, true, false);
                    ctx.fillStyle = this.textColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(timeText, tboxX + tboxW / 2, tboxY + tboxH / 2);
                    ctx.restore();
                } else {
                    ctx.fillStyle = this.bgColor;
                    roundRect(ctx, tboxX, tboxY, tboxW, tboxH, 8, true, false);
                    ctx.fillStyle = this.textColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(timeText, tboxX + tboxW / 2, tboxY + tboxH / 2);
                }
            } catch (e) {
                // fallback: dibujar sin animación si algo falla
                ctx.fillStyle = this.bgColor;
                roundRect(ctx, tboxX, tboxY, tboxW, tboxH, 8, true, false);
                ctx.fillStyle = this.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(timeText, tboxX + tboxW / 2, tboxY + tboxH / 2);
            }
            ctx.restore();

            // --- mostrar mejor tiempo (highscore) para este nivel en esquina superior izquierda ---
            try {
                const level = (this.game && this.game.level) ? Number(this.game.level) : null;
                if (level) {
                    const bestRaw = localStorage.getItem('highscores');
                    let bestObj = null;
                    try { bestObj = bestRaw ? JSON.parse(bestRaw) : null; } catch (e) { bestObj = null; }
                    const bestForLevel = bestObj && bestObj[String(level)] ? Number(bestObj[String(level)]) : null;
                    let bestText = 'Mejor: --:--';
                    if (bestForLevel !== null && !Number.isNaN(bestForLevel)) {
                        const mm2 = String(Math.floor(bestForLevel / 60)).padStart(2, '0');
                        const ss2 = String(Math.floor(bestForLevel % 60)).padStart(2, '0');
                        bestText = 'Mejor: ' + mm2 + ':' + ss2;
                    }
                    ctx.save();
                    ctx.font = '14px Arial';
                    const bm = ctx.measureText(bestText);
                    const bw = bm.width + pad * 2;
                    const bh = 20;
                    const bx = 12;
                    const by = 44;
                    ctx.fillStyle = 'rgba(0,0,0,0.45)';
                    roundRect(ctx, bx, by, bw, bh, 6, true, false);
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(bestText, bx + pad, by + bh / 2);
                    ctx.restore();
                }
            } catch (e) {}
        } catch (e) {
            // no bloquear render principal
            console.warn('HUD render error', e);
        }
    }
}

// helper: rounded rectangle
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

window.HUD = HUD;

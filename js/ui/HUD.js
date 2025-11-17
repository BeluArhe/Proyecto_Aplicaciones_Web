class HUD {
    constructor(game) {
        this.game = game;
        // estilo
        this.padding = 12;
        this.bgColor = 'rgba(0,0,0,0.45)';
        this.textColor = '#FFFFFF';
        this.font = '18px Arial';
    }

    render(ctx) {
        try {
            const canvas = this.game.engine.canvas;
            const cw = canvas.width;
            const pad = this.padding;

            // (Hearts are shown under the FPS box by the engine debug overlay.)

            const p1caught = (this.game.kitten && this.game.kitten.bag) ? this.game.kitten.bag.length : 0;
            const p2caught = (this.game.kitten2 && this.game.kitten2.bag) ? this.game.kitten2.bag.length : 0;
            const caught = p1caught + p2caught;
            const target = this.game.targetTrashCount || 0;

            // Determine multiplayer mode: only show P2 info if multiplayer is enabled and game has kitten2
            const isMultiplayer = (typeof localStorage !== 'undefined' && localStorage.getItem && localStorage.getItem('multiplayer') === '1' && this.game.kitten2);
            const text = isMultiplayer ? `P1: ${p1caught}  P2: ${p2caught}  Total: ${caught} / ${target}` : `Basura: ${p1caught} / ${target}`;
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

            // (vidas se muestran junto al cronómetro en el centro superior)

            // --- dibujar cronómetro en la parte superior central ---
            const elapsed = Math.floor((this.game.elapsedTime || 0));
            const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const ss = String(elapsed % 60).padStart(2, '0');
            const timeText = `${mm}:${ss}`;
            ctx.save();
            ctx.font = this.font;
            const timeMetrics = ctx.measureText(timeText);
            const ttw = timeMetrics.width;
            const tboxW = ttw + pad * 2;
            const tboxH = 24;
            const tboxX = Math.floor((cw - tboxW) / 2);
            const tboxY = 12;
            ctx.fillStyle = this.bgColor;
            roundRect(ctx, tboxX, tboxY, tboxW, tboxH, 8, true, false);
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(timeText, tboxX + tboxW / 2, tboxY + tboxH / 2);
            ctx.restore();

            // --- mostrar vidas a la izquierda del cronómetro (por jugador) ---
            try {
                const heart = '❤';
                const lp1 = (this.game && typeof this.game.livesP1 === 'number') ? Math.max(0, Math.floor(this.game.livesP1)) : 3;
                const lp2 = (this.game && typeof this.game.livesP2 === 'number') ? Math.max(0, Math.floor(this.game.livesP2)) : 3;
                const skull = '☠';
                const p1Display = (lp1 > 0) ? heart.repeat(lp1) : skull;
                const p2Display = (lp2 > 0) ? heart.repeat(lp2) : skull;
                // also show numeric values to make updates obvious during debugging
                let livesText = '';
                if (isMultiplayer) {
                    livesText = `P1: ${p1Display} (${lp1})  P2: ${p2Display} (${lp2})`;
                } else {
                    livesText = `Vidas: ${p1Display} (${lp1})`;
                }
                ctx.save();
                ctx.font = '16px Arial';
                const lm = ctx.measureText(livesText);
                const lw = lm.width + pad * 2;
                const lh = 22;
                // position lives box to the left of the time box with a small gap
                const gap = 8;
                const lx = Math.max(8, tboxX - lw - gap);
                const ly = tboxY;
                ctx.fillStyle = 'rgba(0,0,0,0.45)';
                roundRect(ctx, lx, ly, lw, lh, 6, true, false);
                ctx.fillStyle = '#ff4d4d';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(livesText, lx + pad, ly + lh / 2);
                ctx.restore();
            } catch (e) {}

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

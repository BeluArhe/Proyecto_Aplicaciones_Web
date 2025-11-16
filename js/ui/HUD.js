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

            // Draw lives as hearts top-left if game exposes `lives`
            try {
                const lives = (typeof this.game.lives === 'number') ? this.game.lives : null;
                if (lives !== null && lives > 0) {
                    ctx.save();
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'left';
                    for (let i = 0; i < 3; i++) {
                        const hx = 12 + i * 28;
                        const hy = 22;
                        if (i < lives) {
                            ctx.fillStyle = '#e0245e'; // red heart
                            ctx.fillText('❤', hx, hy);
                        } else {
                            ctx.fillStyle = 'rgba(255,255,255,0.35)';
                            ctx.fillText('❤', hx, hy);
                        }
                    }
                    ctx.restore();
                }
            } catch (e) { /* ignore */ }

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

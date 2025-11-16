class Game {
    constructor(engine, level) {
        this.engine = engine;
        this.level = parseInt(level) || 1;
        this.kitten = new Kitten(this);
        // objetivos por nivel
        this.targetTrashCount = 3;

        // lista de basura en escena
        this.trashEntities = [];

        // Para nivel 1: colocamos 3 basuras estáticas en la arena (zona inferior)
        if (this.level === 1) {
            const canvas = this.engine.canvas;
            const baseWaterY = canvas.height * 0.78; // misma referencia que GameEngine
            const sandY = Math.min(canvas.height - 40, baseWaterY + 30);
            // posiciones fijas para que siempre estén en la arena
            const positions = [150, canvas.width / 2, canvas.width - 150];
            for (let i = 0; i < positions.length; i++) {
                const x = positions[i];
                const y = sandY + (i % 2) * 6; // ligera variación
                const t = new Plastic(x, y);
                this.trashEntities.push(t);
            }
            // target se basa en cuántas basuras hay en la escena
            this.targetTrashCount = this.trashEntities.length;
        }

        // Para nivel 2: 5 basuras en total: algunas en el agua (flotando según olas) y algunas en la arena
        if (this.level === 2) {
            const canvas = this.engine.canvas;
            const baseWaterY = canvas.height * 0.78;
            const sandY = Math.min(canvas.height - 40, baseWaterY + 30);

            // 3 basuras flotando en el agua
            const waterXs = [120, canvas.width / 2 - 40, canvas.width - 140];
            for (let i = 0; i < waterXs.length; i++) {
                const x = waterXs[i];
                const t = new Plastic(x, baseWaterY - 12);
                t.isFloating = true;
                t.game = this;
                t._floatPhase = Math.random() * Math.PI * 2;
                t.buoyancy = 0.9;
                this.trashEntities.push(t);
            }

            // 2 basuras estáticas en la arena
            const sandXs = [200, canvas.width - 200];
            for (let i = 0; i < sandXs.length; i++) {
                const x = sandXs[i];
                const y = sandY + (i % 2) * 6;
                const t = new Plastic(x, y);
                t.game = this;
                this.trashEntities.push(t);
            }

            this.targetTrashCount = this.trashEntities.length;
        }

        // Nivel 3: 10 basuras + un tiburón
        if (this.level === 3) {
            const canvas = this.engine.canvas;
            const baseWaterY = canvas.height * 0.78;
            const sandY = Math.min(canvas.height - 40, baseWaterY + 30);

            // 4 basuras en el agua (flotando)
            const waterXs = [120, 280, canvas.width/2 + 20, canvas.width - 140];
            for (let i = 0; i < waterXs.length; i++) {
                const x = waterXs[i];
                const t = new Plastic(x, baseWaterY - 12);
                t.isFloating = true;
                t.game = this;
                t._floatPhase = Math.random() * Math.PI * 2;
                t.buoyancy = 0.9;
                this.trashEntities.push(t);
            }

            // 2 basuras en la arena
            const sandXs = [180, canvas.width - 180];
            for (let i = 0; i < sandXs.length; i++) {
                const x = sandXs[i];
                const y = sandY + (i % 2) * 6;
                const t = new Plastic(x, y);
                t.game = this;
                this.trashEntities.push(t);
            }

            // Crear tiburón patrullando cerca de la zona de agua
            const sx = canvas.width / 2;
            const sy = baseWaterY - 10;
            this.shark = new Shark(sx, sy);

            this.targetTrashCount = this.trashEntities.length;
        }

        // Nivel 4: vidas = 3, 5 basuras (mezcla agua/arena), 1 faro y 1 cangrejo
        if (this.level === 4) {
            const canvas = this.engine.canvas;
            const baseWaterY = canvas.height * 0.78;
            const sandY = Math.min(canvas.height - 40, baseWaterY + 30);

            // spawn 5 trash randomly: choose positions either water or sand
            for (let i = 0; i < 5; i++) {
                const isWater = Math.random() < 0.5;
                const x = Math.floor(Math.random() * (canvas.width - 160)) + 80;
                let y;
                if (isWater) {
                    y = baseWaterY - 12 + Math.random() * 8;
                } else {
                    y = sandY + Math.random() * 24;
                }
                const t = new Plastic(x, y);
                t.isFloating = !!isWater;
                t.game = this;
                if (t.isFloating) { t._floatPhase = Math.random() * Math.PI * 2; t.buoyancy = 0.85; }
                this.trashEntities.push(t);
            }

            // lighthouse near left side of beach
            const lx = 80;
            const ly = baseWaterY - 40;
            this.lighthouse = new Lighthouse(lx, ly);

            // crab on the sand area
            const cx = canvas.width - 180;
            const cy = sandY + 8;
            this.crab = new Crab(cx, cy);

            this.lives = 3;
            this.targetTrashCount = this.trashEntities.length;
        }

        // Nivel 5: faro + tiburón, olas más rápidas, 9 basuras
        if (this.level === 5) {
            const canvas = this.engine.canvas;
            const baseWaterY = canvas.height * 0.78;
            const sandY = Math.min(canvas.height - 40, baseWaterY + 30);

            // aumentar la velocidad de las olas para este nivel
            try { this.engine.waveSpeed = 2.2; this.engine.waveTimeScale = 1.6; } catch (e) {}

            // spawn 8 trash randomly: mezcla de agua y arena
            for (let i = 0; i < 8; i++) {
                const isWater = Math.random() < 0.55;
                const x = Math.floor(Math.random() * (canvas.width - 160)) + 80;
                let y;
                if (isWater) {
                    y = baseWaterY - 12 + Math.random() * 12;
                } else {
                    y = sandY + Math.random() * 30;
                }
                const t = new Plastic(x, y);
                t.isFloating = !!isWater;
                t.game = this;
                if (t.isFloating) { t._floatPhase = Math.random() * Math.PI * 2; t.buoyancy = 0.85 + Math.random()*0.1; }
                this.trashEntities.push(t);
            }

            // lighthouse on left
            const lx = 80;
            const ly = baseWaterY - 40;
            this.lighthouse = new Lighthouse(lx, ly);

            // shark patrol in water
            const sx = canvas.width / 2;
            const sy = baseWaterY - 6;
            this.shark = new Shark(sx, sy);

            this.lives = 3;
            this.targetTrashCount = this.trashEntities.length;
        }

        this.targetTrashCollected = 0;
        // tiempo transcurrido en segundos (se acumula en update)
        this.elapsedTime = 0;
        // initial lives are set per-level above (e.g. level 4 sets this.lives = 3).
        // only set a safe last-hit time so cooldown checks behave correctly
        this._lastHitTime = -999;

        console.log('🎮 Juego inicializado — nivel', this.level);
    }

    update(deltaTime) {
        this.kitten.update(deltaTime);
        // actualizar tiempo transcurrido (segundos)
        this.elapsedTime = (this.elapsedTime || 0) + Math.max(0, deltaTime / 1000);
        // comprobar colisiones simples con basura estática
        for (let i = this.trashEntities.length - 1; i >= 0; i--) {
            const t = this.trashEntities[i];
            if (typeof t.update === 'function') {
                try { t.update(deltaTime); } catch (e) { /* ignore */ }
            }
            if (!t.isHeld) {
                // comprobar colisión con la bolsa (si existe la función)
                let collides = false;
                try {
                    if (typeof this.kitten.getBagRect === 'function') {
                        const bag = this.kitten.getBagRect();
                        // rect-rect overlap
                        const tx1 = t.x - (t.width/2 || 8);
                        const ty1 = t.y - (t.height/2 || 8);
                        const tx2 = tx1 + (t.width || 16);
                        const ty2 = ty1 + (t.height || 16);
                        const bx1 = bag.x;
                        const by1 = bag.y;
                        const bx2 = bx1 + bag.w;
                        const by2 = by1 + bag.h;
                        collides = !(tx2 < bx1 || tx1 > bx2 || ty2 < by1 || ty1 > by2);
                    } else {
                        collides = this._isCollidingWithKitten(t);
                    }
                } catch (e) {
                    collides = this._isCollidingWithKitten(t);
                }

                if (collides) {
                    const added = this.kitten.addToBag(t);
                    if (added) {
                        // eliminar del mundo
                        this.trashEntities.splice(i, 1);
                        this.targetTrashCollected = this.kitten.bag.length;
                        // comprobar objetivo
                        if (this.targetTrashCollected >= this.targetTrashCount) {
                            console.log('🎉 Nivel completado');
                            try { this.engine.state = 'PAUSED'; } catch (e) {}
                            // Mostrar overlay personalizado con opciones
                            try {
                                const overlay = document.getElementById('levelCompleteOverlay');
                                if (overlay) {
                                    // actualizar texto de tiempo si existe
                                    const timeEl = document.getElementById('levelCompleteTime');
                                    if (timeEl) {
                                        const elapsed = Math.floor(this.elapsedTime || 0);
                                        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
                                        const ss = String(elapsed % 60).padStart(2, '0');
                                        timeEl.textContent = 'Tiempo: ' + mm + ':' + ss;
                                    }
                                    overlay.classList.remove('hidden');
                                    // asignar handlers a botones
                                    const repeatBtn = document.getElementById('repeatLevelBtn');
                                    const nextBtn = document.getElementById('nextLevelBtn');
                                    const returnBtn = document.getElementById('returnMenuFromCompleteBtn');
                                    if (repeatBtn) repeatBtn.onclick = () => { window.location.href = window.location.pathname + '?level=' + this.level; };
                                    if (nextBtn) nextBtn.onclick = () => {
                                        try {
                                            const key = 'unlockedLevels';
                                            const raw = localStorage.getItem(key);
                                            const obj = raw ? JSON.parse(raw) : { 1: true };
                                            obj[String(this.level + 1)] = true;
                                            localStorage.setItem(key, JSON.stringify(obj));
                                        } catch (e) {
                                            console.warn('No se pudo actualizar unlockedLevels en localStorage', e);
                                        }
                                        window.location.href = window.location.pathname + '?level=' + (this.level + 1);
                                    };
                                    if (returnBtn) returnBtn.onclick = () => { window.location.href = window.location.pathname; };
                                } else {
                                    setTimeout(() => alert('¡Nivel completado! Has recogido ' + this.targetTrashCollected + ' basuras.'), 50);
                                }
                            } catch (e) {
                                setTimeout(() => alert('¡Nivel completado! Has recogido ' + this.targetTrashCollected + ' basuras.'), 50);
                            }
                        }
                    }
                }
            }
        }

        // Nivel 3: comprobar tiburón si existe
        if (this.level === 3 && this.shark) {
            try {
                this.shark.update(deltaTime, this.engine);
                // comprobar colisión gato-tiburón
                const sb = this.shark.getBounds();
                const kx1 = this.kitten.x;
                const ky1 = this.kitten.y;
                const kx2 = this.kitten.x + this.kitten.width;
                const ky2 = this.kitten.y + this.kitten.height;
                const sx1 = sb.x;
                const sy1 = sb.y;
                const sx2 = sb.x + sb.w;
                const sy2 = sb.y + sb.h;
                const overlap = !(kx2 < sx1 || kx1 > sx2 || ky2 < sy1 || ky1 > sy2);
                if (overlap) {
                    // game over
                    console.log('💀 El gatito fue atrapado por el tiburón');
                    try { this.engine.state = 'PAUSED'; } catch (e) {}
                    const overlay = document.getElementById('gameOverOverlay');
                    if (overlay) {
                        overlay.classList.remove('hidden');
                        const repeatBtn = document.getElementById('repeatAfterGameOverBtn');
                        const returnBtn = document.getElementById('returnMenuFromGameOverBtn');
                        if (repeatBtn) repeatBtn.onclick = () => { window.location.href = window.location.pathname + '?level=' + this.level; };
                        if (returnBtn) returnBtn.onclick = () => { window.location.href = window.location.pathname; };
                    } else {
                        setTimeout(() => alert('Game Over'), 50);
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // Nivel 4: comprobar faro y cangrejo
        if (this.level === 4) {
            // ensure lives initialized
            if (!this.lives) this.lives = 3;
            // update crab
            if (this.crab) {
                try { this.crab.update(deltaTime, this.engine); } catch (e) {}
                // collision crab-kitten
                const cb = this.crab.getBounds();
                const kx1 = this.kitten.x;
                const ky1 = this.kitten.y;
                const kx2 = this.kitten.x + this.kitten.width;
                const ky2 = this.kitten.y + this.kitten.height;
                const cx1 = cb.x;
                const cy1 = cb.y;
                const cx2 = cb.x + cb.w;
                const cy2 = cb.y + cb.h;
                const overlapCrab = !(kx2 < cx1 || kx1 > cx2 || ky2 < cy1 || ky1 > cy2);
                if (overlapCrab) {
                    const now = this.elapsedTime || 0;
                    if (now - (this._lastHitTime || 0) > 1.2) {
                        this._lastHitTime = now;
                        this._damage(1);
                    }
                }
            }

            // lighthouse collision
            if (this.lighthouse) {
                const lb = this.lighthouse.getBounds();
                const kx1 = this.kitten.x;
                const ky1 = this.kitten.y;
                const kx2 = this.kitten.x + this.kitten.width;
                const ky2 = this.kitten.y + this.kitten.height;
                const lx1 = lb.x;
                const ly1 = lb.y;
                const lx2 = lb.x + lb.w;
                const ly2 = lb.y + lb.h;
                const overlapLight = !(kx2 < lx1 || kx1 > lx2 || ky2 < ly1 || ky1 > ly2);
                if (overlapLight) {
                    const now = this.elapsedTime || 0;
                    if (now - (this._lastHitTime || 0) > 0.8) {
                        this._lastHitTime = now;
                        this._damage(1);
                    }
                }
            }
        }

        // Nivel 5: comprobar faro y tiburón (ambos quitan vidas)
        if (this.level === 5) {
            // ensure lives initialized
            if (!this.lives) this.lives = 3;

            // update shark (patrulla) y comprobar colisión
            if (this.shark) {
                try { this.shark.update(deltaTime, this.engine); } catch (e) {}
                const sb = this.shark.getBounds();
                const kx1 = this.kitten.x;
                const ky1 = this.kitten.y;
                const kx2 = this.kitten.x + this.kitten.width;
                const ky2 = this.kitten.y + this.kitten.height;
                const sx1 = sb.x;
                const sy1 = sb.y;
                const sx2 = sb.x + sb.w;
                const sy2 = sb.y + sb.h;
                const overlapShark = !(kx2 < sx1 || kx1 > sx2 || ky2 < sy1 || ky1 > sy2);
                if (overlapShark) {
                    const now = this.elapsedTime || 0;
                    if (now - (this._lastHitTime || 0) > 1.0) {
                        this._lastHitTime = now;
                        this._damage(1);
                    }
                }
            }

            // lighthouse collision
            if (this.lighthouse) {
                const lb = this.lighthouse.getBounds();
                const kx1 = this.kitten.x;
                const ky1 = this.kitten.y;
                const kx2 = this.kitten.x + this.kitten.width;
                const ky2 = this.kitten.y + this.kitten.height;
                const lx1 = lb.x;
                const ly1 = lb.y;
                const lx2 = lb.x + lb.w;
                const ly2 = lb.y + lb.h;
                const overlapLight = !(kx2 < lx1 || kx1 > lx2 || ky2 < ly1 || ky1 > ly2);
                if (overlapLight) {
                    const now = this.elapsedTime || 0;
                    if (now - (this._lastHitTime || 0) > 0.8) {
                        this._lastHitTime = now;
                        this._damage(1);
                    }
                }
            }
        }
    }

    render(ctx) {
        // render de basuras primero (detrás del gatito)
        for (let t of this.trashEntities) {
            if (typeof t.render === 'function') t.render(ctx);
        }

        // Dibujar estructuras/entidades por nivel
        // Dibujar faro si aplica (niveles 4 y 5)
        if ((this.level === 4 || this.level === 5) && this.lighthouse && typeof this.lighthouse.render === 'function') {
            try { this.lighthouse.render(ctx); } catch (e) { /* ignore */ }
        }

        // Dibujar cangrejo solo en nivel 4
        if (this.level === 4 && this.crab && typeof this.crab.render === 'function') {
            try { this.crab.render(ctx); } catch (e) { /* ignore */ }
        }

        // Dibujar tiburón en niveles 3 y 5
        if ((this.level === 3 || this.level === 5) && this.shark) {
            try { this.shark.render(ctx); } catch (e) { /* ignore */ }
        }

        // dibujar el gatito por encima
        this.kitten.render(ctx);
    }

    _damage(amount) {
        this.lives = Math.max(0, (this.lives || 0) - amount);
        console.log('❤ Vidas restantes:', this.lives);
        try {
            // reproducir sonido de daño si es posible
            this._playDamageSound();
        } catch (e) {}
        try {
            // activar invulnerabilidad visual en el gatito
            if (this.kitten && typeof this.kitten.setInvulnerable === 'function') {
                this.kitten.setInvulnerable(1.0);
            }
        } catch (e) {}
        // flash effect could be added; if lives <=0 -> game over
        if (this.lives <= 0) {
            try { this.engine.state = 'PAUSED'; } catch (e) {}
            const overlay = document.getElementById('gameOverOverlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                const repeatBtn = document.getElementById('repeatAfterGameOverBtn');
                const returnBtn = document.getElementById('returnMenuFromGameOverBtn');
                if (repeatBtn) repeatBtn.onclick = () => { window.location.href = window.location.pathname + '?level=' + this.level; };
                if (returnBtn) returnBtn.onclick = () => { window.location.href = window.location.pathname; };
            } else {
                setTimeout(() => alert('Game Over'), 50);
            }
        }
    }

    _playDamageSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ac = new AudioCtx();
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = 'sawtooth';
            o.frequency.value = 220;
            g.gain.value = 0.0015; // volumen bajo
            o.connect(g);
            g.connect(ac.destination);
            const now = ac.currentTime;
            g.gain.setValueAtTime(0.0015, now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
            o.start(now);
            o.stop(now + 0.14);
            // cerrar contexto después de un pequeño delay
            setTimeout(() => {
                try { ac.close(); } catch (e) {}
            }, 300);
        } catch (e) {
            // no bloquear si falla
            console.warn('No se pudo reproducir sonido de daño', e);
        }
    }

    _isCollidingWithKitten(trash) {
        const kx = this.kitten.x + this.kitten.width / 2;
        const ky = this.kitten.y + this.kitten.height / 2;
        const tx = trash.x;
        const ty = trash.y;
        const dx = Math.abs(kx - tx);
        const dy = Math.abs(ky - ty);
        const rx = (this.kitten.width / 2) + (trash.width / 2 || 8);
        const ry = (this.kitten.height / 2) + (trash.height / 2 || 8);
        return dx < rx && dy < ry;
    }
}
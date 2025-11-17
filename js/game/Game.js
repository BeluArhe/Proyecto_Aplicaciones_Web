class Game {
    constructor(engine, level) {
        this.engine = engine;
        this.level = parseInt(level) || 1;
        this.kitten = new Kitten(this);
        // multiplayer support: if enabled, create a second kitten (helper / player 2)
        try {
            const multi = (localStorage.getItem('multiplayer') === '1');
            if (multi) {
                this.kitten2 = new Kitten(this, 2);
                // place helper on the right side
                try {
                    const canvas = this.engine.canvas;
                    this.kitten.x = 100;
                    this.kitten.y = 300;
                    this.kitten2.x = canvas.width - 140;
                    this.kitten2.y = 300;
                } catch (e) {}
            }
        } catch (e) {}
        // Theme audio (never gonna meow you up) - reuse global audio if present so it continues across levels
        try {
            if (window.themeAudio) {
                this.themeAudio = window.themeAudio;
            } else {
                this.themeAudio = new Audio('assets/Never%20gonna%20Meow%20you%20up.mp3');
                this.themeAudio.loop = true;
                this.themeAudio.volume = 0.6;
                try { this.themeAudio.muted = !!window.isGameMuted; } catch (e) {}
                // store globally so subsequent levels reuse the same audio element
                window.themeAudio = this.themeAudio;
            }
        } catch (e) {
            this.themeAudio = null;
        }
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

            this.livesP1 = 3;
            this.livesP2 = 3;
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

            this.livesP1 = 3;
            this.livesP2 = 3;
            this.targetTrashCount = this.trashEntities.length;
        }

        this.targetTrashCollected = 0;
        // tiempo transcurrido en segundos (se acumula en update)
        this.elapsedTime = 0;
        // vidas por defecto: 3 al iniciar cada nivel (por jugador)
        this.livesP1 = (typeof this.livesP1 === 'number') ? this.livesP1 : 3;
        this.livesP2 = (typeof this.livesP2 === 'number') ? this.livesP2 : 3;
        // initial lives are set per-level above (e.g. level 4 sets this.livesP1/livesP2 = 3).
        // only set a safe last-hit time so cooldown checks behave correctly
        this._lastHitTime = -999;

        console.log('🎮 Juego inicializado — nivel', this.level);
        // start theme if appropriate (not the final level). Reuse global audio so it continues across levels.
        try {
            if (this.themeAudio && this.level < 5) {
                // only attempt to play if not already playing
                if (this.themeAudio.paused) {
                    const p = this.themeAudio.play();
                    if (p && typeof p.then === 'function') p.catch(() => {});
                }
            }
        } catch (e) {}
    }

    // Sad meow audio handling for Game Over (play only first 10 seconds in loop)
    _initSadAudio() {
        try {
            if (!this.sadAudio) {
                this.sadAudio = new Audio('assets/miau%20miau%20triste.mp3');
                this.sadAudio.volume = 0.95;
                this.sadAudio.preload = 'auto';
                try { this.sadAudio.muted = !!window.isGameMuted; } catch (e) {}
            }
        } catch (e) {
            this.sadAudio = null;
        }
    }

    // Create a dancing kitten element without green background and insert into the final-level panel
    _createDancingKittenElement(panel) {
        try {
            // get selected kitten src from localStorage or fallback to default asset
            let src = null;
            try { src = localStorage.getItem('selectedKitten'); } catch (e) { src = null; }
            if (!src || src === 'default') src = 'assets/Gatito.png';

            const makeTransparentGreen = (imgSrc, tolerance = 80) => new Promise((resolve) => {
                try {
                    const img = new Image();
                    img.crossOrigin = '';
                    img.onload = () => {
                        try {
                            const w = img.naturalWidth || img.width;
                            const h = img.naturalHeight || img.height;
                            if (!w || !h) return resolve(imgSrc);
                            const c = document.createElement('canvas');
                            c.width = w; c.height = h;
                            const ctx = c.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            try {
                                const id = ctx.getImageData(0, 0, w, h);
                                const d = id.data;
                                // remove strong green pixels
                                for (let i = 0; i < d.length; i += 4) {
                                    const r = d[i], g = d[i+1], b = d[i+2];
                                    // detect green-screen like pixels: green is dominant and above threshold
                                    if (g > tolerance && g - r > 30 && g - b > 30) {
                                        d[i+3] = 0;
                                    }
                                }
                                ctx.putImageData(id, 0, 0);
                                try {
                                    const url = c.toDataURL('image/png');
                                    return resolve(url);
                                } catch (e) {
                                    return resolve(imgSrc);
                                }
                            } catch (e) {
                                // CORS or other error
                                return resolve(imgSrc);
                            }
                        } catch (e) { return resolve(imgSrc); }
                    };
                    img.onerror = () => resolve(imgSrc);
                    img.src = imgSrc;
                    // timeout fallback
                    setTimeout(() => resolve(imgSrc), 2000);
                } catch (e) { resolve(src); }
            });

            // create container
            try {
                let dance = document.getElementById('dancingKittenContainer');
                if (dance) {
                    dance.remove();
                }
                const container = document.createElement('div');
                container.id = 'dancingKittenContainer';
                container.style.width = '160px';
                container.style.height = '160px';
                container.style.margin = '8px auto';
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
                container.style.background = 'transparent';
                container.style.pointerEvents = 'none';

                const imgEl = document.createElement('img');
                imgEl.alt = 'Gatito bailando';
                imgEl.style.width = '140px';
                imgEl.style.height = 'auto';
                imgEl.style.display = 'block';
                imgEl.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))';
                imgEl.id = 'dancingKittenImg';

                container.appendChild(imgEl);

                // ensure keyframes for dance exist
                try {
                    if (!document.getElementById('kitten-dance-keyframes')) {
                        const style = document.createElement('style');
                        style.id = 'kitten-dance-keyframes';
                        style.textContent = `@keyframes kitten-dance { 0% { transform: translateY(0) rotate(-3deg); } 25% { transform: translateY(-6px) rotate(3deg); } 50% { transform: translateY(0) rotate(-3deg); } 75% { transform: translateY(-6px) rotate(3deg); } 100% { transform: translateY(0) rotate(-3deg); } } #dancingKittenImg { animation: kitten-dance 800ms infinite ease-in-out; transform-origin: 50% 70%; }`;
                        document.head.appendChild(style);
                    }
                } catch (e) {}

                // process image to remove green background then set src
                makeTransparentGreen(src, 100).then((url) => {
                    try { imgEl.src = url || src; } catch (e) { imgEl.src = src; }
                }).catch(() => { imgEl.src = src; });

                // insert at top of panel
                try { panel.insertBefore(container, panel.firstChild); } catch (e) {}
                return container;
            } catch (e) { return null; }
        } catch (e) { return null; }
    }

    // Remove any dancing video or container previously inserted
    _removeDancingElements() {
        try {
            const vid = document.getElementById('dancingKittenVideo');
            if (vid) {
                try { vid.pause(); } catch (e) {}
                try { vid.remove(); } catch (e) {}
            }
        } catch (e) {}
        try {
            const cont = document.getElementById('dancingKittenContainer');
            if (cont) {
                try { cont.remove(); } catch (e) {}
            }
        } catch (e) {}
    }

    _startSadAudio() {
        try {
            this._initSadAudio();
            if (!this.sadAudio) return;
            // ensure start at 0
            try { this.sadAudio.currentTime = 0; } catch (e) {}
            // timeupdate handler to loop the first 10s
            this._sadHandler = () => {
                try {
                    if (this.sadAudio.currentTime >= 10) {
                        this.sadAudio.currentTime = 0;
                        this.sadAudio.play().catch(() => {});
                    }
                } catch (e) {}
            };
            this.sadAudio.addEventListener('timeupdate', this._sadHandler);
            const p = this.sadAudio.play(); if (p && typeof p.then === 'function') p.catch(() => {});
        } catch (e) {
            // ignore
        }
    }

    _stopSadAudio() {
        try {
            if (!this.sadAudio) return;
            if (this._sadHandler) {
                try { this.sadAudio.removeEventListener('timeupdate', this._sadHandler); } catch (e) {}
                this._sadHandler = null;
            }
            try { this.sadAudio.pause(); } catch (e) {}
            try { this.sadAudio.currentTime = 0; } catch (e) {}
        } catch (e) {}
    }

    update(deltaTime) {
        this.kitten.update(deltaTime);
        // actualizar segundo jugador si existe
        try {
            if (this.kitten2 && typeof this.kitten2.update === 'function') this.kitten2.update(deltaTime);
        } catch (e) {}
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
                // if not colliding with player 1, check player 2 (if exists)
                if (!collides && this.kitten2) {
                    try {
                        if (typeof this.kitten2.getBagRect === 'function') {
                            const bag2 = this.kitten2.getBagRect();
                            const tx1 = t.x - (t.width/2 || 8);
                            const ty1 = t.y - (t.height/2 || 8);
                            const tx2 = tx1 + (t.width || 16);
                            const ty2 = ty1 + (t.height || 16);
                            const b2x1 = bag2.x;
                            const b2y1 = bag2.y;
                            const b2x2 = b2x1 + bag2.w;
                            const b2y2 = b2y1 + bag2.h;
                            collides = !(tx2 < b2x1 || tx1 > b2x2 || ty2 < b2y1 || ty1 > b2y2);
                            if (collides) {
                                // mark that kitten2 should pick it
                                t._pickedBy = 2;
                            }
                        } else {
                            // fallback: use same collision as player1 detection
                            // do nothing
                        }
                    } catch (e) { /* ignore */ }
                }
                if (collides) {
                    // decide who picks it: default player1, unless flagged for player2
                    const picker = (t._pickedBy === 2 && this.kitten2) ? this.kitten2 : this.kitten;
                    const added = picker.addToBag(t);
                    if (added) {
                        // eliminar del mundo
                        this.trashEntities.splice(i, 1);
                        // actualizar conteo total recogido (sum ambos jugadores si existen)
                        const p1 = (this.kitten && this.kitten.bag) ? this.kitten.bag.length : 0;
                        const p2 = (this.kitten2 && this.kitten2.bag) ? this.kitten2.bag.length : 0;
                        this.targetTrashCollected = p1 + p2;
                        if (this.targetTrashCollected >= this.targetTrashCount) {
                            console.log('🎉 Nivel completado');
                            // For non-final levels, keep the theme playing; only stop/reset if this is the final level
                            try {
                                if (this.level === 5) {
                                    if (this.themeAudio) { this.themeAudio.pause(); this.themeAudio.currentTime = 0; }
                                }
                            } catch (e) {}
                            // Update highscores: store best (fastest) time per level in localStorage
                            try {
                                const elapsedSec = Math.floor(this.elapsedTime || 0);
                                const key = 'highscores';
                                let obj = {};
                                try { const raw = localStorage.getItem(key); obj = raw ? JSON.parse(raw) : {}; } catch (e) { obj = {}; }
                                const prev = obj[String(this.level)];
                                if (!prev || elapsedSec < Number(prev)) {
                                    obj[String(this.level)] = elapsedSec;
                                    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
                                    // mark new record for UI
                                    this._newRecord = true;
                                } else {
                                    this._newRecord = false;
                                }
                            } catch (e) { this._newRecord = false; }
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
                                    // Si es el nivel final (5), mostrar un panel especial con efectos
                                    const repeatBtn = document.getElementById('repeatLevelBtn');
                                    const nextBtn = document.getElementById('nextLevelBtn');
                                    const returnBtn = document.getElementById('returnMenuFromCompleteBtn');
                                    if (this.level === 5) {
                                        // Mensaje especial
                                        const titleEl = document.getElementById('levelCompleteTitle');
                                        if (titleEl) titleEl.textContent = '¡Finalizaste el juego! Felicitaciones';
                                        // Ocultar botón de siguiente nivel (no hay siguiente)
                                        if (nextBtn) nextBtn.style.display = 'none';
                                        if (repeatBtn) repeatBtn.textContent = 'Repetir juego';

                                        // Estilizar panel con clase celebratoria
                                        const panel = document.getElementById('levelCompletePanel');
                                        if (panel) panel.classList.add('level-complete-final');

                                        // Añadir confetti animado dentro del overlay
                                        let confetti = document.getElementById('confettiContainer');
                                        if (!confetti) {
                                            confetti = document.createElement('div');
                                            confetti.id = 'confettiContainer';
                                            confetti.className = 'confetti-container';
                                            overlay.appendChild(confetti);
                                            const colors = ['#ff0a54','#ff9770','#ffd60a','#8affc1','#7ae0ff','#b28dff'];
                                            for (let p = 0; p < 40; p++) {
                                                const piece = document.createElement('div');
                                                piece.className = 'confetti-piece';
                                                piece.style.left = (Math.random() * 100) + '%';
                                                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                                                const delay = (Math.random() * 0.8).toFixed(2);
                                                const dur = (1.6 + Math.random() * 1.6).toFixed(2);
                                                piece.style.animationDelay = delay + 's';
                                                piece.style.animationDuration = dur + 's';
                                                confetti.appendChild(piece);
                                            }
                                            // limpiar confetti después de 6s
                                            setTimeout(() => { try { confetti.remove(); } catch (e) {} }, 6000);
                                            // Reproducir sonido de celebración (si existe)
                                            try {
                                                const audio = new Audio('assets/audio/level-complete.mp3');
                                                audio.volume = 0.85;
                                                const playPromise = audio.play();
                                                if (playPromise && typeof playPromise.then === 'function') {
                                                    playPromise.catch((err) => { console.warn('Reproducción de audio bloqueada o falló:', err); });
                                                }
                                            } catch (e) {
                                                console.warn('No se pudo reproducir audio de celebración', e);
                                            }
                                            // Start looping happy audio during final confetti
                                            try {
                                                if (!this.happyAudio) {
                                                    this.happyAudio = new Audio('assets/happy%20happy%20happy%20ganar.mp3');
                                                    this.happyAudio.loop = true;
                                                    this.happyAudio.volume = 0.9;
                                                    try { this.happyAudio.muted = !!window.isGameMuted; } catch (e) {}
                                                }
                                                // ensure sad audio not playing
                                                try { this._stopSadAudio(); } catch (e) {}
                                                const pp = this.happyAudio.play(); if (pp && typeof pp.then === 'function') pp.catch(() => {});
                                            } catch (e) {}
                                            // try MP4 video first, otherwise fall back to transparent image
                                            try {
                                                const panel = document.getElementById('levelCompletePanel');
                                                if (panel) {
                                                    try {
                                                        // remove any existing dancing elements first
                                                        try { this._removeDancingElements(); } catch (e) {}
                                                        const video = document.createElement('video');
                                                        video.id = 'dancingKittenVideo';
                                                        video.src = 'assets/gatito_bailando.mp4';
                                                        video.loop = true;
                                                        video.autoplay = true;
                                                        video.muted = true; // rely on happy audio for sound
                                                        video.playsInline = true;
                                                        video.style.width = '140px';
                                                        video.style.height = 'auto';
                                                        video.style.display = 'block';
                                                        video.style.margin = '8px auto';
                                                        video.style.background = 'transparent';
                                                        video.style.pointerEvents = 'none';
                                                        let handled = false;
                                                        video.addEventListener('loadedmetadata', () => {
                                                            try { const p = video.play(); if (p && typeof p.then === 'function') p.catch(() => {}); } catch (e) {}
                                                            handled = true;
                                                        });
                                                        video.addEventListener('error', () => {
                                                            try { video.remove(); } catch (e) {}
                                                            if (!handled) {
                                                                try { this._createDancingKittenElement(panel); } catch (e) {}
                                                            }
                                                        });
                                                        try { panel.insertBefore(video, panel.firstChild); } catch (e) { try { video.remove(); } catch (e) {} }
                                                        // fallback to image if video not loaded after timeout
                                                        setTimeout(() => {
                                                            try {
                                                                const v = document.getElementById('dancingKittenVideo');
                                                                if (v && v.readyState === 0) {
                                                                    try { v.remove(); } catch (e) {}
                                                                    try { this._createDancingKittenElement(panel); } catch (e) {}
                                                                }
                                                            } catch (e) {}
                                                        }, 1800);
                                                    } catch (e) {
                                                        try { this._createDancingKittenElement(panel); } catch (e) {}
                                                    }
                                                }
                                            } catch (e) {}
                                        }
                                    }
                                    overlay.classList.remove('hidden');
                                    // show new-record message if applicable
                                    try {
                                        const recElId = 'levelCompleteRecord';
                                        let recEl = document.getElementById(recElId);
                                        if (!recEl) {
                                            recEl = document.createElement('div');
                                            recEl.id = recElId;
                                            recEl.style.marginTop = '8px';
                                            recEl.style.fontWeight = '700';
                                            recEl.style.color = '#1b9c00';
                                            const panel = document.getElementById('levelCompletePanel');
                                            if (panel) panel.insertBefore(recEl, panel.querySelector('#levelCompleteTime') ? panel.querySelector('#levelCompleteTime').nextSibling : panel.firstChild);
                                        }
                                        if (this._newRecord) {
                                            recEl.textContent = '¡Nuevo récord!';
                                        } else {
                                            recEl.textContent = '';
                                        }
                                    } catch (e) {}
                                    // asignar handlers a botones
                                    if (repeatBtn) repeatBtn.onclick = () => {
                                        try { if (this.happyAudio) { try { this.happyAudio.pause(); } catch (e) {} try { this.happyAudio.currentTime = 0; } catch (e) {} } } catch (e) {}
                                        try { this._removeDancingElements(); } catch (e) {}
                                        try {
                                            // If available, change level in-place to preserve global theme audio
                                            if (typeof window.changeLevel === 'function') {
                                                try { this.engine && (this.engine.state = 'STOPPED'); } catch (e) {}
                                                window.changeLevel(this.level);
                                                return;
                                            }
                                        } catch (e) {}
                                        // Fallback: attempt to ensure themeAudio keeps playing (or will be restarted)
                                        try { if (window.themeAudio && window.themeAudio.paused) { window.themeAudio.play().catch(() => {}); } } catch (e) {}
                                        window.location.href = window.location.pathname + '?level=' + this.level;
                                    };
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
                                        try {
                                            if (typeof window.changeLevel === 'function') {
                                                window.changeLevel(this.level + 1);
                                            } else {
                                                window.location.href = window.location.pathname + '?level=' + (this.level + 1);
                                            }
                                        } catch (e) {
                                            window.location.href = window.location.pathname + '?level=' + (this.level + 1);
                                        }
                                    };
                                    if (returnBtn) returnBtn.onclick = () => {
                                        try { if (this.happyAudio) { try { this.happyAudio.pause(); } catch (e) {} try { this.happyAudio.currentTime = 0; } catch (e) {} } } catch (e) {}
                                        try { this._removeDancingElements(); } catch (e) {}
                                        window.location.href = window.location.pathname;
                                    };
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

        // Nivel 3: comprobar tiburón si existe (muestra daño por impacto en vez de Game Over inmediato)
        if (this.level === 3 && this.shark) {
            // ensure lives initialized
            if (typeof this.livesP1 !== 'number') this.livesP1 = 3;
            if (typeof this.livesP2 !== 'number') this.livesP2 = 3;
            try {
                this.shark.update(deltaTime, this.engine);
                // comprobar colisión gato-tiburón
                const sb = this.shark.getBounds();
                const sx1 = sb.x;
                const sy1 = sb.y;
                const sx2 = sb.x + sb.w;
                const sy2 = sb.y + sb.h;
                let overlap1 = false;
                let overlap2 = false;
                try {
                    // player 1
                    if (this.kitten) {
                        const kx1 = this.kitten.x;
                        const ky1 = this.kitten.y;
                        const kx2 = this.kitten.x + this.kitten.width;
                        const ky2 = this.kitten.y + this.kitten.height;
                        overlap1 = !(kx2 < sx1 || kx1 > sx2 || ky2 < sy1 || ky1 > sy2);
                    }
                    // player 2
                    if (this.kitten2) {
                        const kx1b = this.kitten2.x;
                        const ky1b = this.kitten2.y;
                        const kx2b = this.kitten2.x + this.kitten2.width;
                        const ky2b = this.kitten2.y + this.kitten2.height;
                        overlap2 = !(kx2b < sx1 || kx1b > sx2 || ky2b < sy1 || ky1b > sy2);
                    }
                } catch (e) { /* ignore */ }
                if (overlap1 || overlap2) {
                    const now = this.elapsedTime || 0;
                    console.log('🐟 Shark collision check:', { overlap1, overlap2, lastHit: this._lastHitTime, now });
                    if (now - (this._lastHitTime || 0) > 1.0) {
                        this._lastHitTime = now;
                        if (overlap1) { console.log('🐟 Shark hits P1'); this._damage(1, 1); }
                        if (overlap2) { console.log('🐟 Shark hits P2'); this._damage(2, 1); }
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // Nivel 4: comprobar faro y cangrejo
        if (this.level === 4) {
            // ensure lives initialized
            if (typeof this.livesP1 !== 'number') this.livesP1 = 3;
            if (typeof this.livesP2 !== 'number') this.livesP2 = 3;
            // update crab
            if (this.crab) {
                try { this.crab.update(deltaTime, this.engine); } catch (e) {}
                // collision crab-kitten (check both players)
                const cb = this.crab.getBounds();
                const cx1 = cb.x;
                const cy1 = cb.y;
                const cx2 = cb.x + cb.w;
                const cy2 = cb.y + cb.h;
                let overlap1 = false;
                let overlap2 = false;
                try {
                    if (this.kitten) {
                        const kx1 = this.kitten.x;
                        const ky1 = this.kitten.y;
                        const kx2 = this.kitten.x + this.kitten.width;
                        const ky2 = this.kitten.y + this.kitten.height;
                        overlap1 = !(kx2 < cx1 || kx1 > cx2 || ky2 < cy1 || ky1 > cy2);
                    }
                    if (this.kitten2) {
                        const kx1b = this.kitten2.x;
                        const ky1b = this.kitten2.y;
                        const kx2b = this.kitten2.x + this.kitten2.width;
                        const ky2b = this.kitten2.y + this.kitten2.height;
                        overlap2 = !(kx2b < cx1 || kx1b > cx2 || ky2b < cy1 || ky1b > cy2);
                    }
                } catch (e) {}
                if (overlap1 || overlap2) {
                    const now = this.elapsedTime || 0;
                    console.log('🦀 Crab collision check:', { overlap1, overlap2, lastHit: this._lastHitTime, now });
                    if (now - (this._lastHitTime || 0) > 1.2) {
                        this._lastHitTime = now;
                        if (overlap1) { console.log('🦀 Crab hits P1'); this._damage(1, 1); }
                        if (overlap2) { console.log('🦀 Crab hits P2'); this._damage(2, 1); }
                    }
                }
            }

            // lighthouse collision
            if (this.lighthouse) {
                const lb = this.lighthouse.getBounds();
                const lx1 = lb.x;
                const ly1 = lb.y;
                const lx2 = lb.x + lb.w;
                const ly2 = lb.y + lb.h;
                let overlap1 = false;
                let overlap2 = false;
                try {
                    if (this.kitten) {
                        const kx1 = this.kitten.x;
                        const ky1 = this.kitten.y;
                        const kx2 = this.kitten.x + this.kitten.width;
                        const ky2 = this.kitten.y + this.kitten.height;
                        overlap1 = !(kx2 < lx1 || kx1 > lx2 || ky2 < ly1 || ky1 > ly2);
                    }
                    if (this.kitten2) {
                        const kx1b = this.kitten2.x;
                        const ky1b = this.kitten2.y;
                        const kx2b = this.kitten2.x + this.kitten2.width;
                        const ky2b = this.kitten2.y + this.kitten2.height;
                        overlap2 = !(kx2b < lx1 || kx1b > lx2 || ky2b < ly1 || ky1b > ly2);
                    }
                } catch (e) {}
                if (overlap1 || overlap2) {
                    const now = this.elapsedTime || 0;
                    console.log('🚨 Lighthouse collision check:', { overlap1, overlap2, lastHit: this._lastHitTime, now });
                    if (now - (this._lastHitTime || 0) > 0.8) {
                        this._lastHitTime = now;
                        if (overlap1) { console.log('🚨 Lighthouse hits P1'); this._damage(1, 1); }
                        if (overlap2) { console.log('🚨 Lighthouse hits P2'); this._damage(2, 1); }
                    }
                }
            }
        }

        // Nivel 5: comprobar faro y tiburón (ambos quitan vidas)
        if (this.level === 5) {
            // ensure lives initialized
            if (!this.livesP1) this.livesP1 = 3;
            if (!this.livesP2) this.livesP2 = 3;

            // update shark (patrulla) y comprobar colisión
            if (this.shark) {
                try { this.shark.update(deltaTime, this.engine); } catch (e) {}
                const sb = this.shark.getBounds();
                const sx1 = sb.x;
                const sy1 = sb.y;
                const sx2 = sb.x + sb.w;
                const sy2 = sb.y + sb.h;
                let overlap1 = false;
                let overlap2 = false;
                try {
                    if (this.kitten) {
                        const kx1 = this.kitten.x;
                        const ky1 = this.kitten.y;
                        const kx2 = this.kitten.x + this.kitten.width;
                        const ky2 = this.kitten.y + this.kitten.height;
                        overlap1 = !(kx2 < sx1 || kx1 > sx2 || ky2 < sy1 || ky1 > sy2);
                    }
                    if (this.kitten2) {
                        const kx1b = this.kitten2.x;
                        const ky1b = this.kitten2.y;
                        const kx2b = this.kitten2.x + this.kitten2.width;
                        const ky2b = this.kitten2.y + this.kitten2.height;
                        overlap2 = !(kx2b < sx1 || kx1b > sx2 || ky2b < sy1 || ky1b > sy2);
                    }
                } catch (e) {}
                if (overlap1 || overlap2) {
                    const now = this.elapsedTime || 0;
                    if (now - (this._lastHitTime || 0) > 1.0) {
                        this._lastHitTime = now;
                        if (overlap1) this._damage(1, 1);
                        if (overlap2) this._damage(2, 1);
                    }
                }
            }

            // lighthouse collision
            if (this.lighthouse) {
                const lb = this.lighthouse.getBounds();
                const lx1 = lb.x;
                const ly1 = lb.y;
                const lx2 = lb.x + lb.w;
                const ly2 = lb.y + lb.h;
                let overlap1 = false;
                let overlap2 = false;
                try {
                    if (this.kitten) {
                        const kx1 = this.kitten.x;
                        const ky1 = this.kitten.y;
                        const kx2 = this.kitten.x + this.kitten.width;
                        const ky2 = this.kitten.y + this.kitten.height;
                        overlap1 = !(kx2 < lx1 || kx1 > lx2 || ky2 < ly1 || ky1 > ly2);
                    }
                    if (this.kitten2) {
                        const kx1b = this.kitten2.x;
                        const ky1b = this.kitten2.y;
                        const kx2b = this.kitten2.x + this.kitten2.width;
                        const ky2b = this.kitten2.y + this.kitten2.height;
                        overlap2 = !(kx2b < lx1 || kx1b > lx2 || ky2b < ly1 || ky1b > ly2);
                    }
                } catch (e) {}
                if (overlap1 || overlap2) {
                    const now = this.elapsedTime || 0;
                    if (now - (this._lastHitTime || 0) > 0.8) {
                        this._lastHitTime = now;
                        if (overlap1) this._damage(1, 1);
                        if (overlap2) this._damage(2, 1);
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
        try { if (this.kitten && typeof this.kitten.render === 'function') this.kitten.render(ctx); } catch (e) {}
        try { if (this.kitten2 && typeof this.kitten2.render === 'function') this.kitten2.render(ctx); } catch (e) {}
    }

    _damage(playerId, amount) {
        amount = typeof amount === 'number' ? amount : 1;
        try {
            // ensure numeric types (avoid strings from accidental assignments)
            this.livesP1 = Number(this.livesP1) || 0;
            this.livesP2 = Number(this.livesP2) || 0;
            const beforeP1 = this.livesP1;
            const beforeP2 = this.livesP2;
            if (playerId === 2) {
                this.livesP2 = Math.max(0, this.livesP2 - amount);
            } else {
                this.livesP1 = Math.max(0, this.livesP1 - amount);
            }
            console.log(`💥 Daño aplicado a P${playerId}: -${amount} | Vidas antes P1=${beforeP1} P2=${beforeP2} -> ahora P1=${this.livesP1} P2=${this.livesP2}`);
        } catch (e) { console.warn('Error al aplicar daño', e); }
        try { this._playDamageSound(); } catch (e) {}
        try {
            // invulnerabilidad solo para el jugador afectado
            if (playerId === 1 && this.kitten && typeof this.kitten.setInvulnerable === 'function') {
                this.kitten.setInvulnerable(1.0);
            }
            if (playerId === 2 && this.kitten2 && typeof this.kitten2.setInvulnerable === 'function') {
                this.kitten2.setInvulnerable(1.0);
            }
        } catch (e) {}

        // marcar jugador muerto si llego a 0 vidas
        try {
            if (playerId === 1 && this.livesP1 <= 0 && this.kitten) this.kitten.dead = true;
            if (playerId === 2 && this.livesP2 <= 0 && this.kitten2) this.kitten2.dead = true;
        } catch (e) {}

        // si ambos jugadores están sin vidas -> Game Over (o si es single-player y el único murió)
        const p1dead = (this.livesP1 <= 0);
        const p2dead = (this.kitten2 ? (this.livesP2 <= 0) : true);
        if (p1dead && p2dead) {
            try { this.engine.state = 'PAUSED'; } catch (e) {}
            console.log('🛑 Game Over triggered: P1dead=' + p1dead + ' P2dead=' + p2dead);
            const overlay = document.getElementById('gameOverOverlay');
            if (overlay) {
                // ajustar título/mensaje según modo de juego (single / multi)
                try {
                    const titleEl = document.getElementById('gameOverTitle');
                    const msgEl = document.getElementById('gameOverMsg');
                    if (titleEl) titleEl.textContent = 'Game Over';
                    if (msgEl) {
                        if (this.kitten2) {
                            msgEl.textContent = 'Los gatitos han sido atrapados...';
                        } else {
                            msgEl.textContent = 'El gatito ha sido atrapado...';
                        }
                    }
                } catch (e) {}
                overlay.classList.remove('hidden');
                try {
                    const panel = document.getElementById('gameOverPanel');
                    if (panel) {
                        let img = document.getElementById('cryingKittenImg');
                        if (!img) {
                            img = document.createElement('img');
                            img.id = 'cryingKittenImg';
                            img.src = 'assets/gatito%20llorando.jpg';
                            img.alt = 'Gatito llorando';
                            img.style.width = '120px';
                            img.style.display = 'block';
                            img.style.margin = '6px auto';
                            panel.insertBefore(img, panel.firstChild);
                        }
                    }
                } catch (e) {}
                try { if (this.happyAudio) { try { this.happyAudio.pause(); } catch (e) {} try { this.happyAudio.currentTime = 0; } catch (e) {} } } catch (e) {}
                try { if (this.themeAudio && !this.themeAudio.paused) { this.themeAudio.pause(); } } catch (e) {}
                try { this._stopHappyAudio && this._stopHappyAudio(); } catch (e) {}
                try { this._stopSadAudio(); } catch (e) {}
                try { this._startSadAudio(); } catch (e) {}
                const repeatBtn = document.getElementById('repeatAfterGameOverBtn');
                const returnBtn = document.getElementById('returnMenuFromGameOverBtn');
                const self = this;
                if (repeatBtn) repeatBtn.onclick = () => {
                    try { self._stopSadAudio(); } catch (e) {}
                    try { if (self.happyAudio) { try { self.happyAudio.pause(); } catch (e) {} try { self.happyAudio.currentTime = 0; } catch (e) {} } } catch (e) {}
                    try { if (self._removeDancingElements) self._removeDancingElements(); } catch (e) {}
                    try {
                        if (typeof window.changeLevel === 'function') {
                            window.changeLevel(self.level);
                            return;
                        }
                    } catch (e) {}
                    try { if (window.themeAudio && window.themeAudio.paused) { window.themeAudio.play().catch(() => {}); } } catch (e) {}
                    window.location.href = window.location.pathname + '?level=' + self.level;
                };
                if (returnBtn) returnBtn.onclick = () => { try { self._stopSadAudio(); } catch (e) {} try { if (self.happyAudio) { try { self.happyAudio.pause(); } catch (e) {} try { self.happyAudio.currentTime = 0; } catch (e) {} } } catch (e) {} try { if (self._removeDancingElements) self._removeDancingElements(); } catch (e) {} window.location.href = window.location.pathname; };
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
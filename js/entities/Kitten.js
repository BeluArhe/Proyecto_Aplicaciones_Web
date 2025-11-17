class Kitten {
    constructor(game, playerId = 1) {
        this.game = game;
        this.playerId = Number(playerId) || 1;
        
        // Posición y tamaño (reducción: gatito más pequeño)
        this.x = 100;
        this.y = 300;
        this.width = 36;
        this.height = 36;
        
        // Propiedades de movimiento
        this.speed = 5;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Estado
        this.isMoving = false;
        this.direction = 'right';
        
        // Colores temporales (luego serán sprites)
        this.color = '#FF69B4'; // Rosa para el gatito
        this.eyeColor = '#000000';
        // Sprite: intenta cargar `assets/pic.png`; si no existe, usa un PNG CC0 remoto
        this.sprite = new Image();
        this.sprite.crossOrigin = 'anonymous';
        this.spriteLoaded = false;
        // propiedades del recorte/escala calculadas al cargar
        this.spriteTrim = { sx: 0, sy: 0, sw: 0, sh: 0 };
        // escala multiplicadora para hacer el sprite más grande o pequeño (1.0 = tamaño base)
        // Reducida para mantener proporciones con el tamaño más pequeño
        this.spriteScale = 2.0;
        this.drawWidth = this.width * this.spriteScale;
        this.drawHeight = this.height * this.spriteScale;
            // sprite
            this.sprite = new Image();
            this.sprite.onload = () => this._onSpriteLoad();
            this.sprite.onerror = () => this._onSpriteError();
            // choose sprite from localStorage if present (support player 1 and 2)
            try {
                const key = (this.playerId === 2) ? 'selectedKitten2' : 'selectedKitten';
                const sel = localStorage.getItem(key);
                if (sel && sel !== 'default') {
                    this.sprite.src = sel;
                } else {
                    // fallback different default for player 2 to visually distinguish
                    this.sprite.src = (this.playerId === 2) ? 'assets/Gatito%202.png' : 'assets/b0b37662f658b5881f689f7ed6672d2a.png';
                }
            } catch (e) {
                this.sprite.src = (this.playerId === 2) ? 'assets/Gatito%202.png' : 'assets/b0b37662f658b5881f689f7ed6672d2a.png';
            }
        this.spritePadding = 6;
        // inclinación máxima en radianes cuando se mueve
        this.maxTilt = 0.18;
        // bolsa para recolectar basura
        this.bag = []; // array de objetos { type: 'plastic'|'glass'|... }
        this.bagCapacity = 8;

        // invulnerabilidad visual al recibir daño
        this.isInvulnerable = false;
        this._invulTimer = 0; // segundos restantes
        this._invulElapsed = 0;
        // estado de vida (si true, no puede moverse)
        this.dead = false;

        // handler reutilizable para procesar la imagen cargada
        const processSprite = (img) => {
            try {
                const tmp = document.createElement('canvas');
                tmp.width = img.width;
                tmp.height = img.height;
                const tctx = tmp.getContext('2d');
                tctx.drawImage(img, 0, 0);
                const imgData = tctx.getImageData(0, 0, tmp.width, tmp.height).data;

                let minX = tmp.width, minY = tmp.height, maxX = 0, maxY = 0;
                let found = false;
                for (let y = 0; y < tmp.height; y++) {
                    for (let x = 0; x < tmp.width; x++) {
                        const a = imgData[(y * tmp.width + x) * 4 + 3];
                        if (a > 10) {
                            found = true;
                            if (x < minX) minX = x;
                            if (y < minY) minY = y;
                            if (x > maxX) maxX = x;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                if (!found) {
                    this.spriteTrim = { sx: 0, sy: 0, sw: img.width, sh: img.height };
                } else {
                    const p = this.spritePadding;
                    const sx = Math.max(0, minX - p);
                    const sy = Math.max(0, minY - p);
                    const ex = Math.min(tmp.width, maxX + p + 1);
                    const ey = Math.min(tmp.height, maxY + p + 1);
                    this.spriteTrim = { sx: sx, sy: sy, sw: (ex - sx), sh: (ey - sy) };
                }
            } catch (e) {
                this.spriteTrim = { sx: 0, sy: 0, sw: img.width, sh: img.height };
            }

            const sw = this.spriteTrim.sw || img.width;
            const sh = this.spriteTrim.sh || img.height;
            const scale = Math.min(this.width / sw, this.height / sh);
            // aplicar multiplicador global para aumentar el tamaño visual del sprite
            this.drawWidth = sw * scale * (this.spriteScale || 1);
            this.drawHeight = sh * scale * (this.spriteScale || 1);
            this.drawOffsetX = (this.width - this.drawWidth) / 2;
            this.drawOffsetY = (this.height - this.drawHeight) / 2;
            this.spriteLoaded = true;
        };

        // intento de carga local
        this.sprite.onload = () => processSprite(this.sprite);
        this.sprite.onerror = () => {
            // si falla la carga de `assets/cat.png`, intentar `assets/kitten.png` local antes del remoto
            if (!this._triedAltLocal) {
                this._triedAltLocal = true;
                this.sprite.src = 'assets/kitten.png';
                return;
            }
            // si ya intentamos el alternativo local, intentar carga remota CC0 (OpenGameArt)
            if (!this._triedRemote) {
                this._triedRemote = true;
                const remote = new Image();
                remote.crossOrigin = 'anonymous';
                remote.onload = () => {
                    this.sprite = remote;
                    processSprite(remote);
                };
                remote.onerror = () => {
                    // todos los intentos fallaron; usamos fallback vectorial
                    console.warn('Kitten sprite: all load attempts failed — using fallback drawing.');
                };
                remote.src = 'https://opengameart.org/sites/default/files/cat_idle.png';
            }
        };
        // iniciar intentando el archivo solicitado (hash filename). Fallbacks: cat/kitten/remoto
        // Si el usuario seleccionó un personaje, usar esa ruta desde localStorage (re-check)
        try {
            const key = (this.playerId === 2) ? 'selectedKitten2' : 'selectedKitten';
            const saved = localStorage.getItem(key);
            if (saved && saved !== 'default') {
                this.sprite.src = saved;
            }
        } catch (e) {}
    }

    update(deltaTime) {
        // si el gatito está "muerto" no procesa entrada ni movimiento
        if (this.dead) {
            this.velocityX = 0;
            this.velocityY = 0;
            this.isMoving = false;
            return;
        }
        this.handleInput();
        this.applyMovement();
        this.applyBoundaries();
        // actualizar invulnerabilidad
        if (this.isInvulnerable) {
            const s = (deltaTime || 0) / 1000;
            this._invulTimer -= s;
            this._invulElapsed += s;
            if (this._invulTimer <= 0) {
                this.isInvulnerable = false;
                this._invulTimer = 0;
                this._invulElapsed = 0;
            }
        }
    }

    // Añade un elemento a la bolsa; devuelve true si se pudo añadir
    addToBag(trash) {
        if (!trash) return false;
        if (this.bag.length >= this.bagCapacity) return false;
        this.bag.push({ type: trash.type, points: trash.points || 0 });
        // marcar el trash como recogido si el objeto lo soporta
        try { trash.isHeld = true; } catch (e) {}
        return true;
    }

    // Dibuja la bolsa en el gato (x,y es el centro del sprite/cara, w/h el tamaño del sprite)
    drawBag(ctx, cx, cy, w, h) {
        const bagW = Math.max(12, w * 0.55);
        const bagH = Math.max(14, h * 0.55);
        const sideOffset = (w / 2) + 6;
        let bagX;
        if (this.direction === 'right') bagX = cx + sideOffset;
        else bagX = cx - sideOffset - bagW;
        const bagY = cy + h * 0.18;

        // cuerpo de la bolsa (forma redondeada)
        ctx.save();
        const grad = ctx.createLinearGradient(bagX, bagY, bagX + bagW, bagY + bagH);
        grad.addColorStop(0, '#7a4b2a');
        grad.addColorStop(1, '#5a341b');
        ctx.fillStyle = grad;
        ctx.strokeStyle = '#3f2515';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bagX + bagW * 0.1, bagY);
        ctx.quadraticCurveTo(bagX + bagW * 0.5, bagY - bagH * 0.35, bagX + bagW * 0.9, bagY);
        ctx.lineTo(bagX + bagW * 0.9, bagY + bagH * 0.75);
        ctx.quadraticCurveTo(bagX + bagW * 0.5, bagY + bagH * 1.05, bagX + bagW * 0.1, bagY + bagH * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // solapa
        ctx.fillStyle = '#6b3f22';
        ctx.beginPath();
        ctx.moveTo(bagX + bagW * 0.08, bagY + bagH * 0.08);
        ctx.quadraticCurveTo(bagX + bagW * 0.5, bagY + bagH * -0.05, bagX + bagW * 0.92, bagY + bagH * 0.08);
        ctx.lineTo(bagX + bagW * 0.7, bagY + bagH * 0.18);
        ctx.quadraticCurveTo(bagX + bagW * 0.5, bagY + bagH * 0.12, bagX + bagW * 0.3, bagY + bagH * 0.18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // correa pequeña
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bagX + bagW * 0.2, bagY - bagH * 0.05);
        ctx.lineTo(bagX + bagW * 0.35, bagY + bagH * 0.05);
        ctx.stroke();

        // dibujar íconos de basura dentro de la bolsa (pequeños círculos)
        const cols = 3;
        const paddingX = bagW * 0.12;
        const paddingY = bagH * 0.22;
        const iconW = (bagW - paddingX * 2) / cols - 4;
        for (let i = 0; i < Math.min(this.bag.length, this.bagCapacity); i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const ix = bagX + paddingX + col * (iconW + 4);
            const iy = bagY + paddingY + row * (iconW + 4);
            const t = this.bag[i].type || 'other';
            let color = '#9e9e9e';
            if (t === 'plastic') color = '#4da6ff';
            else if (t === 'glass') color = '#69c24a';
            else if (t === 'can') color = '#d0c12a';
            else if (t === 'paper') color = '#ffffff';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(ix + iconW/2, iy + iconW/2, iconW/2, iconW/2, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // contar si hay más de lo que se muestra
        if (this.bag.length > cols * 2) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('+' + (this.bag.length - cols * 2), bagX + bagW * 0.82, bagY + bagH * 0.18);
        }

        ctx.restore();
    }

    // Devuelve el rectángulo aproximado de la bolsa en coordenadas del mundo
    getBagRect() {
        const dw = this.drawWidth || this.width;
        const dh = this.drawHeight || this.height;
        const dx = this.x + (this.drawOffsetX || 0);
        const dy = this.y + (this.drawOffsetY || 0);
        const centerX = dx + dw / 2;
        const centerY = dy + dh / 2;

        const bagW = Math.max(12, dw * 0.55);
        const bagH = Math.max(14, dh * 0.55);
        const sideOffset = (dw / 2) + 6;
        let bagX;
        if (this.direction === 'right') bagX = centerX + sideOffset;
        else bagX = centerX - sideOffset - bagW;
        const bagY = centerY + dh * 0.18;

        return { x: bagX, y: bagY, w: bagW, h: bagH };
    }

    handleInput() {
        const input = this.game.engine.inputHandler;
        const movement = input.getMovement(this.playerId);
        // Reset velocity
        this.velocityX = 0;
        this.velocityY = 0;

        // Ajustar velocidad según el terreno (agua/arena/tierra)
        const inWater = this.isInWater();
        const canvas = this.game.engine.canvas;
        const baseWaterY = canvas.height * 0.78;
        let speedFactor = 1.0;
        if (inWater) speedFactor = 0.5; // más lento en el agua
        else if (this.y + this.height > baseWaterY) speedFactor = 0.85; // algo más lento en la arena

        // Movimiento horizontal
        if (movement.left) {
            this.velocityX = -this.speed * speedFactor;
            this.direction = 'left';
        }
        if (movement.right) {
            this.velocityX = this.speed * speedFactor;
            this.direction = 'right';
        }

        // Movimiento vertical
        if (movement.up) {
            this.velocityY = -this.speed * speedFactor;
        }
        if (movement.down) {
            this.velocityY = this.speed * speedFactor;
        }
        
        // Diagonal movement (normalize speed)
        if (this.velocityX !== 0 && this.velocityY !== 0) {
            this.velocityX *= 0.707; // 1/√2
            this.velocityY *= 0.707;
        }
        
        this.isMoving = this.velocityX !== 0 || this.velocityY !== 0;
    }

    applyMovement() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        // Si está en el agua, aplicar una ligera fricción
        if (this.isInWater()) {
            this.velocityX *= 0.8;
            this.velocityY *= 0.8;
        }
    }

    applyBoundaries() {
        // Limites del canvas
        const canvas = this.game.engine.canvas;
        
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
        // Ahora permitimos entrar al agua y a la arena; velocidades se manejan en handleInput
    }

    isInWater() {
        const engine = this.game.engine;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const surfaceY = engine.getWaterSurface(centerX);
        const baseWaterY = engine.canvas.height * 0.78;
        // Consideramos que está en agua si el centro está entre la superficie y el borde inferior del agua
        return centerY > surfaceY - 4 && centerY < baseWaterY + 6;
    }

    render(ctx) {
        // soportar parpadeo si está invulnerable
        ctx.save();
        if (this.isInvulnerable) {
            // parpadeo rítmico usando el temporizador interno
            const alpha = 0.35 + 0.65 * Math.abs(Math.sin(this._invulElapsed * 20));
            ctx.globalAlpha = alpha;
        }

        // Efecto de balanceo si está en el agua (no altera la posición real)
        const inWater = this.isInWater();
        let renderY = this.y;
        if (inWater) {
            renderY += Math.sin(this.game.engine.waveTime * 3 + this.x * 0.03) * 2;
        }
        // Si se cargó un sprite, dibujarlo (flip horizontal si va a la izquierda)
        if (this.spriteLoaded) {
            // Dibujar sombra suave debajo del sprite
            const sx = this.spriteTrim.sx || 0;
            const sy = this.spriteTrim.sy || 0;
            const sw = this.spriteTrim.sw || this.sprite.width;
            const sh = this.spriteTrim.sh || this.sprite.height;
            const dw = this.drawWidth || this.width;
            const dh = this.drawHeight || this.height;
            const dx = this.x + (this.drawOffsetX || 0);
            const dy = renderY + (this.drawOffsetY || 0);
            const centerX = dx + dw / 2;
            const centerY = dy + dh / 2;

            // sombra elíptica
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            const shadowW = dw * 0.8;
            const shadowH = dh * 0.25;
            const shadowX = centerX;
            const shadowY = dy + dh * 0.9;
            ctx.beginPath();
            ctx.ellipse(shadowX, shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // suavizar imagen al dibujar sprite para mejor realismo
            ctx.imageSmoothingEnabled = true;
            try { ctx.imageSmoothingQuality = 'high'; } catch (e) {}

            // inclinación basada en velocidad horizontal
            const tilt = Math.max(-this.maxTilt, Math.min(this.maxTilt, (this.velocityX / (this.speed || 1)) * this.maxTilt));

            // Dibujar sprite con rotación y flip centrado
            ctx.save();
            ctx.translate(centerX, centerY);
            if (this.direction === 'left') ctx.scale(-1, 1);
            ctx.rotate(tilt);
            ctx.drawImage(this.sprite, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);

            // ligero brillo especular encima para dar sensación de volumen (overlay suave)
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.08;
            const hg = ctx.createRadialGradient(-dw * 0.25, -dh * 0.3, 0, -dw * 0.25, -dh * 0.3, Math.max(dw, dh));
            hg.addColorStop(0, 'rgba(255,255,255,0.9)');
            hg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = hg;
            ctx.fillRect(-dw/2, -dh/2, dw, dh);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            ctx.restore();
            // después de dibujar el sprite, dibujar la bolsa
            try {
                this.drawBag(ctx, centerX, centerY, dw, dh);
            } catch(e) {}
            // si el gatito está muerto, dibujar una calavera encima
            try {
                if (this.dead) {
                    ctx.save();
                    const skull = '☠';
                    ctx.fillStyle = 'rgba(255,255,255,0.95)';
                    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
                    ctx.lineWidth = Math.max(2, Math.floor(Math.min(dw, dh) * 0.06));
                    const skullSize = Math.max(18, Math.floor(Math.max(dw, dh) * 0.6));
                    ctx.font = `${skullSize}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(skull, centerX, centerY - (dh * 0.15));
                    ctx.restore();
                }
            } catch (e) {}
            ctx.restore();
            return; // ya se dibujó el sprite
        }

        // Dibujar sombra incluso en fallback
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        const fShadowW = this.width * 0.8;
        const fShadowH = this.height * 0.22;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, renderY + this.height * 0.9, fShadowW / 2, fShadowH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dibujo fallback mejorado: cara hexagonal, orejas triangulares, mechón y bigotes visibles
        const cx = this.x + this.width / 2;
        const cy = renderY + this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.45;

        // Función para dibujar un hexágono con lado plano arriba/abajo
        const drawHexagon = (ctx, cx, cy, r) => {
            ctx.beginPath();
            const offset = Math.PI / 6; // rotación para faces planas arriba/abajo
            for (let i = 0; i < 6; i++) {
                const angle = offset + i * (Math.PI * 2 / 6);
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };

        // Cara (hexágono) con gradiente radial para volumen
        const g = ctx.createRadialGradient(cx - radius*0.3, cy - radius*0.6, radius*0.2, cx, cy, radius*1.2);
        g.addColorStop(0, '#FFE27A');
        g.addColorStop(0.35, this.color);
        g.addColorStop(1, '#e6a3d1');
        ctx.fillStyle = g;
        ctx.strokeStyle = '#cc8ab0';
        ctx.lineWidth = 2;
        drawHexagon(ctx, cx, cy, radius);

        // sutiles trazos de pelaje alrededor (simulan textura)
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const sxp = cx + Math.cos(a) * (radius * 0.85);
            const syp = cy + Math.sin(a) * (radius * 0.85);
            const ex = sxp + Math.cos(a) * (4 + (i%3));
            const ey = syp + Math.sin(a) * (4 + (i%3));
            ctx.beginPath();
            ctx.moveTo(sxp, syp);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }

        // Orejas triangulares (más puntiagudas) con degradado interno
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#cc8ab0';
        ctx.lineWidth = 1.5;
        const earHeight = radius * 0.8;
        const earOffsetX = radius * 0.7;
        const earTopY = cy - radius * 0.9;

        // Oreja izquierda
        ctx.beginPath();
        ctx.moveTo(cx - earOffsetX, earTopY + 6);
        ctx.lineTo(cx - earOffsetX - 14, earTopY - earHeight);
        ctx.lineTo(cx - earOffsetX + 8, earTopY - 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // interior oreja con gradiente rosa
        const igL = ctx.createLinearGradient(cx - earOffsetX - 14, earTopY - earHeight, cx - earOffsetX + 8, earTopY + 6);
        igL.addColorStop(0, '#FFD2C6');
        igL.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = igL;
        ctx.beginPath();
        ctx.moveTo(cx - earOffsetX - 8, earTopY - earHeight * 0.2);
        ctx.lineTo(cx - earOffsetX - 8, earTopY + 2);
        ctx.lineTo(cx - earOffsetX, earTopY - 2);
        ctx.closePath();
        ctx.fill();

        // Oreja derecha
        ctx.beginPath();
        ctx.moveTo(cx + earOffsetX, earTopY + 6);
        ctx.lineTo(cx + earOffsetX + 14, earTopY - earHeight);
        ctx.lineTo(cx + earOffsetX - 8, earTopY - 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // interior oreja derecha
        const igR = ctx.createLinearGradient(cx + earOffsetX - 8, earTopY - earHeight, cx + earOffsetX + 14, earTopY + 6);
        igR.addColorStop(0, '#FFD2C6');
        igR.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = igR;
        ctx.beginPath();
        ctx.moveTo(cx + earOffsetX + 8, earTopY - earHeight * 0.2);
        ctx.lineTo(cx + earOffsetX + 8, earTopY + 2);
        ctx.lineTo(cx + earOffsetX, earTopY - 2);
        ctx.closePath();
        ctx.fill();

        // Mechón en la frente con sombreado
        ctx.fillStyle = '#FFD966';
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius - 4);
        ctx.lineTo(cx - 8, cy - radius + 8);
        ctx.lineTo(cx + 8, cy - radius + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ojos con brillo (más visible)
        const eyeY = cy - radius * 0.15;
        const eyeOffsetX = radius * 0.45;
        const eyeR = Math.max(2.5, radius * 0.14);
        // iris oscuro
        ctx.fillStyle = '#2b2b2b';
        ctx.beginPath(); ctx.arc(cx - eyeOffsetX, eyeY, eyeR, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + eyeOffsetX, eyeY, eyeR, 0, Math.PI*2); ctx.fill();
        // brillo principal (pequeño punto)
        const hbR = eyeR * 0.28;
        const hbLX = cx - eyeOffsetX - eyeR * 0.3;
        const hbLY = eyeY - eyeR * 0.4;
        const hbRX = cx + eyeOffsetX - eyeR * 0.3;
        const hbRY = eyeY - eyeR * 0.4;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath(); ctx.arc(hbLX, hbLY, hbR, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(hbRX, hbRY, hbR, 0, Math.PI*2); ctx.fill();
        // brillo suave (radial) alrededor del punto para dar brillo difuso
        const glowL = ctx.createRadialGradient(hbLX, hbLY, 0, hbLX, hbLY, hbR*3);
        glowL.addColorStop(0, 'rgba(255,255,255,0.45)');
        glowL.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glowL;
        ctx.beginPath(); ctx.arc(hbLX, hbLY, hbR*3, 0, Math.PI*2); ctx.fill();
        const glowR = ctx.createRadialGradient(hbRX, hbRY, 0, hbRX, hbRY, hbR*3);
        glowR.addColorStop(0, 'rgba(255,255,255,0.45)');
        glowR.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glowR;
        ctx.beginPath(); ctx.arc(hbRX, hbRY, hbR*3, 0, Math.PI*2); ctx.fill();

        // Nariz negra con pequeño brillo
        ctx.beginPath();
        const noseY = cy + radius * 0.12;
        ctx.moveTo(cx, noseY);
        ctx.lineTo(cx - 5, noseY + 6);
        ctx.lineTo(cx + 5, noseY + 6);
        ctx.closePath();
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
        // pequeño brillo superior izquierdo
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(cx - 2, noseY + 2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Bigotes sobresalientes: empiezan en la mejilla y salen fuera de la cara (más delgados)
        const whiskerY = noseY + 4;
        const whiskerLen = radius * 1.25; // largos para sobresalir
        ctx.lineCap = 'round';

        for (let i = -1; i <= 1; i++) {
            const offsetY = i * 6;
            // derecha: línea principal más delgada
            ctx.strokeStyle = 'rgba(0,0,0,0.95)';
            ctx.lineWidth = 1.0; // más delgado
            ctx.beginPath();
            ctx.moveTo(cx + 8, whiskerY + offsetY);
            ctx.quadraticCurveTo(cx + whiskerLen * 0.18, whiskerY + offsetY - 6, cx + whiskerLen, whiskerY + offsetY - 10);
            ctx.stroke();

            // derecha: línea fina clara para dar volumen
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(cx + 8, whiskerY + offsetY + 0.8);
            ctx.quadraticCurveTo(cx + whiskerLen * 0.18, whiskerY + offsetY - 5, cx + whiskerLen, whiskerY + offsetY - 9);
            ctx.stroke();

            // izquierda: línea principal más delgada
            ctx.strokeStyle = 'rgba(0,0,0,0.95)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(cx - 8, whiskerY + offsetY);
            ctx.quadraticCurveTo(cx - whiskerLen * 0.18, whiskerY + offsetY - 6, cx - whiskerLen, whiskerY + offsetY - 10);
            ctx.stroke();

            // izquierda: línea fina clara
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(cx - 8, whiskerY + offsetY + 0.8);
            ctx.quadraticCurveTo(cx - whiskerLen * 0.18, whiskerY + offsetY - 5, cx - whiskerLen, whiskerY + offsetY - 9);
            ctx.stroke();

            // pequeño punto/base en la mejilla para origen del bigote (más sutil)
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            ctx.ellipse(cx + 8, whiskerY + offsetY, 1.0, 1.0, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx - 8, whiskerY + offsetY, 1.0, 1.0, 0, 0, Math.PI*2);
            ctx.fill();
        }
        // dibujar bolsa también en el fallback
        try {
            // usar el tamaño aproximado del fallback para la bolsa
            const approxW = this.width * (this.spriteScale || 1);
            const approxH = this.height * (this.spriteScale || 1);
            this.drawBag(ctx, cx, cy, approxW, approxH);
        } catch (e) {}
        // si el gatito está muerto, dibujar una calavera encima del fallback
        try {
            if (this.dead) {
                ctx.save();
                const skull = '☠';
                const skullSize = Math.max(18, Math.floor(radius * 2.2));
                ctx.font = `${skullSize}px sans-serif`;
                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                ctx.strokeStyle = 'rgba(0,0,0,0.9)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(skull, cx, cy - radius * 0.6);
                ctx.restore();
            }
        } catch (e) {}
        ctx.restore();
    }

    // activar invulnerabilidad visual por duración (segundos)
    setInvulnerable(duration) {
        this.isInvulnerable = true;
        this._invulTimer = Math.max(0, duration || 1.0);
        this._invulElapsed = 0;
    }
}
class Kitten {
    constructor(game) {
        this.game = game;
        
        // Posición y tamaño
        this.x = 100;
        this.y = 300;
        this.width = 50;
        this.height = 50;
        
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
    }

    update(deltaTime) {
        this.handleInput();
        this.applyMovement();
        this.applyBoundaries();
    }

    handleInput() {
        const input = this.game.engine.inputHandler;
        const movement = input.getMovement();
        
        // Reset velocity
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Movimiento horizontal
        if (movement.left) {
            this.velocityX = -this.speed;
            this.direction = 'left';
        }
        if (movement.right) {
            this.velocityX = this.speed;
            this.direction = 'right';
        }
        
        // Movimiento vertical
        if (movement.up) {
            this.velocityY = -this.speed;
        }
        if (movement.down) {
            this.velocityY = this.speed;
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
    }

    applyBoundaries() {
        // Limites del canvas
        const canvas = this.game.engine.canvas;
        
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
        
        // No dejar que el gatito entre mucho al agua
        const waterLevel = canvas.height * 0.6;
        if (this.y < waterLevel - this.height / 2) {
            this.y = waterLevel - this.height / 2;
        }
    }

    render(ctx) {
        // Cuerpo del gatito (círculo)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Orejas
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2 - 10, this.y + 10);
        ctx.lineTo(this.x + this.width/2 - 20, this.y - 5);
        ctx.lineTo(this.x + this.width/2, this.y + 5);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2 + 10, this.y + 10);
        ctx.lineTo(this.x + this.width/2 + 20, this.y - 5);
        ctx.lineTo(this.x + this.width/2, this.y + 5);
        ctx.fill();
        
        // Ojos (se mueven según la dirección)
        ctx.fillStyle = this.eyeColor;
        if (this.direction === 'right') {
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 + 8, this.y + this.height/2 - 5, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 - 2, this.y + this.height/2 - 5, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 - 8, this.y + this.height/2 - 5, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 + 2, this.y + this.height/2 - 5, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Nariz
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2 + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Bigotes según dirección
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        if (this.direction === 'right') {
            // Bigotes derechos
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2 + 3, this.y + this.height/2 + 5);
            ctx.lineTo(this.x + this.width/2 + 15, this.y + this.height/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2 + 3, this.y + this.height/2 + 8);
            ctx.lineTo(this.x + this.width/2 + 15, this.y + this.height/2 + 8);
            ctx.stroke();
        } else {
            // Bigotes izquierdos
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2 - 3, this.y + this.height/2 + 5);
            ctx.lineTo(this.x + this.width/2 - 15, this.y + this.height/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2 - 3, this.y + this.height/2 + 8);
            ctx.lineTo(this.x + this.width/2 - 15, this.y + this.height/2 + 8);
            ctx.stroke();
        }
    }
}
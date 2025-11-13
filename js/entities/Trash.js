// Clase base
class Trash {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.weight = 1;
        this.isHeld = false;
        this.points = 10;
    }
    
    update() {
        if (!this.isHeld) {
            this.applyPhysics();
        }
    }
}

// Tipos específicos
class Plastic extends Trash {
    constructor(x, y) {
        super('plastic', x, y);
        this.weight = 0.5;
        this.buoyancy = 0.8; // Flota más
        this.points = 10;
    }
}

class Glass extends Trash {
    constructor(x, y) {
        super('glass', x, y);
        this.weight = 1.5;
        this.isDangerous = true;
        this.points = -20; // Penalización
    }
}
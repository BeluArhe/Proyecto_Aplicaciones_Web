class Game {
    constructor(engine) {
        this.engine = engine;
        this.kitten = new Kitten(this);
        
        console.log('🎮 Juego inicializado');
    }

    update(deltaTime) {
        this.kitten.update(deltaTime);
    }

    render(ctx) {
        this.kitten.render(ctx);
    }
}
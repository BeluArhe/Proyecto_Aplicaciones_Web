// Punto de entrada principal
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Beach Kitten Cleanup...');
    
    const gameEngine = new GameEngine();
    gameEngine.init();
    
    console.log('✅ Juego cargado correctamente');
    console.log('🎮 Controles: WASD o Flechas para mover al gatito');
});
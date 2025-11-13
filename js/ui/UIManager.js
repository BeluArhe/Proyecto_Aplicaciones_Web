class UIManager {
    constructor() {
        this.menu = new Menu();
        this.hud = new HUD();
        this.gameOver = new GameOver();
    }
    
    showScreen(screenName) {
        this.hideAllScreens();
        this[screenName].show();
    }
    
    updateHUD(score, lives, timeLeft) {
        this.hud.update(score, lives, timeLeft);
    }
}
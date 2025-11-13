class LevelManager {
    constructor() {
        this.levels = [
            { waves: 3, trashCount: 10, timeLimit: 120 },
            { waves: 4, trashCount: 15, timeLimit: 100 },
            { waves: 5, trashCount: 20, timeLimit: 80 }
        ];
        this.currentLevel = 0;
    }
    
    loadLevel(levelIndex) {
        const level = this.levels[levelIndex];
        this.waveManager = new WaveManager(level);
    }
    
    checkLevelComplete() {
        return this.waveManager.isComplete() && 
               this.trashCount === 0;
    }
}
class AudioManager {
    constructor() {
        this.sounds = {
            grab: new Audio('assets/audio/grab.mp3'),
            meow: new Audio('assets/audio/meow.mp3'),
            levelComplete: new Audio('assets/audio/level-complete.mp3')
        };
        this.music = new Audio('assets/audio/beach-theme.mp3');
        this.music.loop = true;
    }
    
    playSound(soundName) {
        if (!this.isMuted) {
            this.sounds[soundName].play();
        }
    }
}
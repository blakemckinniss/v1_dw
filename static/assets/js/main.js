    bindEventListeners() {
        document.getElementById("startGame").addEventListener("click", () => {
            this.player.enterDungeon();
        });

        // Example for pause game functionality
        document.getElementById("pauseGame").addEventListener("click", () => {
            this.pause();
        });
        // Additional event bindings can be implemented here
    }

    pause() {
        console.log('Game paused');
        UI.showPauseScreen(); // Assuming this method exists in the UI class
    }

    // Assuming showPauseScreen method is added to UI class
    static showPauseScreen() {
        // Logic to display pause screen
        document.getElementById('pauseScreen').style.display = 'block';
        console.log('Pause screen displayed');
    }

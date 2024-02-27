
let player = JSON.parse(localStorage.getItem("playerData"));


let inventoryOpen = false;
let tavernOpen = false;
let materialOpen = false;
let leveled = false;

window.addEventListener("load", initializeGame);

function initializeGame() {
    if (!player) {
        player = BASE_PLAYER;
    }
    normalizePlayer()
    enterDungeon();
}

const enterDungeon = () => {
    pauseSwitch();
    player.inCombat = false;
    if (player.stats.hp == 0) {
        progressReset();
    }
    initialDungeonLoad();
    playerLoadStats();
}

const saveData = () => {
    const playerData = JSON.stringify(player);
    const dungeonData = JSON.stringify(dungeon);
    // const enemyData = JSON.stringify(enemy);
    const volumeData = JSON.stringify(volume);
    localStorage.setItem("playerData", playerData);
    localStorage.setItem("dungeonData", dungeonData);
    // localStorage.setItem("enemyData", enemyData);
    localStorage.setItem("volumeData", volumeData);
}

close.onclick = function () {
    defaultModalElement.style.display = "none";
    defaultModalElement.innerHTML = "";
}

const objectValidation = () => {
    if (player.skills == undefined) {
        player.skills = [];
    }
    if (player.tempStats == undefined) {
        player.tempStats = {};
        player.tempStats.atk = 0;
        player.tempStats.speed = 0;
    }
    saveData();
}
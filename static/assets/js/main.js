
let player = JSON.parse(localStorage.getItem("playerData"));
let inventoryOpen = false;
let tavernOpen = false;
let materialOpen = false;
let leveled = false;

window.addEventListener("load", initializeGame);

function initializeGame() {
    if (!player) {
        initializePlayer();
    } else {
        enterDungeon();
    }
}

function initializePlayer() {
    player = BASE_PLAYER;
    saveData();
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
    const enemyData = JSON.stringify(enemy);
    const volumeData = JSON.stringify(volume);
    localStorage.setItem("playerData", playerData);
    localStorage.setItem("dungeonData", dungeonData);
    localStorage.setItem("enemyData", enemyData);
    localStorage.setItem("volumeData", volumeData);
}

const calculateStats = () => {
    player.stats.hpMax = Math.round(player.baseStats.hp * (1 + player.bonusStats.hp / 100) + player.equippedStats.hp);
    player.stats.atk = Math.round(player.baseStats.atk * (1 + player.bonusStats.atk / 100) + player.equippedStats.atk);
    player.stats.def = Math.round(player.baseStats.def * (1 + player.bonusStats.def / 100) + player.equippedStats.def);

    const equipmentAtkSpd = player.baseStats.atkSpd * (player.equippedStats.atkSpd / 100);
    player.stats.atkSpd = player.baseStats.atkSpd * (1 + player.bonusStats.atkSpd / 100) + equipmentAtkSpd;
    player.stats.vamp = player.baseStats.vamp + player.bonusStats.vamp + player.equippedStats.vamp;
    player.stats.critRate = player.baseStats.critRate + player.bonusStats.critRate + player.equippedStats.critRate;
    player.stats.critDmg = player.baseStats.critDmg + player.bonusStats.critDmg + player.equippedStats.critDmg;

    if (player.stats.atkSpd > 2.5) {
        player.stats.atkSpd = 2.5;
    }
};

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
        player.tempStats.atkSpd = 0;
    }
    saveData();
}
dungeonActivityElement.addEventListener('click', toggleDungeonActivity);

function toggleDungeonActivity() {
    if (player.inCombat) { return; }
    const isExploring = isCurrentlyExploring();
    logActivityState(isExploring);
    toggleActivityIcon(isExploring);
    resetDungeonLog();
    updateDungeonActionSpinner(isExploring);
}

function isCurrentlyExploring() {
    return dungeonActivityElement.innerHTML.includes("ra-monster-skull");
}

function logActivityState(isExploring) {
    console.log(isExploring ? "starting to explore" : "paused");
}

function toggleActivityIcon(isExploring) {
    const icon = isExploring ? "ra-desert-skull" : "ra-monster-skull";
    dungeonActivityElement.innerHTML = `<i class="ra ${icon}"></i>`;
    pauseSwitch(isExploring, false, !isExploring);
}

function resetDungeonLog() {
    dungeon.backlog.length = 0;
    updateDungeonLog();
}

function updateDungeonActionSpinner(isExploring) {
    const spinnerClass = isExploring ? "spinner-explore" : "spinner-rest";
    dungeonAction.innerHTML = `<div class="${spinnerClass}"><div class="spinner1"></div>`;
}

const initialDungeonLoad = () => {
    if (localStorage.getItem("dungeonData") !== null) {
        dungeon = JSON.parse(localStorage.getItem("dungeonData"));
        dungeon.status = {
            exploring: false,
            paused: true,
            event: false,
        };
        resetDungeonLog();
    }
    loadDungeonProgress();
    dungeonTimeElement.innerHTML = new Date(dungeon.statistics.runtime * 1000).toISOString().slice(11, 19);
    dungeonAction.innerHTML = '<div class="spinner-rest"><div class="spinner1"></div>';
    dungeonActivityElement.innerHTML = `<i class="ra ra-monster-skull"></i>`;
    dungeonTimeElement.innerHTML = "00:00:00";
    dungeonTimer = setInterval(dungeonEvent, 5000);
    playTimer = setInterval(dungeonCounter, 1000);
    setUpRegenTimers();
    logContainerElement.innerHTML = '';
}

const updateDungeonUI = (isPaused) => {
    dungeonAction.innerHTML = isPaused ? '<div class="spinner-rest"><div class="spinner1"></div>' : '<div class="spinner-explore"><div class="spinner1"></div>';
    dungeonActivityElement.innerHTML = isPaused ? "Explore" : "Pause";
};

function pauseSwitch(isExploring = false, isEvent = false, isPaused = true) {
    dungeon.status.exploring = isExploring;
    dungeon.status.event = isEvent;
    dungeon.status.paused = isPaused;
    console.log("Exploring: ", dungeon.status.exploring, " Event: ", dungeon.status.event, " Paused: ", dungeon.status.paused);
};

const dungeonCounter = () => {
    player.playtime++;
    dungeon.statistics.runtime++;
    dungeonTime.innerHTML = new Date(dungeon.statistics.runtime * 1000).toISOString().slice(11, 19);
    saveData();
}
const loadDungeonProgress = () => {
    if (dungeon.progress.room > dungeon.progress.roomLimit) {
        dungeon.progress.room = 1;
        dungeon.progress.floor++;
    }
    floorCountElement.innerHTML = `Floor ${dungeon.progress.floor}`;
    roomCountElement.innerHTML = `Room ${dungeon.progress.room}`;
}

function getBonusIcon(stat) {
    return iconMap[stat] || "ra ra-question";
}

const fleeBattle = () => {
    let eventRoll = randomizeNum(1, 2);
    if (eventRoll == 1) {
        addDungeonLog(`You managed to flee.`);
        player.inCombat = false;
    } else {
        addDungeonLog(`You failed to escape!`);
        combatSystem.startCombat();
        addCombatLog(`You encountered ${enemy.name}.`);
        addCombatLog(`You failed to escape!`);
    }
}
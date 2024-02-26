
function toggleDungeonActivity() {
    if (player.inCombat) {
        return;
    }
    
    const isExploring = dungeonActivityElement.innerHTML === `<i class="ra ra-monster-skull"></i>`;
    console.log(isExploring ? "starting to explore" : "paused");
    
    dungeonActivityElement.innerHTML = isExploring ? `<i class="ra ra-desert-skull"></i>` : `<i class="ra ra-monster-skull"></i>`;
    pauseSwitch(isExploring, false, !isExploring);
    
    dungeon.backlog.length = 0;
    updateDungeonLog();
    
    const spinnerClass = isExploring ? "spinner-explore" : "spinner-rest";
    dungeonAction.innerHTML = `<div class="${spinnerClass}"><div class="spinner1"></div>`;
}

dungeonActivityElement.addEventListener('click', toggleDungeonActivity);

const initialDungeonLoad = () => {
    if (localStorage.getItem("dungeonData") !== null) {
        dungeon = JSON.parse(localStorage.getItem("dungeonData"));
        dungeon.status = {
            exploring: false,
            paused: true,
            event: false,
        };
        dungeon.backlog.length = 0;
        updateDungeonLog();
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

const disarmTrap = (trapType) => {
    let successChance = Math.random() < 0.5; 
    if (successChance) {
        addDungeonLog(`You successfully disarmed the ${trapType}.`);
    } else {
        addDungeonLog(`You failed to disarm the ${trapType} and took damage.`);
        playerTakeDamage(); 
    }
};

const evadeTrap = (trapType) => {
    let successChance = Math.random() < 0.7; 
    if (successChance) {
        addDungeonLog(`You successfully evaded the ${trapType}.`);
    } else {
        addDungeonLog(`You failed to evade the ${trapType} and took damage.`);
        playerTakeDamage(); 
    }
};

const playerTakeDamage = () => {
    const damage = calculateTrapDamage(); 
    player.stats.hp -= damage;
    if (player.stats.hp <= 0) {
        
    }
    playerLoadStats(); 
};

function getBonusIcon(stat) {
    return iconMap[stat] || "ra ra-question";
}

const engageBattle = () => {
    showCombatInfo()
    startCombat();
    console.log("You encountered: ", enemy.name);
    addCombatLog(`You encountered ${enemy.name}.`);
    updateDungeonLog();
}
const mimicBattle = (type) => {
    generateRandomEnemy(type);
    showCombatInfo()
    startCombat();
    console.log("You encountered: ", enemy.name);
    addCombatLog(`You encountered ${enemy.name}.`);
    addDungeonLog(`You encountered ${enemy.name}.`);
}

const guardianBattle = () => {
    incrementRoom();
    generateRandomEnemy("guardian");
    showCombatInfo()
    startCombat();
    console.log("You encountered: ", enemy.name);
    addCombatLog(`Floor Guardian ${enemy.name} is blocking your way.`);
    addDungeonLog("You moved to the next floor.");
}

const specialBossBattle = () => {
    generateRandomEnemy("sboss");
    showCombatInfo()
    startCombat();
    console.log("You encountered: ", enemy.name);
    addCombatLog(`Dungeon Monarch ${enemy.name} has awoken.`);
    addDungeonLog(`Dungeon Monarch ${enemy.name} has awoken.`);
}

const fleeBattle = () => {
    let eventRoll = randomizeNum(1, 2);
    if (eventRoll == 1) {
        addDungeonLog(`You managed to flee.`);
        player.inCombat = false;
    } else {
        addDungeonLog(`You failed to escape!`);
        showCombatInfo()
        startCombat();
        addCombatLog(`You encountered ${enemy.name}.`);
        addCombatLog(`You failed to escape!`);
    }
}

const chestEvent = () => {
    let eventRoll = randomizeNum(1, 4);
    if (eventRoll == 1) {
        mimicBattle("chest");
    } else if (eventRoll == 2) {
        if (dungeon.progress.floor == 1) {
            goldDrop();
        } else {
            createEquipmentPrint("dungeon");
        }
        addDungeonLog("You found some loot.");
    } else if (eventRoll == 3) {
        goldDrop();
        addDungeonLog("You found some gold.");
    } else {
        addDungeonLog("The chest is empty.");
    }
}

const goldDrop = () => {
    let goldValue = randomizeNum(50, 500) * dungeon.progress.floor;
    addDungeonLog(`You found <i class="ra ra-gem" style="color: #FFD700;"></i>${nFormatter(goldValue)}.`);
    player.gold += goldValue;
    playerLoadStats();
}

const nothingEvent = () => {
    let eventRoll = randomizeNum(1, 5);
    if (eventRoll == 1) {
        addDungeonLog("You explored and found nothing.");
    } else if (eventRoll == 2) {
        addDungeonLog("You found an empty chest.");
    } else if (eventRoll == 3) {
        addDungeonLog("You found a monster corpse.");
    } else if (eventRoll == 4) {
        addDungeonLog("You found a corpse.");
    } else if (eventRoll == 5) {
        addDungeonLog("There is nothing in this area.");
    }
}

const statBlessing = () => {
    const statValues = {
        hp: 10,
        atk: 8,
        def: 8,
        atkSpd: 3,
        vamp: 0.5,
        critRate: 1,
        critDmg: 6
    };
    const stats = Object.keys(statValues);
    const buff = stats[Math.floor(Math.random() * stats.length)];
    const value = statValues[buff];

    player.bonusStats[buff] += value;

    
    const formattedBuffName = buff.replace(/([A-Z])/g, " $1").replace("crit", "Crit").toLowerCase();
    addDungeonLog(`You gained ${value}% bonus ${formattedBuffName} from the blessing. (Blessing Lv.${player.blessing} > Blessing Lv.${player.blessing + 1})`);

    blessingUp();
    playerLoadStats();
    saveData();
}

const cursedTotem = (curseLvl) => {
    dungeon.settings.enemyScaling += 0.1;
    addDungeonLog(`The monsters in the dungeon became stronger and the loot quality improved. (Curse Lv.${curseLvl} > Curse Lv.${curseLvl + 1})`);
    saveData();
}

const ignoreEvent = () => {
    addDungeonLog("You ignored it and decided to move on.");
}

const incrementRoom = () => {
    dungeon.progress.room++;
    dungeon.action = 0;
    loadDungeonProgress();
}

const blessingUp = () => {
    blessingValidation();
    player.blessing++;
}

const blessingValidation = () => {
    if (player.blessing == undefined) {
        player.blessing = 1;
    }
}
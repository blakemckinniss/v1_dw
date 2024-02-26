
let enemyDead = false;
let playerDead = false;

const validateHP = () => {
    if (player.stats.hp < 1) {
        handlePlayerDeath();
    } else if (enemy.stats.hp < 1) {
        playerLoadStats();
        handleEnemyDeath();
    }
}

const handlePlayerDeath = () => {
    player.stats.hp = 0;
    playerDead = true;
    player.deaths++;
    if (player.inCombat) {
        addCombatLog(`You died!`);
        document.querySelector("#battleButton").addEventListener("click", function () {
            playerDead = false;
            resetStatsAndReturnToMenu();
        });
        endCombat();
    } else {
        addDungeonLog("You died.");
        player.stats.hp = 1;
    }
}

const handleEnemyDeath = () => {
    enemy.stats.hp = 0;
    enemyDead = true;
    player.kills++;
    dungeon.statistics.kills++;
    addCombatLog(`${enemy.name} died! (${new Date(combatSeconds * 1000).toISOString().substring(14, 19)})`);
    addCombatLog(`You earned ${nFormatter(enemy.rewards.exp)} exp.`)
    playerExpGain();
    addCombatLog(`${enemy.name} dropped <i class="ra ra-gem" style="color: #FFD700;"></i>${nFormatter(enemy.rewards.gold)} gold.`)
    player.gold += enemy.rewards.gold;
    playerLoadStats();
    if (enemy.rewards.drop) {
        createEquipmentPrint("combat");
    }
    player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
    playerLoadStats();
    closeBattlePanel();
    endCombat();
    pauseSwitch(true, false, false);
}

const resetStatsAndReturnToMenu = () => {
    let dimDungeonElement = document.querySelector('#dungeon-main');
    dimDungeonElement.style.filter = "brightness(100%)";
    dimDungeonElement.style.display = "none";
    combatPanelElement.style.display = "none";
    clearInterval(dungeonTimer);
    clearInterval(playTimer);
    progressReset();
}

const closeBattlePanel = () => {
    document.querySelector("#battleButton").addEventListener("click", function () {
        let dimDungeonElement = document.querySelector('#dungeon-main');
        dimDungeonElement.style.filter = "brightness(100%)";
        combatPanelElement.style.display = "none";
        enemyDead = false;
        combatBacklog.length = 0;
    });
}

const playerAttack = () => {
    if (!player.inCombat) {
        return;
    }
    if (player.inCombat) {
        sfxAttack.play();
    }
    
    let crit;
    let damage = player.stats.atk * (player.stats.atk / (player.stats.atk + enemy.stats.def));
    let dmgRange = 0.9 + Math.random() * 0.2;
    damage = damage * dmgRange;
    
    if (Math.floor(Math.random() * 100) < player.stats.critRate) {
        crit = true;
        dmgtype = "crit damage";
        damage = Math.round(damage * (1 + (player.stats.critDmg / 100)));
    } else {
        crit = false;
        dmgtype = "damage";
        damage = Math.round(damage);
    }
    
    objectValidation();
    if (player.skills.includes("Remnant Razor")) {
        damage += Math.round((8 * enemy.stats.hp) / 100);
    }
    if (player.skills.includes("Titan's Will")) {
        damage += Math.round((5 * player.stats.hpMax) / 100);
    }
    if (player.skills.includes("Devastator")) {
        damage = Math.round(damage + ((30 * damage) / 100));
    }
    if (player.skills.includes("Rampager")) {
        player.baseStats.atk += 5;
        objectValidation();
        player.tempStats.atk += 5;
        saveData();
    }
    if (player.skills.includes("Blade Dance")) {
        player.baseStats.atkSpd += 0.01;
        objectValidation();
        player.tempStats.atkSpd += 0.01;
        saveData();
    }

    let lifesteal = Math.round(damage * (player.stats.vamp / 100));
    enemy.stats.hp -= damage;
    player.stats.hp += lifesteal;
    addCombatLog(`${player.name} dealt ` + nFormatter(damage) + ` ${dmgtype} to ${enemy.name}.`);
    validateHP();
    playerLoadStats();
    enemyLoadStats();

    let enemySprite = document.querySelector("#enemy-sprite");
    enemySprite.classList.add("animation-shake");
    setTimeout(() => {
        enemySprite.classList.remove("animation-shake");
    }, 200);
    
    const dmgContainer = document.querySelector("#dmg-container");
    const dmgNumber = document.createElement("p");
    dmgNumber.classList.add("dmg-numbers");
    if (crit) {
        dmgNumber.style.color = "gold";
        dmgNumber.innerHTML = nFormatter(damage) + "!";
    } else {
        dmgNumber.innerHTML = nFormatter(damage);
    }
    dmgContainer.appendChild(dmgNumber);
    setTimeout(() => {
        dmgContainer.removeChild(dmgContainer.lastElementChild);
    }, 370);
    
    if (player.inCombat) {
        setTimeout(() => {
            if (player.inCombat) {
                playerAttack();
            }
        }, (1000 / player.stats.atkSpd));
    }
}

const enemyAttack = () => {
    if (!player.inCombat) {
        return;
    }
    if (player.inCombat) {
        sfxAttack.play();
    }

    
    let damage = enemy.stats.atk * (enemy.stats.atk / (enemy.stats.atk + player.stats.def));
    let lifesteal = Math.round(enemy.stats.atk * (enemy.stats.vamp / 100));
    
    let dmgRange = 0.9 + Math.random() * 0.2;
    damage = damage * dmgRange;
    
    if (Math.floor(Math.random() * 100) < enemy.stats.critRate) {
        dmgtype = "crit damage";
        damage = Math.round(damage * (1 + (enemy.stats.critDmg / 100)));
    } else {
        dmgtype = "damage";
        damage = Math.round(damage);
    }
    
    if (player.skills.includes("Paladin's Heart")) {
        damage = Math.round(damage - ((25 * damage) / 100));
    }
    
    player.stats.hp -= damage;
    
    objectValidation();
    if (player.skills.includes("Aegis Thorns")) {
        enemy.stats.hp -= Math.round((15 * damage) / 100);
    }
    enemy.stats.hp += lifesteal;
    addCombatLog(`${enemy.name} dealt ` + nFormatter(damage) + ` ${dmgtype} to ${player.name}.`);
    validateHP();
    playerLoadStats();
    enemyLoadStats();
    
    let playerPanel = document.querySelector('#playerPanel');
    playerPanel.classList.add("animation-shake");
    setTimeout(() => {
        playerPanel.classList.remove("animation-shake");
    }, 200);
    
    if (player.inCombat) {
        setTimeout(() => {
            if (player.inCombat) {
                enemyAttack();
            }
        }, (1000 / enemy.stats.atkSpd));
    }
}

const combatBacklog = [];

const addCombatLog = (message) => {
    combatBacklog.push(message);
    updateCombatLog();
}

const updateCombatLog = () => {
    let combatLogBox = document.getElementById("combatLogBox");
    combatLogBox.innerHTML = "";

    for (let message of combatBacklog) {
        let logElement = document.createElement("p");
        logElement.innerHTML = message;
        combatLogBox.appendChild(logElement);
    }

    if (enemyDead) {
        let button = document.createElement("div");
        button.className = "decision-panel";
        button.innerHTML = `<button id="battleButton">Claim</button>`;
        combatLogBox.appendChild(button);
    }

    if (playerDead) {
        let button = document.createElement("div");
        button.className = "decision-panel";
        button.innerHTML = `<button id="battleButton">Back to Menu</button>`;
        combatLogBox.appendChild(button);
    }
    combatLogBox.scrollTop = combatLogBox.scrollHeight;
}


let combatSeconds = 0;
const startCombat = (battleMusic) => {
    player.inCombat = true;
    pauseSwitch(false, true, true);

    combatPanelElement.style.display = "flex";

    player.inCombat = true;
    
    setTimeout(playerAttack, (1000 / player.stats.atkSpd));
    setTimeout(enemyAttack, (1000 / enemy.stats.atkSpd));
    let dimDungeonElement = document.querySelector('#dungeon-main');
    dimDungeonElement.style.filter = "brightness(50%)";

    playerLoadStats();
    enemyLoadStats();

    combatTimer = setInterval(combatCounter, 1000);
}

const endCombat = () => {
    
    player.inCombat = false;
    dungeon.status.event = false;
    
    if (player.skills.includes("Rampager")) {
        objectValidation();
        player.baseStats.atk -= player.tempStats.atk;
        player.tempStats.atk = 0;
        saveData();
    }
    if (player.skills.includes("Blade Dance")) {
        objectValidation();
        player.baseStats.atkSpd -= player.tempStats.atkSpd;
        player.tempStats.atkSpd = 0;
        saveData();
    }

    clearInterval(combatTimer);
    combatSeconds = 0;
}

const combatCounter = () => {
    combatSeconds++;
}
const showCombatInfo = () => {
    document.querySelector("#enemy-combat-info").textContent = `${enemy.name} Lv.${enemy.lvl}`;
    document.querySelector("#enemyHpText").innerHTML = `&nbsp${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)}&nbsp(${enemy.stats.hpPercent}%)`;
    // document.querySelector("#enemy-sprite").src = `./assets/sprites/${enemy.image.name}${enemy.image.type}`;
    document.querySelector("#enemy-sprite").src = `./assets/img/vixen.jpg`;
    document.querySelector("#enemy-sprite").alt = enemy.name;
    document.querySelector("#enemy-sprite").style.width = enemy.image.size + 'px'; 
    document.querySelector("#player-combat-info").textContent = `Your Player Info Here`; 
    document.querySelector("#playerHpText").innerHTML = `&nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)}&nbsp(${player.stats.hpPercent}%)`;
    const playerExpPercentage = ((player.stats.exp / player.stats.expMax) * 100).toFixed(2); 
    document.querySelector("#player-exp-bar").style.width = playerExpPercentage + '%'; 
    document.querySelector("#player-exp-bar").textContent = `EXP: ${nFormatter(player.stats.exp)}/${nFormatter(player.stats.expMax)}`; 
};
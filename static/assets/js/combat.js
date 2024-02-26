const validateHP = () => {
    if (player.stats.hp < 1) {
        handleDeath(player, true);
    } else if (enemy.stats.hp < 1) {
        handleDeath(enemy, false);
        handleEnemyRewards();
    }
}

const handleDeath = (entity, isPlayer) => {
    entity.stats.hp = 0;
    const logMessage = isPlayer ? "You died." : `${entity.name} died! (${formatCombatTime(combatSeconds)})`;
    updateLog(isPlayer, logMessage);
    if (isPlayer) {
        player.deaths++;
        preparePlayerRevival();
    } else {
        player.kills++;
        dungeon.statistics.kills++;
    }
    updateCombatState(isPlayer);
}

const preparePlayerRevival = () => {
    const battleButton = document.querySelector("#battleButton");
    battleButton.textContent = "Back to Menu";
    battleButton.onclick = resetStatsAndReturnToMenu;
    player.stats.hp = 1; // Assume revival with 1 HP if not in combat
}

const handleEnemyRewards = () => {
    addCombatLog(`You earned ${formatNumber(enemy.rewards.exp)} exp.`);
    playerExpGain();
    addCombatLog(`${enemy.name} dropped ${formatReward(enemy.rewards.gold)} gold.`);
    player.gold += enemy.rewards.gold;
    player.stats.hp += Math.round(player.stats.hpMax * 0.2);
    updateStatsUI();
    closeBattlePanel();
}

const updateLog = (isPlayer, message) => {
    isPlayer ? addCombatLog(message) : addDungeonLog(message);
}

const updateCombatState = (isPlayer) => {
    if (isPlayer) {
        showRevivalOptions();
    } else {
        showLootOptions();
    }
}



const formatCombatTime = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(14, 19);
}

const playerAttack = () => {
    if (!player.inCombat) return;
    const damageInfo = calculateDamage(player, enemy);
    enemy.stats.hp -= damageInfo.damage;
    player.stats.hp += damageInfo.lifesteal; // Assuming player can heal
    updateCombatUI();
    if (enemy.stats.hp < 1) validateHP();
}

const enemyAttack = () => {
    if (!player.inCombat) return;
    const damageInfo = calculateDamage(enemy, player);
    player.stats.hp -= damageInfo.damage;
    updateCombatUI();
    if (player.stats.hp < 1) validateHP();
}

const showRevivalOptions = () => {
    const revivalButton = document.querySelector("#revivalButton");
    revivalButton.style.display = "block"; // Assuming a button exists for revival
    revivalButton.onclick = () => {
        player.stats.hp = Math.max(1, player.stats.hp); // Revive the player with minimum 1 HP
        updateStatsUI(); // Update the UI with the new player HP
        closeBattlePanel(); // Close the battle panel and possibly show the main menu
    };
}


const showLootOptions = () => {
    // Assuming there is a UI element to show loot options
    const lootContainer = document.querySelector("#lootContainer");
    lootContainer.innerHTML = `You defeated ${enemy.name}! <br> Gold earned: ${enemy.rewards.gold}.`;
    lootContainer.style.display = "block";
}

const calculateDamage = (attacker, defender) => {
    let baseDamage = attacker.stats.atk - defender.stats.def;
    baseDamage = Math.max(baseDamage, 0); // Prevent negative damage
    const critChance = Math.random() < attacker.stats.critRate ? 2 : 1; // Simplified crit calculation
    const damage = Math.round(baseDamage * critChance);
    const lifesteal = Math.round(damage * (attacker.stats.vamp / 100)); // Simplified lifesteal calculation
    return { damage, lifesteal };
}

const updateStatsUI = () => {
    document.querySelector("#playerHpText").textContent = `HP: ${player.stats.hp}/${player.stats.hpMax}`;
    document.querySelector("#enemyHpText").textContent = `HP: ${enemy.stats.hp}/${enemy.stats.hpMax}`;
    // Update any additional UI elements related to stats here, such as EXP bars, gold counters, etc.
}

const resetStatsAndReturnToMenu = () => {
    // Assuming there's a function to reset player and enemy stats
    resetPlayerStats();
    resetEnemyStats();
    const mainMenu = document.querySelector("#mainMenu");
    mainMenu.style.display = "block"; // Show the main menu
    const combatPanel = document.querySelector("#combatPanel");
    combatPanel.style.display = "none"; // Hide the combat panel
    // Reset any other game state or UI elements as needed
}

const closeBattlePanel = () => {
    const battlePanel = document.querySelector("#combatPanel");
    battlePanel.style.display = "none"; // Assuming a simple display toggle to close
    // Additionally, clear any combat-related messages or temporary UI elements
    clearCombatLogs();
}

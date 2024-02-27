const playerExpGain = () => {
    player.exp.expCurr += enemy.rewards.exp;
    player.exp.expCurrLvl += enemy.rewards.exp;
    while (player.exp.expCurr >= player.exp.expMax) {
        playerLvlUp();
    }
    if (leveled) {
        lvlupPopup();
    }
    playerLoadStats();
}

const playerLvlUp = () => {
    leveled = true;
    let expMaxIncrease = Math.floor(((player.exp.expMax * 1.1) + 100) - player.exp.expMax);
    if (player.lvl > 100) {
        expMaxIncrease = 1000000;
    }
    let excessExp = player.exp.expCurr - player.exp.expMax;
    player.exp.expCurrLvl = excessExp;
    player.exp.expMaxLvl = expMaxIncrease;
    player.lvl++;
    player.exp.lvlGained++;
    player.exp.expMax += expMaxIncrease;
    player.bonusStats.hp += 4;
    player.bonusStats.atk += 2;
    player.bonusStats.def += 2;
    player.bonusStats.speed += 0.15;
    player.bonusStats.critRate += 0.1;
    player.bonusStats.critDmg += 0.25;
}

const playerLoadStats = () => {

    player.equippedStats = player.equipped.reduce((acc, item) => {
        item.stats.forEach(stat => {
            Object.keys(stat).forEach(key => {
                acc[key] = (acc[key] || 0) + stat[key];
            });
        });
        return acc;
    }, { hp: 0, atk: 0, def: 0, speed: 0, vamp: 0, critRate: 0, critDmg: 0 });

    const calculateTotalStat = (base, bonus, equipped, isPercent = false) => {
        const baseValue = player.baseStats[base] || 0;
        const bonusValue = player.bonusStats[bonus] || 0;
        const equippedValue = player.equippedStats[equipped] || 0;
        if (isPercent) {
            // For percent-based stats, apply the bonus as a multiplier to the base, then add the equipped percentage
            return baseValue * (1 + bonusValue / 100) + (equippedValue / 100 * baseValue);
        } else {
            // For flat stats, apply the bonus as a multiplier to both base and equipped values
            return Math.round(baseValue * (1 + bonusValue / 100) + equippedValue);
        }
    };

    // Update player stats
    player.stats.hp = calculateTotalStat('hp', 'hp', 'hp');
    player.stats.atk = calculateTotalStat('atk', 'atk', 'atk');
    player.stats.def = calculateTotalStat('def', 'def', 'def');
    player.stats.speed = Math.min(2.5, calculateTotalStat('speed', 'speed', 'speed', true));
    player.stats.vamp = calculateTotalStat('vamp', 'vamp', 'vamp', true);
    player.stats.critRate = calculateTotalStat('critRate', 'critRate', 'critRate', true);
    player.stats.critDmg = calculateTotalStat('critDmg', 'critDmg', 'critDmg', true);

    // Ensure HP does not exceed max and calculate percentages
    player.stats.hp = Math.min(player.stats.hp, player.stats.hpMax);
    player.stats.hpPercent = ((player.stats.hp / player.stats.hpMax) * 100).toFixed(2);
    player.exp.expPercent = ((player.exp.expCurrLvl / player.exp.expMaxLvl) * 100).toFixed(2);

    console.log('Player stats:', player.stats);

    // Update UI elements
    combatSystem.updateCombatUI();
    updateUIElements();
};

// Function to update UI elements related to combat


const formatBonusStat = (bonus) => {
    let formattedBonus = bonus.toFixed(1).replace(rx, "$1");
    let colorClass = 'neutral';
    if (bonus > 0) {
        formattedBonus = `+${formattedBonus}`;
        colorClass = 'positive';
    } else if (bonus < 0) {
        colorClass = 'negative';
    }
    return `<span class="${colorClass}">${formattedBonus}%</span>`;
};

// Function to update general player stats and UI elements
function updateUIElements() {
    showVixens();
    showEquipment();
    showInventory();
    showTavern();
    showMaterials();

    updateStrengthElement();
    updatePlayerInfo();
    updateStatsWithBonuses();
    bonusStatsElement.style.display = 'none';
}

function updateStrengthElement() {
    const strengthElement = document.querySelector("#player-strength");
    const currentWeight = player.currentWeight();
    const maxWeight = player.maxWeight;
    strengthElement.textContent = `${currentWeight} / ${maxWeight}`;
}

function updatePlayerInfo() {
    playerNameElement.innerHTML = `LVL: ${player.lvl} (${parseFloat(player.exp.expPercent).toFixed(1)}%)`;
    playerGoldElement.innerHTML = `<i class="ra ra-gem" style="color: #FFD700;"></i>${nFormatter(player.gold)}`;
    playerHpElement.innerHTML = `${nFormatter(player.stats.hp)} / ${nFormatter(player.stats.hpMax)}`;
}

function updateStatsWithBonuses() {
    const statElements = {
        atk: { base: player.stats.atk, bonus: player.bonusStats.atk },
        def: { base: player.stats.def, bonus: player.bonusStats.def },
        speed: { base: player.stats.speed, bonus: player.bonusStats.speed, isPercent: true },
        vamp: { base: player.stats.vamp, bonus: player.bonusStats.vamp, isPercent: true },
        critRate: { base: player.stats.critRate, bonus: player.bonusStats.critRate, isPercent: true },
        critDmg: { base: player.stats.critDmg, bonus: player.bonusStats.critDmg, isPercent: true }
    };

    Object.entries(statElements).forEach(([stat, { base, bonus, isPercent }]) => {
        const element = document.querySelector(`#player-${stat}`);
        // console.log("stat: ", stat, "base: ", base, "bonus: ", bonus, "isPercent: ", isPercent);
        element.innerHTML = combineStatsWithBonus(base, bonus, isPercent);
    });
}

const combineStatsWithBonus = (base, bonus, isPercent = false) => {
    // console.log("base: ", base, "bonus: ", bonus, "isPercent: ", isPercent);
    const total = base + (base * (bonus / 100));
    const formattedBonus = formatBonusStat(bonus);
    const formattedTotal = isPercent ? `${nFormatter(total)}%` : nFormatter(parseInt(total));
    return `${formattedTotal} <sup>${formattedBonus}</sup>`;
};

const openInventory = () => {
    pauseSwitch();
    inventoryOpen = true;
    let openInv = document.querySelector('#inventory');
    let dimDungeonElement = document.querySelector('#dungeon-main');
    openInv.style.display = "flex";
    dimDungeonElement.style.filter = "brightness(50%)";

    sellAllElement.onclick = function () {
        openInv.style.filter = "brightness(50%)";
        let rarity = sellRarityElement.value;
        defaultModalElement.style.display = "flex";
        if (rarity == "All") {
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>Sell all of your equipment?</p>
                <div class="button-container">
                    <button id="sell-confirm">Sell All</button>
                    <button id="sell-cancel">Cancel</button>
                </div>
            </div>`;
        } else {
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>Sell all <span class="${rarity}">${rarity}</span> equipment?</p>
                <div class="button-container">
                    <button id="sell-confirm">Sell All</button>
                    <button id="sell-cancel">Cancel</button>
                </div>
            </div>`;
        }

        let confirm = document.querySelector('#sell-confirm');
        let cancel = document.querySelector('#sell-cancel');
        confirm.onclick = function () {
            sellAll(rarity);
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            openInv.style.filter = "brightness(100%)";
        };
        cancel.onclick = function () {
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            openInv.style.filter = "brightness(100%)";
        };
    };
    sellRarityElement.onchange = function () {
        let rarity = sellRarityElement.value;
        sellRarityElement.className = rarity;
    };
}

const closeInventory = () => {
    let openInv = document.querySelector('#inventory');
    let dimDungeonElement = document.querySelector('#dungeon-main');
    openInv.style.display = "none";
    dimDungeonElement.style.filter = "brightness(100%)";
    inventoryOpen = false;
    pauseSwitch();
}

const openTavern = () => {
    pauseSwitch();
    tavernOpen = true;
    let openTav = document.querySelector('#tavern');
    let dimDungeonElement = document.querySelector('#dungeon-main');
    openTav.style.display = "flex";
    dimDungeonElement.style.filter = "brightness(50%)";

    sellRarityElement.onchange = function () {
        let rarity = sellRarityElement.value;
        sellRarityElement.className = rarity;
    };
}

const closeTavern = () => {
    let openTav = document.querySelector('#tavern');
    let dimDungeonElement = document.querySelector('#dungeon-main');
    openTav.style.display = "none";
    dimDungeonElement.style.filter = "brightness(100%)";
    tavernOpen = false;
    if (!dungeon.status.paused && !dungeon.status.event) {
        pauseSwitch(true, false);
    }
}

const continueExploring = () => {
    if (!inventoryOpen && !dungeon.status.paused && !tavernOpen && !dungeon.status.event) {
        pauseSwitch(true, false);
    }
}

const lvlupPopup = () => {
    addCombatLog(`You leveled up! (Lv.${player.lvl - player.exp.lvlGained} > Lv.${player.lvl})`);
    player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
    playerLoadStats();
    lvlupPanel.style.display = "flex";
    combatPanelElement.style.filter = "brightness(50%)";
    performStatReroll(2, percentages);
}

const vixenPopup = () => {
    vixenPanel.style.display = "flex";
    updateBrightness(dimDungeonElement, "50%");
}

function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
    }
    return arr;
}

function formatStatisticForDisplay(statisticName) {
    return statisticName
        .replace(/([A-Z])/g, ' $1')
        .replace(/crit/g, 'C')
        .trim()
        .toUpperCase() + ' UP';
}

function updateLevelUpInterface(remainingRerolls, statPercentages) {
    displayLevelUpHeader(remainingRerolls);
    bindRerollButton(remainingRerolls, statPercentages);
}

function displayLevelUpHeader(remainingRerolls) {
    lvlupSelectElement.innerHTML = `
      <h1>Level Up!</h1>
      <div class="content-head">
        <h4>Remaining: ${remainingRerolls}</h4>
        <button id="rerollButton">Reroll ${remainingRerolls}/2</button>
      </div>`;
}

function bindRerollButton(remainingRerolls, statPercentages) {
    document.querySelector("#rerollButton").addEventListener("click", () => {
        if (remainingRerolls > 0) {
            performStatReroll(--remainingRerolls, statPercentages);
        }
    });
}

function performStatReroll(remainingRerolls, statPercentages) {
    const stats = shuffleArray(["hp", "atk", "def", "speed", "vamp", "critRate", "critDmg"]).slice(0, 3);
    updateLevelUpInterface(remainingRerolls, statPercentages);
    removePreviousStatButtons();
    stats.forEach((stat, index) => {
        generateStatSelectionButton(stat, index, statPercentages);
    });
}

function removePreviousStatButtons() {
    lvlupSelectElement.querySelectorAll('button:not(#rerollButton)').forEach(button => button.remove());
}

function generateStatSelectionButton(stat, index, statPercentages) {
    const button = document.createElement("button");
    button.id = `statOption${index}`;
    button.innerHTML = `<h3>${formatStatisticForDisplay(stat)}</h3><p>Increase ${formatStatisticForDisplay(stat)} by ${statPercentages[stat]}%.</p>`;
    button.onclick = () => enhanceStat(stat, statPercentages);
    lvlupSelectElement.appendChild(button);
}

function enhanceStat(stat, statPercentages) {
    sfxItem.play();
    player.bonusStats[stat] += statPercentages[stat];
    decreaseLevelGainedCounter();
    if (player.exp.lvlGained > 0) {
        performStatReroll(2, statPercentages);
    } else {
        hideLevelUpPanel();
    }
    playerLoadStats();
    saveData();
}

function decreaseLevelGainedCounter() {
    player.exp.lvlGained = Math.max(player.exp.lvlGained - 1, 0);
}

function hideLevelUpPanel() {
    lvlupPanel.style.display = "none";
    combatPanelElement.style.filter = "";
}


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
    player.bonusStats.atkSpd += 0.15;
    player.bonusStats.critRate += 0.1;
    player.bonusStats.critDmg += 0.25;
}

const playerLoadStats = () => {
    prepPlayer();

    showVixens();
    showEquipment();
    showInventory();
    showTavern();

    resetPlayerBonusStats();
    applyEquipmentStats();

    updateMaterialsDisplay();

    updatePlayerStrengthDisplay();
    calculateStats();

    playerEnergyElement.textContent = player.energy;
    playerLuckElement.textContent = player.luck;

    if (player.stats.hp > player.stats.hpMax) {
        player.stats.hp = player.stats.hpMax;
    }
    player.stats.hpPercent = Number((player.stats.hp / player.stats.hpMax) * 100).toFixed(2).replace(rx, "$1");
    player.exp.expPercent = Number((player.exp.expCurrLvl / player.exp.expMaxLvl) * 100).toFixed(2).replace(rx, "$1");

    if (player.inCombat || playerDead) {
        playerCombatHpElement.innerHTML = `<span class="battleTextBar" id="playerHpText" style="position: absolute;">&nbsp${nFormatter(player.stats.hp)} / ${nFormatter(player.stats.hpMax)}(${player.stats.hpPercent}%)</span>`;
        playerCombatHpElement.style.width = `${player.stats.hpPercent}%`;
        playerHpDamageElement.style.width = `${player.stats.hpPercent}%`;
        playerExpElement.style.width = `${player.exp.expPercent}%`;
        playerInfoElement.innerHTML = `${player.name} Lv.${player.lvl} (${player.exp.expPercent}%)`;
    }

    const combineStatsWithBonus = (base, bonus) => {
        const total = base + (base * (bonus / 100));
        const formattedBonus = formatBonusStat(bonus);
        return `${nFormatter(parseInt(total))} <sup>${formattedBonus}</sup>`;
    };
    const combineStatsWithBonusPercent = (base, bonus) => {
        const total = base + (base * (bonus / 100));
        const formattedBonus = formatBonusStat(bonus);
        return `${nFormatter(total)}% <sup>${formattedBonus}</sup>`;
    };
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

    playerNameElement.innerHTML = `LVL: ${player.lvl} (${parseFloat(player.exp.expPercent).toFixed(1)}%)`;
    playerGoldElement.innerHTML = `<i class="ra ra-gem" style="color: #FFD700;"></i>${nFormatter(player.gold)}`;
    playerHpElement.innerHTML = `${nFormatter(player.stats.hp)} / ${nFormatter(player.stats.hpMax)}`;
    playerAtkElement.innerHTML = combineStatsWithBonus(player.stats.atk, player.bonusStats.atk);
    playerDefElement.innerHTML = combineStatsWithBonus(player.stats.def, player.bonusStats.def);
    playerAtkSpdElement.innerHTML = combineStatsWithBonusPercent(player.stats.atkSpd, player.bonusStats.atkSpd);
    playerVampElement.innerHTML = combineStatsWithBonusPercent(player.stats.vamp, player.bonusStats.vamp);
    playerCrateElement.innerHTML = combineStatsWithBonusPercent(player.stats.critRate, player.bonusStats.critRate);
    playerCdmgElement.innerHTML = combineStatsWithBonusPercent(player.stats.critDmg, player.bonusStats.critDmg);
    document.querySelector("#bonus-stats").style.display = 'none';
    console.log('Player stats loaded');
};

function updatePlayerStrengthDisplay() {
    const strengthElement = document.querySelector("#player-strength");
    const currentWeight = player.currentWeight();
    const maxWeight = player.maxWeight;
    strengthElement.textContent = `${currentWeight} / ${maxWeight}`;
}

const resetPlayerBonusStats = () => {
    player.bonusStats = vixenObjectStats;
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

    sellAllTavernElement.onclick = function () {
        openTav.style.filter = "brightness(50%)";
        let rarity = sellRarityElement.value;
        defaultModalElement.style.display = "flex";
        if (rarity == "All") {
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>Sell all of your Vixens?</p>
                <div class="button-container">
                    <button id="sell-enlist-confirm">Sell All</button>
                    <button id="sell-enlist-cancel">Cancel</button>
                </div>
            </div>`;
        } else {
            defaultModalElement.innerHTML = `
            <div class="content">
                <p>Sell all <span class="${rarity}">${rarity}</span> Vixen?</p>
                <div class="button-container">
                    <button id="sell-enlist-confirm">Sell All</button>
                    <button id="sell-enlist-cancel">Cancel</button>
                </div>
            </div>`;
        }

        let confirm = document.querySelector('#sell-enlist-confirm');
        let cancel = document.querySelector('#sell-enlist-cancel');
        confirm.onclick = function () {
            sellAllVixen(rarity);
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
    const stats = shuffleArray(["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg"]).slice(0, 3);
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
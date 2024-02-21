let player = JSON.parse(localStorage.getItem("playerData"));
let inventoryOpen = false;
let tavernOpen = false;
let materialOpen = false;
let leveled = false;

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
    showEquipment();
    showInventory();
    showTavern();
    resetPlayerBonusStats();
    applyEquipmentStats();
    applyVixenStats();
    applyVixenBonuses();
    updateVixensDisplay();
    updateMaterialsDisplay();
    updatePlayerStrengthDisplay();
    calculateStats();

    playerEnergyElement.textContent = player.energy;
    playerLuckElement.textContent = player.luck;

    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    if (player.stats.hp > player.stats.hpMax) {
        player.stats.hp = player.stats.hpMax;
    }
    player.stats.hpPercent = Number((player.stats.hp / player.stats.hpMax) * 100).toFixed(2).replace(rx, "$1");
    player.exp.expPercent = Number((player.exp.expCurrLvl / player.exp.expMaxLvl) * 100).toFixed(2).replace(rx, "$1");
    
    if (player.inCombat || playerDead) {
        console.log('Player in combat');
        const playerCombatHpElement = document.querySelector('#player-hp-battle');
        const playerHpDamageElement = document.querySelector('#player-hp-dmg');
        const playerExpElement = document.querySelector('#player-exp-bar');
        const playerInfoElement = document.querySelector('#player-combat-info');
        playerCombatHpElement.innerHTML = `&nbsp${nFormatter(player.stats.hp)} / ${nFormatter(player.stats.hpMax)}(${player.stats.hpPercent}%)`;
        playerCombatHpElement.style.width = `${player.stats.hpPercent}%`;
        playerHpDamageElement.style.width = `${player.stats.hpPercent}%`;
        playerExpElement.style.width = `${player.exp.expPercent}%`;
        playerInfoElement.innerHTML = `${player.name} Lv.${player.lvl} (${player.exp.expPercent}%)`;
    }    

    const combineStatsWithBonus = (base, bonus) => {
        const total = base + (base * (bonus / 100));
        const formattedBonus = formatBonusStat(bonus);
        return `${nFormatter(total)} (${formattedBonus})`;
    };
    const formatBonusStat = (bonus) => {
        let formattedBonus = bonus.toFixed(2).replace(rx, "$1");
        let colorClass = 'neutral'; 
        if (bonus > 0) {
            formattedBonus = `+${formattedBonus}`;
            colorClass = 'positive';
        } else if (bonus < 0) {
            colorClass = 'negative';
        }
        return `<span class="${colorClass}">${formattedBonus}%</span>`;
    };
    
    playerNameElement.innerHTML = `LVL: ${player.lvl} (${player.exp.expPercent}%)`;
    playerGoldElement.innerHTML = `<i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(player.gold)}`;
    playerHpElement.innerHTML = `${nFormatter(player.stats.hp)} / ${nFormatter(player.stats.hpMax)}`;
    playerAtkElement.innerHTML = combineStatsWithBonus(player.stats.atk, player.bonusStats.atk);
    playerDefElement.innerHTML = combineStatsWithBonus(player.stats.def, player.bonusStats.def);
    playerAtkSpdElement.innerHTML = combineStatsWithBonus(player.stats.atkSpd, player.bonusStats.atkSpd);
    playerVampElement.innerHTML = combineStatsWithBonus(player.stats.vamp, player.bonusStats.vamp);
    playerCrateElement.innerHTML = combineStatsWithBonus(player.stats.critRate, player.bonusStats.critRate);
    playerCdmgElement.innerHTML = combineStatsWithBonus(player.stats.critDmg, player.bonusStats.critDmg);
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
    player.bonusStats = {
        hp: 0,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0,
    };
};

const openInventory = () => {
    sfxOpen.play();
    dungeon.status.exploring = false;
    inventoryOpen = true;
    let openInv = document.querySelector('#inventory');
    let dimDungeon = document.querySelector('#dungeon-main');
    openInv.style.display = "flex";
    dimDungeon.style.filter = "brightness(50%)";

    sellAllElement.onclick = function () {
        sfxOpen.play();
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
            sfxDecline.play();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            openInv.style.filter = "brightness(100%)";
        };
    };
    sellRarityElement.onclick = function () {
        sfxOpen.play();
    };
    sellRarityElement.onchange = function () {
        let rarity = sellRarityElement.value;
        sellRarityElement.className = rarity;
    };
}

const closeInventory = () => {
    sfxDecline.play();
    let openInv = document.querySelector('#inventory');
    let dimDungeon = document.querySelector('#dungeon-main');
    openInv.style.display = "none";
    dimDungeon.style.filter = "brightness(100%)";
    inventoryOpen = false;
    if (!dungeon.status.paused) {
        dungeon.status.exploring = true;
    }
}

const openTavern = () => {
    sfxOpen.play();
    dungeon.status.exploring = false;
    tavernOpen = true;
    let openTav = document.querySelector('#tavern');
    let dimDungeon = document.querySelector('#dungeon-main');
    openTav.style.display = "flex";
    dimDungeon.style.filter = "brightness(50%)";

    sellAllTavernElement.onclick = function () {
        sfxOpen.play();
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
            sfxDecline.play();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            openInv.style.filter = "brightness(100%)";
        };
    };
    sellRarityElement.onclick = function () {
        sfxOpen.play();
    };
    sellRarityElement.onchange = function () {
        let rarity = sellRarityElement.value;
        sellRarityElement.className = rarity;
    };
}

const closeTavern = () => {
    sfxDecline.play();
    let openTav = document.querySelector('#tavern');
    let dimDungeon = document.querySelector('#dungeon-main');
    openTav.style.display = "none";
    dimDungeon.style.filter = "brightness(100%)";
    tavernOpen = false;
    if (!dungeon.status.paused) {
        dungeon.status.exploring = true;
    }
}

const continueExploring = () => {
    if (!inventoryOpen && !dungeon.status.paused) {
        dungeon.status.exploring = true;
    }
}

const lvlupPopup = () => {
    sfxLvlUp.play();
    addCombatLog(`You leveled up! (Lv.${player.lvl - player.exp.lvlGained} > Lv.${player.lvl})`);
    player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
    playerLoadStats();
    lvlupPanel.style.display = "flex";
    combatPanel.style.filter = "brightness(50%)";

    generateLvlStats(2, percentages);
}

const generateLvlStats = (rerolls, percentages) => {
    let selectedStats = [];
    let stats = ["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg"];
    while (selectedStats.length < 3) {
        let randomIndex = Math.floor(Math.random() * stats.length);
        if (!selectedStats.includes(stats[randomIndex])) {
            selectedStats.push(stats[randomIndex]);
        }
    }

    const loadLvlHeader = () => {
        lvlupSelectElement.innerHTML = `
            <h1>Level Up!</h1>
            <div class="content-head">
                <h4>Remaining: ${player.exp.lvlGained}</h4>
                <button id="lvlReroll">Reroll ${rerolls}/2</button>
            </div>
        `;
    }
    loadLvlHeader();

    const lvlReroll = document.querySelector("#lvlReroll");
    lvlReroll.addEventListener("click", function () {
        if (rerolls > 0) {
            sfxSell.play();
            rerolls--;
            loadLvlHeader();
            generateLvlStats(rerolls, percentages);
        } else {
            sfxDeny.play();
        }
    });

    try {
        for (let i = 0; i < 4; i++) {
            let button = document.createElement("button");
            button.id = "lvlSlot" + i;
            let h3 = document.createElement("h3");
            h3.innerHTML = selectedStats[i].replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase() + " UP";
            button.appendChild(h3);
            let p = document.createElement("p");
            p.innerHTML = `Increase bonus ${selectedStats[i].replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()} by ${percentages[selectedStats[i]]}%.`;
            button.appendChild(p);
            button.addEventListener("click", function () {
                sfxItem.play();
                player.bonusStats[selectedStats[i]] += percentages[selectedStats[i]];
                if (player.exp.lvlGained > 1) {
                    player.exp.lvlGained--;
                    generateLvlStats(2, percentages);
                } else {
                    player.exp.lvlGained = 0;
                    lvlupPanel.style.display = "none";
                    combatPanel.style.filter = "brightness(100%)";
                    leveled = false;
                }
                playerLoadStats();
                saveData();
            });
            lvlupSelectElement.appendChild(button);
        }
    } catch (err) { }
}
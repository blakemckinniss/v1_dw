document.addEventListener('DOMContentLoaded', function() {
    const vixensContainer = document.getElementById('vixensContainer');

    vixensContainer.addEventListener('click', function(e) {
        let target = e.target.closest('[class*="vixen-"]');
        if (target) {
            let vixenNumber = target.className.match(/vixen-(\d+)/)[1];
            if (vixenNumber) {
                console.log(player.vixens[vixenNumber - 1]);
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.vixen-item').forEach(item => {
        item.addEventListener('click', function() {
            var clone = this.cloneNode(true); // Clone the .vixen-item
            modalContent.innerHTML = ''; // Clear previous content
            modalContent.appendChild(clone); // Insert cloned content into modal
            modal.style.display = 'block'; // Show the modal
        });
    });

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});

function vixenByUUID(uuid) {
    modalContent.innerHTML = ''; // Clear previous content
    clonedMainVixen = mainVixen.cloneNode(true); // Clone the .vixen-item
    modalContent.appendChild(clonedMainVixen); // Insert cloned content into modal
    modal.style.display = 'block'; // Show the modal
}

function updateVixenModal(vixenData) {
    const { name, category, rarity, cardRarity, lvl, tier, avatar, stats, uuid } = vixenData;

    const vixenItem = document.querySelector(`#vixenModal .vixen-item`);
    const vixenNameTop = vixenItem.querySelector('.vixen-name-top');
    const card = vixenItem.querySelector(`.card`);
    const vixenBonusContainer = vixenItem.querySelector('.vixen-bonus-container');

    vixenItem.setAttribute('data-uuid', uuid);
    vixenItem.setAttribute('data-category', category);
    vixenItem.setAttribute('data-tier', tier);

    vixenNameTop.innerHTML = `<span class="vixen-name ${rarity}">${name}</span><span class="vixen-lvl grey">Lv. ${lvl})</span>`;
    vixenNameTop.className = `vixen-name-top ${rarity}`; // Update the class to reflect the new rarity

    card.className = `card card${rarity}`;
    card.querySelector('img').src = avatar;
    card.querySelector('img').alt = `${name} Avatar`;

    vixenBonusContainer.innerHTML = ''; // Clear existing bonuses
    stats.forEach(stat => {
        const statKey = Object.keys(stat)[0];
        const statValue = stat[statKey];
        const iconClass = iconMap[statKey] || "ra ra-help"; // Fallback icon if key not found
        const bonusHTML = `<div class="vixen-bonus"><span><i class="${iconClass}"></i><p>${parseInt(statValue)}</p></span></div>`;
        vixenBonusContainer.innerHTML += bonusHTML;
    });
}


function tallyVixenStats() {
    const statNameMap = {
        "atk": "atk",
        "hp": "hp",
        "def": "def",
        "atkspd": "atkSpd",
        "vamp": "vamp",
        "cdmg": "critDmg",
        "crate": "critRate",
    };

    vixenObject.forEach(tavernVixen => {
        tavernVixen.stats.forEach(stat => {
            const [statName, valueStr] = Object.entries(stat)[0];
            // Ensure value is treated as a float for percentage stats or an integer for others
            const value = statName.endsWith('%') || statName === 'vamp' || statName === 'crate' || statName === 'cdmg' ? parseFloat(valueStr) : parseInt(valueStr, 10);

            const normalizedStatName = statNameMap[statName.toLowerCase().replace(' %', '')];

            if (normalizedStatName && vixenObjectStats.hasOwnProperty(normalizedStatName)) {
                vixenObjectStats[normalizedStatName] += value;
            } else {
                console.warn(`Stat name ${statName} not recognized.`);
            }
        });
    });

    console.log(vixenObjectStats);
}

function showVixens() {
    if (!player || !player.vixens) {
        console.error('Player or player.vixens is undefined');
        return;
    } 
    if (player.vixens.length > 0) {
        console.log('Vixens:', player.vixens);
        tallyVixenStats();
        populateAllVixens();
    }
}


function addVixenStatsToPlayer() {
    if (!player || !player.bonusStats) {
        console.error('Player or player.bonusStats is undefined');
        return;
    }

    Object.keys(vixenObjectStats).forEach(statName => {
        if (player.bonusStats.hasOwnProperty(statName)) {
            player.bonusStats[statName] += vixenObjectStats[statName];
        } else {
            console.warn(`Stat ${statName} not found in player.bonusStats`);
        }
    });

    return player;
}

function generateVixenRarity() {
    const rand = Math.random();
    let sum = 0;
    for (const rarity in rarityChances) {
        sum += rarityChances[rarity];
        if (rand <= sum) return rarity;
    }
    return "Common";
}

function generateVixenStats(rarity) {
    const statsMap = {};
    const possibleStats = ["atk", "hp", "def", "crate %", "cdmg %", "vamp %", "atkspd %"];
    const statsCount = Math.min(Object.keys(rarityChances).indexOf(rarity) + 1, 4);

    while (Object.keys(statsMap).length < statsCount) {
        const statName = possibleStats[Math.floor(Math.random() * possibleStats.length)];
        const value = statName.endsWith('%') ? parseFloat((Math.random() * 10).toFixed(2)) : Math.floor(Math.random() * 50) + 1;

        if (statsMap.hasOwnProperty(statName)) {
            statsMap[statName] += value;
        } else {
            statsMap[statName] = value;
        }
    }

    const stats = Object.keys(statsMap).map(statName => ({
        name: statName,
        value: statName.endsWith('%') ? statsMap[statName].toFixed(2) : Math.round(statsMap[statName])
    }));

    return stats;
}


function addVixen(name, category, level, tier, avatar) {
    const rarity = generateVixenRarity();
    const stats = generateVixenStats(rarity);

    const newVixen = {
        name,
        category,
        rarity,
        lvl: level,
        tier,
        uuid: generateUniqueRandomString(10),
        avatar,
        stats: stats.map(stat => ({ [stat.name]: stat.value }))
    };

    vixenObject.push(newVixen);
    player.vixens = vixenObject;
    populateAllVixens();
}

function populateAllVixens() {
    if (!Array.isArray(player.vixens)) {
      console.error('vixenObject is not defined or not an array.');
      return;
    }
  
    player.vixens.forEach((_, index) => {
      populateVixenTemplate(index);
    });
  }

function populateVixenTemplate(index) {
    const vixen = vixenObject[index];
    index++;

    if (!vixen) {
        console.error('Vixen not found at the given index');
        return;
    }

    let vixenItem = document.querySelector(".vixen-item.vixen-" + index);
    vixenItem.querySelector('.vixen-name-top').innerHTML = `<span class="vixen-name ${vixen.rarity}">${vixen.name}</span><span class="vixen-lvl grey">Lv. ${vixen.lvl} <sup>${vixen.tier}</sup></span>`;;
    vixenItem.querySelector('.vixen-name-top').classList.add(vixen.rarity);
    vixenItem.querySelector('img').src = vixen.avatar;
    vixenItem.querySelector('img').alt = `${vixen.name} Avatar`;

    vixenItem.querySelector(".card").classList.add(`card${vixen.rarity}`);

    let bonusContainer = vixenItem.querySelector('.vixen-bonus-container');
    if (bonusContainer) {
        bonusContainer.innerHTML = '';
    } else {
        bonusContainer = document.createElement('div');
        bonusContainer.className = 'vixen-bonus-container';
        vixenItem.appendChild(bonusContainer);
    }


    vixen.stats.forEach(stat => {
        const statEntry = Object.entries(stat)[0];
        if (!statEntry) return;
        const [name, value] = statEntry;
        const statDiv = document.createElement('div');
        statDiv.className = 'vixen-bonus';
        let iconClass = '';
        switch (name) {
            case 'hp':
                iconClass = 'ra ra-hearts';
                break;
            case 'atk':
                iconClass = 'ra ra-sword';
                break;
            case 'def':
                iconClass = 'ra ra-round-shield';
                break;
            case 'crate %':
                iconClass = 'ra ra-knife';
                break;
            case 'cdmg %':
                iconClass = 'ra ra-focused-lightning';
                break;
            case 'vamp %':
                iconClass = 'ra ra-dripping-blade';
                break;
            case 'atkspd %':
                iconClass = 'ra ra-player-dodge';
                break;
            default:
                iconClass = '';
        }
        statDiv.innerHTML = `<span><i class="${iconClass}"></i><p>${parseFloat(value).toFixed(1)}${name.endsWith('%') ? '%' : ''}</p></span>`;
        bonusContainer.appendChild(statDiv);
    });

    vixenItem.style.display = 'block';
}


const createVixen = () => {
    const vixen = NULL_EQUIPMENT;
    const selectRandom = (array) => array[Math.floor(Math.random() * array.length)];
    vixen.attribute = selectRandom(["Damage", "Defense"]);
    if (vixen.attribute === "Damage") {
        vixen.type = selectRandom(vixenOptions.Damage.types);
        vixen.category = selectRandom(vixenOptions.Damage.categories);
    } else if (vixen.attribute === "Defense") {
        vixen.type = selectRandom(vixenOptions.Defense.types);
        if (vixenOptions.Defense.categoriesByType[vixen.type]) {
            vixen.category = selectRandom(vixenOptions.Defense.categoriesByType[vixen.type]);
        }
    }

    const randomNumber = Math.random();
    let cumulativeChance = 0;
    for (let rarity in rarityChances) {
        cumulativeChance += rarityChances[rarity];
        if (randomNumber <= cumulativeChance) {
            vixen.rarity = rarity;
            break;
        }
    }

    let loopCount = rarityLoopCounts[vixen.rarity] || 0;
    let statTypesKey = statsMapping[vixen.attribute]?.[vixen.category] || statsMapping[vixen.attribute]?.["default"];
    let statTypes = statTypesKey ? statsTypes[statTypesKey] : [];
    let vixenValue = 0;

    for (let i = 0; i < loopCount; i++) {
        let statType = statTypes[Math.floor(Math.random() * statTypes.length)];
        const maxLvl = dungeon.progress.floor * dungeon.settings.enemyLvlGap + (dungeon.settings.enemyBaseLvl - 1);
        const minLvl = maxLvl - (dungeon.settings.enemyLvlGap - 1);
        vixen.lvl = randomizeNum(minLvl, maxLvl);
        if (vixen.lvl > 100) {
            vixen.lvl = 100;
        }
        let enemyScaling = dungeon.settings.enemyScaling;
        if (enemyScaling > 2) {
            enemyScaling = 2;
        }
        let statMultiplier = (enemyScaling - 1) * vixen.lvl;
        vixen.tier = Math.round((enemyScaling - 1) * 10);
        let hpScaling = (40 * randomizeDecimal(0.5, 1.5)) + ((40 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let atkDefScaling = (16 * randomizeDecimal(0.5, 1.5)) + ((16 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let cdAtkSpdScaling = (3 * randomizeDecimal(0.5, 1.5)) + ((3 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let crVampScaling = (2 * randomizeDecimal(0.5, 1.5)) + ((2 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        if (statType === "hp") {
            statValue = randomizeNum(hpScaling * 0.5, hpScaling);
            vixenValue += statValue;
        } else if (statType === "atk") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            vixenValue += statValue * 2.5;
        } else if (statType === "def") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            vixenValue += statValue * 2.5;
        } else if (statType === "atkSpd") {
            statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
            if (statValue > 15) {
                statValue = 15 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            vixenValue += statValue * 8.33;
        } else if (statType === "vamp") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 8) {
                statValue = 8 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            vixenValue += statValue * 20.83;
        } else if (statType === "critRate") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 10) {
                statValue = 10 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            vixenValue += statValue * 20.83;
        } else if (statType === "critDmg") {
            statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
            vixenValue += statValue * 8.33;
        }


        if (loopCount > rarityThresholds[vixen.rarity]) {
            loopCount--;
        }

        let statExists = false;
        for (let j = 0; j < vixen.stats.length; j++) {
            if (Object.keys(vixen.stats[j])[0] == statType) {
                statExists = true;
                break;
            }
        }
        if (statExists) {
            for (let j = 0; j < vixen.stats.length; j++) {
                if (Object.keys(vixen.stats[j])[0] == statType) {
                    vixen.stats[j][statType] += statValue;
                    break;
                }
            }
        }
        else {
            vixen.stats.push({ [statType]: statValue });
        }
    }
    vixen.value = Math.round(vixenValue * 3);
    player.tavern.vixen.push(JSON.stringify(vixen));
    saveData();
    showTavern();
    showVixen();
    const girlShow = {
        category: vixen.category,
        rarity: vixen.rarity,
        lvl: vixen.lvl,
        tier: vixen.tier,
        icon: vixenIcon(vixen.category),
        stats: vixen.stats
    }
    return girlShow;
}

const vixenIcon = (vixen) => {
    const iconClass = vixenIcons[vixen];
    return iconClass ? `<i class="ra ${iconClass}"></i>` : undefined;
};

const showGirlInfo = (girl, icon, type, i) => {
    pauseSwitch();
    let girlInfo = document.querySelector("#vixenInfo");
    let dimContainer = document.querySelector(`#tavern`);
    if (girl.tier == undefined) {
        girl.tier = 1;
    }
    girlInfo.style.display = "flex";
    dimContainer.style.filter = "brightness(50%)";
    girlInfo.innerHTML = `
            <div class="content">
                <h3 class="${girl.rarity}">${icon}${girl.rarity} ${girl.category}</h3>
                <h5 class="lvltier ${girl.rarity}"><b>Lv.${girl.lvl} Tier ${girl.tier}</b></h5>
                <ul>
                ${girl.stats.map(stat => {
        if (Object.keys(stat)[0] === "critRate" || Object.keys(stat)[0] === "critDmg" || Object.keys(stat)[0] === "atkSpd" || Object.keys(stat)[0] === "vamp") {
            return `<li>${Object.keys(stat)[0].toString().replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()}+${stat[Object.keys(stat)[0]].toFixed(2).replace(rx, "$1")}%</li>`;
        }
        else {
            return `<li>${Object.keys(stat)[0].toString().replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()}+${stat[Object.keys(stat)[0]]}</li>`;
        }
    }).join('')}
                </ul>
                <div class="button-container">
                    <button id="un-enlist">${type}</button>
                    <button id="sell-enlist"><i class="ra ra-gem" style="color: #FFD700;"></i>${nFormatter(girl.value)}</button>
                    <button id="close-girl-info">Close</button>
                </div>
            </div>`;


    let unEnlist = document.querySelector("#un-enlist");
    unEnlist.onclick = function () {
        if (type == "Enlist") {

            if (player.enlisted.length >= 6) {
                player.tavern.vixen.splice(i, 1);
                player.enlisted.push(girl);

                girlInfo.style.display = "none";
                dimContainer.style.filter = "brightness(100%)";
                playerLoadStats();
                saveData();
                continueExploring();
            }
        } else if (type == "Unenlist") {
            player.enlisted.splice(i, 1);
            player.tavern.vixen.push(JSON.stringify(girl));

            girlInfo.style.display = "none";
            dimContainer.style.filter = "brightness(100%)";
            playerLoadStats();
            saveData();
            continueExploring();
        }
    };


    let sell = document.querySelector("#sell-enlist");
    sell.onclick = function () {
        girlInfo.style.display = "none";
        defaultModalElement.style.display = "flex";
        defaultModalElement.innerHTML = `
        <div class="content">
            <p>Sell <span class="${girl.rarity}">${icon}${girl.rarity} ${girl.category}</span>?</p>
            <div class="button-container">
                <button id="sell-enlist-confirm">Sell</button>
                <button id="sell-enlist-cancel">Cancel</button>
            </div>
        </div>`;

        let confirm = document.querySelector("#sell-enlist-confirm");
        let cancel = document.querySelector("#sell-enlist-cancel");
        confirm.onclick = function () {
            if (type == "Enlist") {
                player.gold += girl.value;
                player.tavern.vixen.splice(i, 1);
            } else if (type == "Unenlist") {
                player.gold += girl.value;
                player.enlisted.splice(i, 1);
            }

            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            dimContainer.style.filter = "brightness(100%)";
            playerLoadStats();
            saveData();
            continueExploring();
        }
        cancel.onclick = function () {
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            girlInfo.style.display = "flex";
            continueExploring();
        }
    };

    let close = document.querySelector("#close-girl-info");
    close.onclick = function () {
        girlInfo.style.display = "none";
        dimContainer.style.filter = "brightness(100%)";
        continueExploring();
    };
}

const showTavern = () => {
    let playerTavernList = document.getElementById("playerTavern");
    playerTavernList.innerHTML = "";
    if (vixenObject.length == 0) {
        playerTavernList.innerHTML = "There are no vixens available.";
    }
    for (let i = 0; i < vixenObject.length; i++) {
        const tavernVixen = vixenObject[i];
        console.log("Tavern Vixen: ", tavernVixen);
        let tavernVixenDiv = document.createElement('div');
        let icon = `<i class="ra ra-player ${tavernVixen.rarity}"></i>`;
        tavernVixenDiv.className = "tavernVixen";
        tavernVixenDiv.innerHTML = `<p class="${tavernVixen.rarity}">${icon}${tavernVixen.name}</p>`;
        tavernVixenDiv.setAttribute("data-tavernVixen", tavernVixen.uuid);
        tavernVixenDiv.addEventListener('click', function () {
            vixenObject.forEach(obj => {
                if (obj.uuid ==  this.getAttribute("data-tavernVixen")) {
                    vixenByUUID();
                    updateVixenModal(obj);
                }
            });
        });
        playerTavernList.appendChild(tavernVixenDiv);
    }
}


const showVixen = () => {
    let playerVixenList = document.getElementById("playerVixen");
    playerVixenList.innerHTML = "";
    if (player.enlisted.length == 0) {
        playerVixenList.innerHTML = "Nothing enlisted.";
    }
    for (let i = 0; i < player.enlisted.length; i++) {
        const girl = player.enlisted[i];
        let enlistDiv = document.createElement('div');
        let icon = vixenIcon(girl.category);
        enlistDiv.className = "girls";
        enlistDiv.innerHTML = `<button class="${girl.rarity}">${icon}</button>`;
        enlistDiv.addEventListener('click', function () {
            let type = "Unenlist";
            showGirlInfo(girl, icon, type, i);
        });
        playerVixenList.appendChild(enlistDiv);
    }
}

const applyVixenStats = () => {
    player.enlistedStats = {
        hp: 0,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0
    };
    for (let i = 0; i < player.enlisted.length; i++) {
        const girl = player.enlisted[i];
        girl.stats.forEach(stat => {
            for (const key in stat) {
                player.enlistedStats[key] += stat[key];
            }
        });
    }
    calculateStats();
}

const unenlistAll = () => {
    for (let i = player.enlisted.length - 1; i >= 0; i--) {
        const girl = player.enlisted[i];
        player.enlisted.splice(i, 1);
        player.tavern.vixen.push(JSON.stringify(girl));
    }
    playerLoadStats();
    saveData();
}

const sellAllVixen = (rarity) => {
    if (rarity == "All") {
        if (player.tavern.vixen.length !== 0) {
            for (let i = 0; i < player.tavern.vixen.length; i++) {
                const vixen = JSON.parse(player.tavern.vixen[i]);
                player.gold += vixen.value;
                player.tavern.vixen.splice(i, 1);
                i--;
            }
            playerLoadStats();
            saveData();
        }
    } else {
        let rarityCheck = false;
        for (let i = 0; i < player.tavern.vixen.length; i++) {
            const vixen = JSON.parse(player.tavern.vixen[i]);
            if (vixen.rarity === rarity) {
                rarityCheck = true;
                break;
            }
        }
        if (rarityCheck) {
            for (let i = 0; i < player.tavern.vixen.length; i++) {
                const vixen = JSON.parse(player.tavern.vixen[i]);
                if (vixen.rarity === rarity) {
                    player.gold += vixen.value;
                    player.tavern.vixen.splice(i, 1);
                    i--;
                }
            }
            playerLoadStats();
            saveData();
        }
    }
}

const createVixenPrint = (condition) => {
    let girl = createVixen();
    let panel = `
        <div class="primary-panel" style="padding: 0.5rem; margin-top: 0.5rem;">
                <h4 class="${girl.rarity}"><b>${girl.icon}${girl.rarity} ${girl.category}</b></h4>
                <h5 class="${girl.rarity}"><b>Lv.${girl.lvl} Tier ${girl.tier}</b></h5>
                <ul>
                ${girl.stats.map(stat => {
        if (Object.keys(stat)[0] === "critRate" || Object.keys(stat)[0] === "critDmg" || Object.keys(stat)[0] === "atkSpd" || Object.keys(stat)[0] === "vamp") {
            return `<li>${Object.keys(stat)[0].toString().replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()}+${stat[Object.keys(stat)[0]].toFixed(2).replace(rx, "$1")}%</li>`;
        }
        else {
            return `<li>${Object.keys(stat)[0].toString().replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()}+${stat[Object.keys(stat)[0]]}</li>`;
        }
    }).join('')}
            </ul>
        </div>`;
    if (condition == "combat") {
        addCombatLog(`
        ${enemy.name} dropped <span class="${girl.rarity}">${girl.rarity} ${girl.category}</span>.<br>${panel}`);
    } else if (condition == "dungeon") {
        addDungeonLog(`
        You got <span class="${girl.rarity}">${girl.rarity} ${girl.category}</span>.<br>${panel}`);
    }
}
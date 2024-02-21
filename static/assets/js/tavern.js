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

        // Decrement loopCount if it exceeds the threshold for the given rarity
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
    sfxOpen.play();

    dungeon.status.exploring = false;
    let girlInfo = document.querySelector("#vixenInfo");
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
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
                    <button id="sell-enlist"><i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(girl.value)}</button>
                    <button id="close-girl-info">Close</button>
                </div>
            </div>`;


    let unEnlist = document.querySelector("#un-enlist");
    unEnlist.onclick = function () {
        if (type == "Enlist") {

            if (player.enlisted.length >= 6) {
                sfxDeny.play();
            } else {
                sfxEquip.play();


                player.tavern.vixen.splice(i, 1);
                player.enlisted.push(girl);

                girlInfo.style.display = "none";
                dimContainer.style.filter = "brightness(100%)";
                playerLoadStats();
                saveData();
                continueExploring();
            }
        } else if (type == "Unenlist") {
            sfxUnequip.play();


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
        sfxOpen.play();
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
            sfxSell.play();


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
            sfxDecline.play();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            girlInfo.style.display = "flex";
            continueExploring();
        }
    };

    let close = document.querySelector("#close-girl-info");
    close.onclick = function () {
        sfxDecline.play();

        girlInfo.style.display = "none";
        dimContainer.style.filter = "brightness(100%)";
        continueExploring();
    };
}

const showTavern = () => {
    let playerTavernList = document.getElementById("playerTavern");
    playerTavernList.innerHTML = "";
    if (player.tavern.vixen.length == 0) {
        playerTavernList.innerHTML = "There are no girls available.";
    }
    for (let i = 0; i < player.tavern.vixen.length; i++) {
        const girl = JSON.parse(player.tavern.vixen[i]);
        let girlDiv = document.createElement('div');
        let icon = vixenIcon(girl.category);
        girlDiv.className = "girls";
        girlDiv.innerHTML = `<p class="${girl.rarity}">${icon}${girl.rarity} ${girl.category}</p>`;
        girlDiv.addEventListener('click', function () {
            let type = "Enlist";
            showGirlInfo(girl, icon, type, i);
        });
        playerTavernList.appendChild(girlDiv);
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
            sfxSell.play();
            for (let i = 0; i < player.tavern.vixen.length; i++) {
                const vixen = JSON.parse(player.tavern.vixen[i]);
                player.gold += vixen.value;
                player.tavern.vixen.splice(i, 1);
                i--;
            }
            playerLoadStats();
            saveData();
        } else {
            sfxDeny.play();
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
            sfxSell.play();
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
        } else {
            sfxDeny.play();
        }
    }
}

const createVixenPrint = (condition) => {
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
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
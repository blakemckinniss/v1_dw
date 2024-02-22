const createEquipment = () => {
    const equipment = NULL_EQUIPMENT;
    const selectRandom = (array) => array[Math.floor(Math.random() * array.length)];
    equipment.attribute = selectRandom(["Damage", "Defense"]);
    if (equipment.attribute === "Damage") {
        equipment.type = selectRandom(equipmentOptions.Damage.types);
        equipment.category = selectRandom(equipmentOptions.Damage.categories);
    } else if (equipment.attribute === "Defense") {
        equipment.type = selectRandom(equipmentOptions.Defense.types);
        if (equipmentOptions.Defense.categoriesByType[equipment.type]) {
            equipment.category = selectRandom(equipmentOptions.Defense.categoriesByType[equipment.type]);
        }
    }

    const randomNumber = Math.random();
    let cumulativeChance = 0;
    for (let rarity in rarityChances) {
        cumulativeChance += rarityChances[rarity];
        if (randomNumber <= cumulativeChance) {
            equipment.rarity = rarity;
            break;
        }
    }
    
    let loopCount = rarityLoopCounts[equipment.rarity] || 0;
    let statTypesKey = statsMapping[equipment.attribute]?.[equipment.category] || statsMapping[equipment.attribute]?.["default"];
    let statTypes = statTypesKey ? statsTypes[statTypesKey] : [];
    let equipmentValue = 0;

    for (let i = 0; i < loopCount; i++) {
        let statType = statTypes[Math.floor(Math.random() * statTypes.length)];
        const maxLvl = dungeon.progress.floor * dungeon.settings.enemyLvlGap + (dungeon.settings.enemyBaseLvl - 1);
        const minLvl = maxLvl - (dungeon.settings.enemyLvlGap - 1);
        equipment.lvl = randomizeNum(minLvl, maxLvl);
        if (equipment.lvl > 100) {
            equipment.lvl = 100;
        }
        let enemyScaling = dungeon.settings.enemyScaling;
        if (enemyScaling > 2) {
            enemyScaling = 2;
        }
        let statMultiplier = (enemyScaling - 1) * equipment.lvl;
        equipment.tier = Math.round((enemyScaling - 1) * 10);
        let hpScaling = (40 * randomizeDecimal(0.5, 1.5)) + ((40 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let atkDefScaling = (16 * randomizeDecimal(0.5, 1.5)) + ((16 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let cdAtkSpdScaling = (3 * randomizeDecimal(0.5, 1.5)) + ((3 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        let crVampScaling = (2 * randomizeDecimal(0.5, 1.5)) + ((2 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
        if (statType === "hp") {
            statValue = randomizeNum(hpScaling * 0.5, hpScaling);
            equipmentValue += statValue;
        } else if (statType === "atk") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            equipmentValue += statValue * 2.5;
        } else if (statType === "def") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            equipmentValue += statValue * 2.5;
        } else if (statType === "atkSpd") {
            statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
            if (statValue > 15) {
                statValue = 15 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            equipmentValue += statValue * 8.33;
        } else if (statType === "vamp") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 8) {
                statValue = 8 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            equipmentValue += statValue * 20.83;
        } else if (statType === "critRate") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 10) {
                statValue = 10 * randomizeDecimal(0.5, 1);
                loopCount++;
            }
            equipmentValue += statValue * 20.83;
        } else if (statType === "critDmg") {
            statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
            equipmentValue += statValue * 8.33;
        }

        // Decrement loopCount if it exceeds the threshold for the given rarity
        if (loopCount > rarityThresholds[equipment.rarity]) {
            loopCount--;
        }

        let statExists = false;
        for (let j = 0; j < equipment.stats.length; j++) {
            if (Object.keys(equipment.stats[j])[0] == statType) {
                statExists = true;
                break;
            }
        }
        if (statExists) {
            for (let j = 0; j < equipment.stats.length; j++) {
                if (Object.keys(equipment.stats[j])[0] == statType) {
                    equipment.stats[j][statType] += statValue;
                    break;
                }
            }
        }
        else {
            equipment.stats.push({ [statType]: statValue });
        }
    }
    equipment.value = Math.round(equipmentValue * 3);
    player.inventory.equipment.push(JSON.stringify(equipment));
    saveData();
    showInventory();
    showEquipment();
    const itemShow = {
        category: equipment.category,
        rarity: equipment.rarity,
        lvl: equipment.lvl,
        tier: equipment.tier,
        icon: equipmentIcon(equipment.category),
        stats: equipment.stats
    }
    return itemShow;
}

const equipmentIcon = (equipment) => {
    const iconClass = equipmentIcons[equipment];
    return iconClass ? `<i class="ra ${iconClass}"></i>` : undefined;
};

const showItemInfo = (item, icon, type, i) => {
    sfxOpen.play();

    dungeon.status.exploring = false;
    let itemInfo = document.querySelector("#equipmentInfo");
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let dimContainer = document.querySelector(`#inventory`);
    if (item.tier == undefined) {
        item.tier = 1;
    }
    itemInfo.style.display = "flex";
    dimContainer.style.filter = "brightness(50%)";
    itemInfo.innerHTML = `
            <div class="content">
                <h3 class="${item.rarity}">${icon}${item.rarity} ${item.category}</h3>
                <h5 class="lvltier ${item.rarity}"><b>Lv.${item.lvl} Tier ${item.tier}</b></h5>
                <ul>
                ${item.stats.map(stat => {
        if (Object.keys(stat)[0] === "critRate" || Object.keys(stat)[0] === "critDmg" || Object.keys(stat)[0] === "atkSpd" || Object.keys(stat)[0] === "vamp") {
            return `<li>${Object.keys(stat)[0].toString().replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()}+${stat[Object.keys(stat)[0]].toFixed(2).replace(rx, "$1")}%</li>`;
        }
        else {
            return `<li>${Object.keys(stat)[0].toString().replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()}+${stat[Object.keys(stat)[0]]}</li>`;
        }
    }).join('')}
                </ul>
                <div class="button-container">
                    <button id="un-equip">${type}</button>
                    <button id="sell-equip"><i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(item.value)}</button>
                    <button id="close-item-info">Close</button>
                </div>
            </div>`;


    let unEquip = document.querySelector("#un-equip");
    unEquip.onclick = function () {
        if (type == "Equip") {

            if (player.equipped.length >= 6) {
                sfxDeny.play();
            } else {
                sfxEquip.play();


                player.inventory.equipment.splice(i, 1);
                player.equipped.push(item);

                itemInfo.style.display = "none";
                dimContainer.style.filter = "brightness(100%)";
                playerLoadStats();
                saveData();
                continueExploring();
            }
        } else if (type == "Unequip") {
            sfxUnequip.play();


            player.equipped.splice(i, 1);
            player.inventory.equipment.push(JSON.stringify(item));

            itemInfo.style.display = "none";
            dimContainer.style.filter = "brightness(100%)";
            playerLoadStats();
            saveData();
            continueExploring();
        }
    };


    let sell = document.querySelector("#sell-equip");
    sell.onclick = function () {
        sfxOpen.play();
        itemInfo.style.display = "none";
        defaultModalElement.style.display = "flex";
        defaultModalElement.innerHTML = `
        <div class="content">
            <p>Sell <span class="${item.rarity}">${icon}${item.rarity} ${item.category}</span>?</p>
            <div class="button-container">
                <button id="sell-confirm">Sell</button>
                <button id="sell-cancel">Cancel</button>
            </div>
        </div>`;

        let confirm = document.querySelector("#sell-confirm");
        let cancel = document.querySelector("#sell-cancel");
        confirm.onclick = function () {
            sfxSell.play();


            if (type == "Equip") {
                player.gold += item.value;
                player.inventory.equipment.splice(i, 1);
            } else if (type == "Unequip") {
                player.gold += item.value;
                player.equipped.splice(i, 1);
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
            itemInfo.style.display = "flex";
            continueExploring();
        }
    };


    let close = document.querySelector("#close-item-info");
    close.onclick = function () {
        sfxDecline.play();

        itemInfo.style.display = "none";
        dimContainer.style.filter = "brightness(100%)";
        continueExploring();
    };
}

function generateUniqueRandomString(length) {
    // Create a random string of a given length
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Add a timestamp to the end of the random string
    const uniqueRandomString = randomString + Date.now().toString();

    return uniqueRandomString;
}

const showInventory = () => {

    let playerInventoryList = document.getElementById("playerInventory");
    playerInventoryList.innerHTML = "";

    if (player.inventory.equipment.length == 0) {
        playerInventoryList.innerHTML = "There are no items available.";
    }

    for (let i = 0; i < player.inventory.equipment.length; i++) {
        const item = JSON.parse(player.inventory.equipment[i]);

        let equpIcon = equipmentIcons[item.category]

        let uniqueString = generateUniqueRandomString(10);
        let itemDiv = document.createElement('div');
        let icon = equipmentIcon(item.category);
        itemDiv.className = "items";
        let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        let formattedStats = item.stats.map(stat => {
            const statKey = Object.keys(stat)[0];
            const formattedKey = statKey
                .replace(/([A-Z])/g, ".$1")
                .replace(/crit/g, "c")
                .toUpperCase();
        
            if (["critRate", "critDmg", "atkSpd", "vamp"].includes(statKey)) {
                const value = stat[statKey].toFixed(2).replace(rx, "$1");
                return `${formattedKey} +${value}%`;
            } else {
                return `${formattedKey} +${stat[statKey]}`;
            }
        });
        itemDiv.innerHTML = `<div class="item"><p class="${item.rarity}"><i class='ra ${equpIcon}'><poe-item reference="${uniqueString}" as-text icon-size="md" label-text="${item.rarity} ${item.category}"></poe-item></i></p></div></i>`;
        itemDiv.addEventListener('click', function () {
            let type = "Equip";
            showItemInfo(item, icon, type, i);
        });
        if (item.rarity == "Common") {
            tempRarity = "normal";
        } else if (item.rarity == "Uncommon") {
            tempRarity = "magic";
        } else if (item.rarity == "Rare") {
            tempRarity = "rare";
        } else if (item.rarity == "Epic") {
            tempRarity = "gem";
        } else if (item.rarity == "Legendary") {
            tempRarity = "unique";
        }
        window.HoradricHelper.PathOfExile.applyConfig({
            reference: uniqueString,
            iconUrl: "https://web.poecdn.com/image/Art/2DItems/Armours/Helmets/HelmetDexUnique2.png",
            data: {
            rarity: tempRarity,
            type: "currency",
            name: `${item.rarity} ${item.category}`,
            influences: ["elder"]
          ,
            baseName: "Lapis Amulet",
            sections: {
                requirements: ["Level 5"],
                implicits: ["+22 to Intelligence"],
                modifiers: formattedStats,
                flavourText: [
                  "You are slow, foolish and ignorant.",
                  "I am not."
                ]
              }
            }
          });
        playerInventoryList.appendChild(itemDiv);
        console.log("Added item: ", item);
    }

    
}


const showEquipment = () => {
    let playerEquipmentList = document.getElementById("playerEquipment");
    playerEquipmentList.innerHTML = "";
    if (player.equipped.length == 0) {
        playerEquipmentList.innerHTML = "Nothing equipped.";
    }
    for (let i = 0; i < player.equipped.length; i++) {
        const item = player.equipped[i];
        let equipDiv = document.createElement('div');
        let icon = equipmentIcon(item.category);
        equipDiv.className = "items";
        equipDiv.innerHTML = `<button class="${item.rarity}">${icon}</button>`;
        equipDiv.addEventListener('click', function () {
            let type = "Unequip";
            showItemInfo(item, icon, type, i);
        });
        playerEquipmentList.appendChild(equipDiv);
    }
}

const applyEquipmentStats = () => {
    player.equippedStats = {
        hp: 0,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0
    };
    for (let i = 0; i < player.equipped.length; i++) {
        const item = player.equipped[i];
        item.stats.forEach(stat => {
            for (const key in stat) {
                player.equippedStats[key] += stat[key];
            }
        });
    }
    calculateStats();
}

const unequipAll = () => {
    for (let i = player.equipped.length - 1; i >= 0; i--) {
        const item = player.equipped[i];
        player.equipped.splice(i, 1);
        player.inventory.equipment.push(JSON.stringify(item));
    }
    playerLoadStats();
    saveData();
}

const sellAll = (rarity) => {
    if (rarity == "All") {
        if (player.inventory.equipment.length !== 0) {
            sfxSell.play();
            for (let i = 0; i < player.inventory.equipment.length; i++) {
                const equipment = JSON.parse(player.inventory.equipment[i]);
                player.gold += equipment.value;
                player.inventory.equipment.splice(i, 1);
                i--;
            }
            playerLoadStats();
            saveData();
        } else {
            sfxDeny.play();
        }
    } else {
        let rarityCheck = false;
        for (let i = 0; i < player.inventory.equipment.length; i++) {
            const equipment = JSON.parse(player.inventory.equipment[i]);
            if (equipment.rarity === rarity) {
                rarityCheck = true;
                break;
            }
        }
        if (rarityCheck) {
            sfxSell.play();
            for (let i = 0; i < player.inventory.equipment.length; i++) {
                const equipment = JSON.parse(player.inventory.equipment[i]);
                if (equipment.rarity === rarity) {
                    player.gold += equipment.value;
                    player.inventory.equipment.splice(i, 1);
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

const createEquipmentPrint = (condition) => {
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let item = createEquipment();
    let panel = `
        <div class="primary-panel" style="padding: 0.5rem; margin-top: 0.5rem;">
                <h4 class="${item.rarity}"><b>${item.icon}${item.rarity} ${item.category}</b></h4>
                <h5 class="${item.rarity}"><b>Lv.${item.lvl} Tier ${item.tier}</b></h5>
                <ul>
                ${item.stats.map(stat => {
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
        ${enemy.name} dropped <span class="${item.rarity}">${item.rarity} ${item.category}</span>.<br>${panel}`);
    } else if (condition == "dungeon") {
        addDungeonLog(`
        You got <span class="${item.rarity}">${item.rarity} ${item.category}</span>.<br>${panel}`);
    }
}
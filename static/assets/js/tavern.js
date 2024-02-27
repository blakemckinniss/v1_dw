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
    const possibleStats = ["atk", "hp", "def", "critRate %", "critDmg %", "vamp %", "speed %"];
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

const addVixen = (name, category = "None", level = "1", tier = "1", avatar = "assets/img/vixen.jpg") => {
    if (!name) {
        console.error('Vixen name is required');
        return;
    }

    const rarity = generateVixenRarity();
    const stats = [generateVixenStats(rarity).reduce((acc, {name, value}) => ({...acc, [name]: value}), {})];

    const newVixen = {
        name,
        category,
        rarity,
        lvl: level,
        tier,
        uuid: generateUniqueRandomString(10),
        avatar,
        stats
    };

    vixenObject.push(newVixen);
    player.vixens = vixenObject;
    populateAllVixens();
};


function populateAllVixens() {
    // console.log('Populating all vixens:', player.vixens);
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
            case 'critRate %':
                iconClass = 'ra ra-knife';
                break;
            case 'critDmg %':
                iconClass = 'ra ra-focused-lightning';
                break;
            case 'vamp %':
                iconClass = 'ra ra-dripping-blade';
                break;
            case 'speed %':
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

const vixenIcon = (vixen) => {
    const iconClass = vixenIcons[vixen];
    return iconClass ? `<i class="ra ${iconClass}"></i>` : undefined;
};

const showTavern = () => {
    let playerTavernList = document.getElementById("playerTavern");
    playerTavernList.innerHTML = "";
    if (vixenObject.length == 0) {
        playerTavernList.innerHTML = "There are no vixens available.";
    }
    for (let i = 0; i < vixenObject.length; i++) {
        const tavernVixen = vixenObject[i];
        // console.log("Tavern Vixen: ", tavernVixen);
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

function showVixens() {
    console.log('Showing vixens:', player.vixens);
    if (!player || !player.vixens) {
        console.error('Player or player.vixens is undefined');
        return;
    } 
    if (player.vixens.length > 0) {
        populateAllVixens();
    }
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
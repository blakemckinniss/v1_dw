setInterval(() => {
    const now = new Date();
    if (!player.buffs) player.buffs = [];
    if (!player.banes) player.banes = [];
    player.buffs.forEach(buff => {
        if (buff.endTime < now) {
            removeBuff(buff.name);
        }
    });
    player.banes.forEach(bane => {
        if (bane.endTime < now) {
            removeBane(bane.name);
        }
    });
    updateBuffsBanesDisplay(); 
    saveBuffsBanesToLocalStorage(); 
}, 1000);

setInterval(() => {
    if (!dungeon.status.exploring && player.energy < player.maxEnergy) {
        player.energy = Math.min(player.energy + player.energyRegenRate, player.maxEnergy);
        playerLoadStats();
        addDungeonLog("You have regained some energy.", null, "Energy regeneration.");
    }
}, 60000); 

function addBuff(name, durationMinutes) {
    const endTime = new Date(new Date().getTime() + durationMinutes * 60000);
    player.buffs.push({ name, duration: durationMinutes, endTime });
    updateBuffsBanesDisplay();
    saveBuffsBanesToLocalStorage()
}

function addBane(name, durationMinutes) {
    const endTime = new Date(new Date().getTime() + durationMinutes * 60000);
    player.banes.push({ name, duration: durationMinutes, endTime });
    updateBuffsBanesDisplay();
    saveBuffsBanesToLocalStorage()
}

function removeBuff(name) {
    player.buffs = player.buffs.filter(buff => buff.name !== name);
    updateBuffsBanesDisplay();
    saveBuffsBanesToLocalStorage()
}

function removeBane(name) {
    player.banes = player.banes.filter(bane => bane.name !== name);
    updateBuffsBanesDisplay();
    saveBuffsBanesToLocalStorage()
}

function extendBuff(name, additionalMinutes) {
    const buff = player.buffs.find(buff => buff.name === name);
    if (buff) {
        buff.endTime = new Date(buff.endTime.getTime() + additionalMinutes * 60000);
        updateBuffsBanesDisplay();
    }
    saveBuffsBanesToLocalStorage()
}

function extendBane(name, additionalMinutes) {
    const bane = player.banes.find(bane => bane.name === name);
    if (bane) {
        bane.endTime = new Date(bane.endTime.getTime() + additionalMinutes * 60000);
        updateBuffsBanesDisplay();
    }
    saveBuffsBanesToLocalStorage()
}

function updateBuffsBanesDisplay() {
    const buffsPanel = document.querySelector('.buffs');
    const banesPanel = document.querySelector('.banes');
    buffsPanel.innerHTML = '<h4></h4>';
    banesPanel.innerHTML = '<h4></h4>';
    player.buffs.forEach(buff => {
        const timeLeft = calculateTimeLeft(buff.endTime);
        buffsPanel.innerHTML += `<p>${buff.name} (${timeLeft})</p>`;
    });
    player.banes.forEach(bane => {
        const timeLeft = calculateTimeLeft(bane.endTime);
        banesPanel.innerHTML += `<p>${bane.name} (${timeLeft})</p>`;
    });
}

function loadBuffsBanesFromLocalStorage() {
    const buffsBanesData = JSON.parse(localStorage.getItem('playerBuffsBanes'));
    if (buffsBanesData) {
        player.buffs = buffsBanesData.buffs.map(buff => ({
            ...buff,
            endTime: new Date(buff.endTime) 
        }));
        player.banes = buffsBanesData.banes.map(bane => ({
            ...bane,
            endTime: new Date(bane.endTime) 
        }));
        updateBuffsBanesDisplay();
    }
}

function saveBuffsBanesToLocalStorage() {
    const buffsBanesData = {
        buffs: player.buffs,
        banes: player.banes
    };
    localStorage.setItem('playerBuffsBanes', JSON.stringify(buffsBanesData));
}
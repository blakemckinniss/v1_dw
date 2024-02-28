import { createVixen } from './vixens.js'; // Import the function to generate a new vixen

// Function to ensure player always has at least one vixen
function ensureMainVixen() {
    if (player.vixens.length === 0) {
        const mainVixen = createVixen(); // Create a default vixen
        player.vixens.push(mainVixen);
        updatePlayerStatsWithMainVixen(mainVixen);
        console.log('Main vixen created and assigned');
    } else {
        updatePlayerStatsWithMainVixen(player.vixens[0]); // Ensure player stats are synced with main vixen
    }
}

function updatePlayerStatsWithMainVixen(vixen) {
    // Assuming vixen's stats are structured in a way they can be directly assigned to player.stats
    player.stats = { ...vixen.stats };
}

function savePlayerData() {
    try {
        const serializedData = JSON.stringify(player);
        localStorage.setItem('playerData', serializedData);
        console.log('Player data saved successfully.');
    } catch (e) {
        console.error('Failed to save player data to localStorage:', e);
    }
}

function loadPlayerData() {
    try {
        const serializedData = localStorage.getItem('playerData');
        if (serializedData) {
            const savedPlayerData = JSON.parse(serializedData);
            Object.assign(player, savedPlayerData);
            ensureMainVixen(); // Ensure there is at least one vixen after loading
            console.log('Player data loaded successfully.');
        } else {
            ensureMainVixen(); // Ensure there is at least one vixen if no data was saved before
        }
    } catch (e) {
        console.error('Failed to load player data from localStorage:', e);
        ensureMainVixen(); // Ensure there is at least one vixen in case of any error
    }
}

export { player, savePlayerData, loadPlayerData, ensureMainVixen };


// Initial player state
const player = {
    stats: {
        hp: 100,
        maxHp: 100,
        atk: 10,
        def: 5,
        speed: 2,
        vamp: 0,
        critRate: 0.1, // 10%
        critDmg: 1.5, // 150%
    },
    inventory: {
        gold: 0,
        items: [],
    },
    buffs: [],
    banes: [],
    vixens: [],
};

// Function to update player stats, potentially adding logic for buffs/banes
function updatePlayerStats() {
    player.buffs.forEach(buff => {
        switch(buff.type) {
            case 'hp':
                player.stats.hp += buff.value;
                break;
            case 'atk':
                player.stats.atk += buff.value;
                break;
            case 'def':
                player.stats.def += buff.value;
                break;
            case 'speed':
                player.stats.speed += buff.value;
                break;
            case 'vamp':
                player.stats.vamp += buff.value;
                break;
            case 'critRate':
                player.stats.critRate += buff.value;
                break;
            case 'critDmg':
                player.stats.critDmg += buff.value;
                break;
        }
    });

    player.stats.hp = Math.min(player.stats.hp, player.stats.maxHp);
}

// Function to update the player's inventory
function updateInventory(item = null, action = 'add') {
    if (item) {
        if (action === 'add') {
            player.inventory.items.push(item);
        } else if (action === 'remove') {
            const index = player.inventory.items.indexOf(item);
            if (index > -1) {
                player.inventory.items.splice(index, 1);
            }
        }
    }

    // Here you could add logic for updating inventory UI if necessary
}

// Example use: Update player stats and save to localStorage
function updateHealth(newHealth) {
    player.stats.hp = newHealth;
    savePlayerData(); // Save every time there's an update
}

// Exporting necessary functions and objects
export { player, updatePlayerStats, updateInventory, savePlayerData, loadPlayerData };

// Example initialization code
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData(); // Load player data when the document is ready
});

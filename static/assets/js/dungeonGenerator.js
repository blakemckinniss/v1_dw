class DungeonGenerator {
    constructor(playerLuck) {
        this.playerLuck = playerLuck; // Assuming player's luck is a value between 1 and 100

        this.requiredKeys = [
            { key: "Wooden Key", tier: 1 },
            { key: "Iron Key", tier: 2 },
            { key: "Silver Key", tier: 3 },
            { key: "Gold Key", tier: 4 },
            { key: "Copper Key", tier: 5 }
        ];

        this.rarityChances = {
            "Common": 0.7,
            "Uncommon": 0.2,
            "Rare": 0.04,
            "Epic": 0.03,
            "Legendary": 0.02,
            "Heirloom": 0.01
        };
    }

    generateDungeonByTier(tier) {
        let key = this.requiredKeys.find(k => k.tier === tier)?.key || "Wooden Key";
        let rarity = this.determineRarity();
        let { timeLimit, density, events } = this.calculateProgress(tier, rarity);
        let rewardBonus = this.calculateRewardBonus(tier, rarity);

        let dungeon = {
            tier: tier,
            requiredKey: key,
            rarity: rarity,
            progress: {
                timeLimit: timeLimit,
                density: density,
                events: events
            },
            settings: {
                enemyBaseLvl: tier,
                enemyScaling: 1.1 + (tier - 1) * 0.05, // Adjust as needed
                rewardBonus: rewardBonus,
                rewardScaling: 1.1 + (tier - 1) * 0.05 // Adjust as needed
            },
            events: this.populateEvents(events)
        };

        return dungeon;
    }

    determineRarity() {
        let roll = Math.random();
        let cumulative = 0;
        for (let rarity in this.rarityChances) {
            cumulative += this.rarityChances[rarity];
            if (roll < cumulative) {
                return rarity;
            }
        }
        return "Common"; // Fallback
    }

    calculateProgress(tier, rarity) {
        // Adjust these base values as per your game design
        let baseTimeLimit = 5 + this.playerLuck / 20; // Luck increases time limit
        let baseDensity = 10 + this.playerLuck / 10; // Luck increases density
        let baseEvents = 10 + Math.floor(this.playerLuck / 10); // Luck increases events
        let rarityBoost = Object.keys(this.rarityChances).indexOf(rarity) + 1;

        let timeLimit = baseTimeLimit + tier + rarityBoost;
        let density = baseDensity + tier * 2 + rarityBoost * 2;
        let events = baseEvents + tier + rarityBoost;
        return { timeLimit, density, events };
    }

    calculateRewardBonus(tier, rarity) {
        // Base reward bonus adjusted by tier, rarity, and player luck
        let baseRewardBonus = 1 + tier * 0.1 + this.playerLuck / 100;
        return baseRewardBonus;
    }

    populateEvents(maxEvents) {
        let positiveEvents = ["good", "very good", "extremely good"];
        let negativeEvents = ["bad", "very bad", "extremely bad"];
        let neutralEvents = ["neutral"];
        let events = [];

        for (let i = 0; i < maxEvents; i++) {
            let luckFactor = this.playerLuck / 100; // Convert luck to a 0-1 scale
            let eventTypeRoll = Math.random();
            let eventType;

            // Adjust these thresholds based on how much you want luck to influence event positivity
            if (eventTypeRoll < 0.5 * luckFactor) {
                eventType = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
            } else if (eventTypeRoll < 0.25 + 0.5 * luckFactor) {
                eventType = neutralEvents[Math.floor(Math.random() * neutralEvents.length)];
            } else {
                eventType = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
            }

            events.push({ type: eventType });
        }
        return events;
    }
}

// Example usage
const playerLuck = 75; // Assume the player's luck is 75
const dungeonGenerator = new DungeonGenerator(playerLuck);
let specificTierDungeon = dungeonGenerator.generateDungeonByTier(3); // Generates a dungeon for tier 3 with luck taken into account

console.log(specificTierDungeon);

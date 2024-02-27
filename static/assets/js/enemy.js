class Enemy {
    constructor(options) {
        this.type = options.type;
        this.lvl = options.lvl;
        this.name = options.name;
        this.image = "assets/img/enemy.png";
        this.stats = options.baseStatsGenerator.generate();
        let bonusStats = options.bonusStatsGenerator.generate(this.lvl);
        for (let stat in bonusStats) {
            this.stats[stat] += bonusStats[stat];
        }
        this.rewards = options.rewardsGenerator.generate(this.lvl);
    }
}

class StatsGenerator {
    generate() {
        throw new Error("Method 'generate()' must be implemented.");
    }
}

class ImageSelector {
    select(lvl) {
        throw new Error("Method 'select(lvl)' must be implemented.");
    }
}

class RewardsGenerator {
    generate(lvl) {
        throw new Error("Method 'generate(lvl)' must be implemented.");
    }
}

class AbilitiesGenerator {
    generate(lvl) {
        throw new Error("Method 'generate(lvl)' must be implemented.");
    }
}

class BaseStatsGenerator extends StatsGenerator {
    generate() {
        return {
            hp: 1000,
            hpMax: 1000,
            atk: 1000,
            def: 50,
            pen: 0,
            speed: 0.6,
            vamp: 0,
            critRate: 0,
            critDmg: 50
        };
    }
}

class BonusStatsGenerator extends StatsGenerator {
    generate(lvl) {
        // Example bonus calculation: flat increase based on lvl
        const bonus = {
            hp: 100 * lvl, // Adding 100 HP per lvl
            hpMax: 100 * lvl, // Adding 100 Max HP per lvl
            atk: 20 * lvl, // Adding 20 ATK per lvl
            def: 5 * lvl, // Adding 5 DEF per lvl
            pen: 1 * lvl, // Adding 1 PEN per lvl
            speed: 0.01 * lvl, // Increasing speed by 0.01 per lvl
            vamp: 0.5 * lvl, // Adding 0.5% vamp per lvl
            critRate: 0.5 * lvl, // Adding 0.5% crit rate per lvl
            critDmg: 1 * lvl // Adding 1% crit damage per lvl
        };

        let baseStats = new BaseStatsGenerator().generate();

        for (let stat in bonus) {
            baseStats[stat] += bonus[stat];
        }

        return baseStats;
    }
}

function randomize(min, max, isDecimal = false) {
    const val = Math.random() * (max - min) + min;
    return isDecimal ? val : Math.floor(val);
}

function determinelvl(condition) {
    switch (condition) {
        case 'easy':
            return randomize(1, 5);
        case 'normal':
            return randomize(5, 10);
        case 'hard':
            return randomize(10, 15);
        default:
            return 1;
    }
}

function determineName(type, condition) {
    return `${type} ${condition} Enemy`;
}

class ScaledRewardsGenerator extends RewardsGenerator {
    generate(lvl) {
        return {
            gold: this.scaleGold(lvl),
            experience: this.scaleExperience(lvl),
            items: this.generateScaledItems(lvl)
        };
    }

    scaleGold(lvl) {
        return Math.floor(50 * Math.pow(1.1, lvl));
    }

    scaleExperience(lvl) {
        return 100 * lvl + 50 * Math.floor(lvl / 5);
    }

    generateScaledItems(lvl) {
        if (lvl >= 15) {
            return ['Epic Sword', 'Elixir of Life'];
        } else if (lvl >= 10) {
            return ['Rare Armor', 'Large Healing Potion'];
        } else {
            return ['Healing Potion'];
        }
    }
}

class RandomizedRewardsGenerator extends RewardsGenerator {
    generate(lvl) {
        return {
            gold: randomize(40, 60) * lvl,
            experience: randomize(80, 120) * lvl,
            items: this.generateRandomItems(lvl)
        };
    }

    generateRandomItems(lvl) {
        const items = ['Healing Potion', 'Mana Potion', 'Strength Potion'];
        const result = [];
        const itemCount = randomize(1, 3); // Random number of items
        for (let i = 0; i < itemCount; i++) {
            const itemIndex = randomize(0, items.length - 1);
            result.push(items[itemIndex]);
        }
        return result;
    }
}

class OffensiveAbilitiesGenerator extends AbilitiesGenerator {
    generate(lvl) {
        const baseAbilities = ["Slash"];
        if (lvl > 5) baseAbilities.push("Bash");
        if (lvl > 10) baseAbilities.push("Destroy");
        return baseAbilities;
    }
}

const enemyOptions = {
    type: 'Offensive',
    lvl: determinelvl('normal'), // Assume this function exists and returns a lvl
    name: determineName('Offensive', 'normal'), // Assume this function exists and returns a name
    baseStatsGenerator: new BaseStatsGenerator(),
    bonusStatsGenerator: new BonusStatsGenerator(),
    rewardsGenerator: new RandomizedRewardsGenerator(), // Assume this exists
};
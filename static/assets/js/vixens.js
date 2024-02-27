const vixenBaseStats = [{
    hp: 1000,
    atk: 1000,
    def: 50,
}];

class Vixen {
    constructor() {
        this.name = this.generateName();
        this.category = this.randomCategory();
        this.rarity = this.randomRarity();
        this.lvl = 1; // Starting level
        this.tier = 1; // Starting tier
        this.avatar = "assets/img/vixen.jpg";
        this.stats = this.adjustStatsForRarityAndLevel(baseStats[0], this.rarity, this.lvl);
        this.uuid = this.generateUUID();
        this.innerHTML = this.generateInnerHTML();
    }

    generateName() {
        const names = ["Lily", "Rose", "Daisy", "Violet"];
        const suffix = "The Vixen";
        return `${names[Math.floor(Math.random() * names.length)]} ${suffix}`;
    }

    randomCategory() {
        const categories = ["Offensive", "Defensive", "Support"];
        return categories[Math.floor(Math.random() * categories.length)];
    }

    randomRarity() {
        const rarityChances = {
            "Common": 0.7,
            "Uncommon": 0.2,
            "Rare": 0.04,
            "Epic": 0.03,
            "Legendary": 0.02,
            "Heirloom": 0.01
        };
        let sum = 0;
        const rand = Math.random();
        for (const rarity in rarityChances) {
            sum += rarityChances[rarity];
            if (rand <= sum) {
                return rarity;
            }
        }
        return "Common"; // Fallback
    }

    adjustStatsForRarityAndLevel(baseStats, rarity, lvl) {
        const rarityMultiplier = {
          "Common": 1,
          "Uncommon": 1.1,
          "Rare": 1.25,
          "Epic": 1.5,
          "Legendary": 2,
          "Heirloom": 2.5
        };
      
        const randomFactor = () => 0.9 + Math.random() * 0.2;
      
        let statsMultiplier = rarityMultiplier[rarity];
      
        return {
          hp: Math.round(baseStats.hp * statsMultiplier * randomFactor()),
          atk: Math.round(baseStats.atk * statsMultiplier * randomFactor()),
          def: Math.round(baseStats.def * statsMultiplier * randomFactor()),
        };
      }
      

    generateUUID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateInnerHTML() {
        return `<p class="${this.rarity} tavern-vixen-${this.uuid}"><i class="ra ra-player ${this.rarity}"></i>${this.name}</p>`;
    }
}

//   const newVixen = new Vixen();
//   console.log(newVixen);

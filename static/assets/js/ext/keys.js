let devMode = false;
const PLAYERNAME = "Jinx";
const MAX_LEVEL = 100;
const TIER_CAP = 10;
const MAX_STAT_MULTIPLIERS = { hp: 40, atkDef: 16, cdSpeed: 3, crVamp: 2 };
const STAT_CAPS = { speed: 15, vamp: 8, critRate: 10 };
const GOLD_WRAPPER = '<i class="ra ra-gem" style="color: #FFD700;"></i><span class="Common">${1}</span>'
const statNamesRequiringPercentage = new Set(["critRate", "critDmg", "speed", "vamp"]);
const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
const NULL_EQUIPMENT = {
  category: null,
  attribute: null,
  type: null,
  rarity: null,
  lvl: null,
  tier: null,
  value: null,
  stats: [],
};
const combatBacklog = [];
const modal = document.getElementById('vixenModal');
const modalContent = document.querySelector('.modal-content');
const mainVixen = document.querySelector("#vixensContainer > .vixen-item.vixen-1");
let buttonChoices = [
  {
      title: '', 
      description: ''
  }
];
let buttonChoicesSettings = {
  callToAction: '',
  remainingChoices: 1,
  rerollChances: '1/1',
  message: ''
};
let vixenObject = [];
const vixenObjectStats = {
    "hp": 0,
    "atk": 0,
    "def": 0,
    "speed": 0,
    "vamp": 0,
    "critRate": 0,
    "critDmg": 0
};
const rarityThresholds = {
  "Common": 3,
  "Uncommon": 4,
  "Rare": 5,
  "Epic": 6,
  "Legendary": 7,
  "Heirloom": 9
};
const percentages = {
  "hp": 10,
  "atk": 8,
  "def": 8,
  "speed": 3,
  "vamp": 0.5,
  "critRate": 1,
  "critDmg": 6
};
const BASE_STATS = {
  hp: 5000,
  atk: 1000,
  def: 50,
  pen: 0,
  speed: 0.6,
  vamp: 0,
  critRate: 0,
  critDmg: 50
};
const EXP_DEFAULTS = {
  expCurr: 0,
  expMax: 100,
  expCurrLvl: 0,
  expMaxLvl: 100,
  lvlGained: 0
};

BASE_PLAYER = {
  name: PLAYERNAME,
  lvl: 1,
  stats: { ...BASE_STATS },
  baseStats: {
    hp: 5000,
    atk: 1000,
    def: 50,
    pen: 0,
    speed: 0.6,
    vamp: 0,
    critRate: 0,
    critDmg: 50
  },
  equippedStats: {
    hp: 0,
    atk: 0,
    def: 0,
    pen: 0,
    speed: 0,
    vamp: 0,
    critRate: 0,
    critDmg: 0,
    hpPct: 0,
    atkPct: 0,
    defPct: 0,
    penPct: 0,
  },
  bonusStats: { ...BASE_STATS, hp: 0, atk: 0, def: 0 },
  exp: { ...EXP_DEFAULTS },
  inventory: {
    consumables: [],
    equipment: []
  },
  tavern: {
    vixen: []
  },
  equipped: [],
  gold: 0,
  playtime: 0,
  kills: 0,
  deaths: 0,
  inCombat: false,
  luck: 1,
  strength: 100,
  materials: [],
  vixens: [],
  buffs: [],
  banes: [],
  energy: 100,
  maxEnergy: 100,
  energyCost: 1,
  energyRegenRate: 1,
  currentWeight: function () {
    return this.materials.reduce((total, material) => total + (material.weight * material.quantity), 0);
  }
};

const rarityLoopCounts = {
  "Common": 2,
  "Uncommon": 3,
  "Rare": 4,
  "Epic": 5,
  "Legendary": 6,
  "Heirloom": 8
};
const statsMapping = {
  "Damage": {
    "Axe": "damageyStats",
    "Scythe": "damageyStats",
    "Dagger": "speedyStats",
    "Flail": "speedyStats",
    "Hammer": "dmgDefStats",
    "default": "physicalStats"
  },
  "Defense": {
    "default": "defenseStats"
  }
};
const statsTypes = {
  "physicalStats": ["atk", "speed", "vamp", "critRate", "critDmg"],
  "damageyStats": ["atk", "atk", "vamp", "critRate", "critDmg", "critDmg"],
  "speedyStats": ["speed", "speed", "atk", "vamp", "critRate", "critRate", "critDmg"],
  "defenseStats": ["hp", "hp", "def", "def", "atk"],
  "dmgDefStats": ["hp", "def", "atk", "atk", "critRate", "critDmg"]
};

const statsConfig = {
  Damage: {
    Axe: ["atk", "atk", "vamp", "critRate", "critDmg", "critDmg"],
    Scythe: ["atk", "atk", "vamp", "critRate", "critDmg", "critDmg"],
    Dagger: ["speed", "speed", "atk", "vamp", "critRate", "critRate", "critDmg"],
    Flail: ["speed", "speed", "atk", "vamp", "critRate", "critRate", "critDmg"],
    Hammer: ["hp", "def", "atk", "atk", "critRate", "critDmg"],
    default: ["atk", "speed", "vamp", "critRate", "critDmg"]
  },
  Defense: ["hp", "hp", "def", "def", "atk"]
};
const skillEffects = {
  "Remnant Razor": {
    type: "percentageOfEnemyHp",
    value: 8
  },
  "Titan's Will": {
    type: "percentageOfPlayerHpMax",
    value: 5
  },
  "Devastator": {
    type: "percentageOfDamage",
    value: 30
  }
};
const equipmentOptions = {
  "Damage": {
    "types": ["Weapon"],
    "categories": ["Sword", "Axe", "Hammer", "Dagger", "Flail", "Scythe"]
  },
  "Defense": {
    "types": ["Armor", "Shield", "Helmet"],
    "categoriesByType": {
      "Armor": ["Plate", "Chain", "Leather"],
      "Shield": ["Tower", "Kite", "Buckler"],
      "Helmet": ["Great Helm", "Horned Helm"]
    }
  }
};
const vixenOptions = {
  "Damage": {
    "types": ["Mage", "Rogue", "Warrior"],
    "categories": ["Necromancer", "Assassin", "Berserker"]
  },
  "Defense": {
    "types": ["Priest", "Paladin", "Bard"],
    "categoriesByType": {
      "Healer": ["Priest", "Druid", "Shaman"],
      "Enchanter": ["Monk"],
    }
  }
};
const rarityChances = {
  "Common": 0.7,
  "Uncommon": 0.2,
  "Rare": 0.04,
  "Epic": 0.03,
  "Legendary": 0.02,
  "Heirloom": 0.01
};
const trapTypes = ["spike pit", "arrow trap", "magical snare"];
const iconMap = {
  hp: "ra ra-hearts",
  atk: "ra ra-sword",
  def: "ra ra-round-shield",
  speed: "ra ra-player-dodge",
  vamp: "ra ra-dripping-blade",
  critRate: "ra ra-knife",
  critDmg: "ra ra-focused-lightning",
  strength: "ra ra-muscle-up",
  energy: "ra ra-lightning-bolt",
  luck: "ra ra-clover"
};
const equipmentIcons = {
  "Sword": "ra-relic-blade",
  "Axe": "ra-axe",
  "Hammer": "ra-flat-hammer",
  "Dagger": "ra-bowie-knife",
  "Flail": "ra-chain",
  "Scythe": "ra-scythe",
  "Plate": "ra-vest",
  "Chain": "ra-vest",
  "Leather": "ra-vest",
  "Tower": "ra-shield",
  "Kite": "ra-heavy-shield",
  "Buckler": "ra-round-shield",
  "Great Helm": "ra-knight-helmet",
  "Horned Helm": "ra-helmet"
};
const vixenIcons = {
  "Mage": "ra-raze",
  "Rogue": "ra-hood",
  "Warrior": "ra-helmet",
  "Priest": "ra-hood",
  "Paladin": "ra-helmet",
  "Bard": "ra-hood",
  "Necromancer": "ra-raze",
  "Assassin": "ra-hood",
  "Berserker": "ra-helmet",
  "Healer": "ra-hood",
};
const eventWeights = [
  { type: 'nextroom', weight: 10 },
  { type: 'vixenCamp', weight: 5 },
  { type: 'treasure', weight: 20 },
  { type: 'enemy', weight: 30 },
  { type: 'nothing', weight: 15 },
  { type: 'blessing', weight: 5 },
  { type: 'curse', weight: 5 },
  { type: 'trap', weight: 5 },
  { type: 'monarch', weight: 5 },
];
const skillDescriptions = {
  "Remnant Razor": "Attacks deal extra 8% of enemies' current health on hit.",
  "Titan's Will": "Attacks deal extra 5% of your maximum health on hit.",
  "Devastator": "Deal 30% more damage but you lose 30% base attack speed.",
  "Rampager": "Increase attack by 5 after each hit. Stack resets after battle.",
  "Blade Dance": "Gain increased attack speed after each hit. Stack resets after battle.",
  "Paladin's Heart": "You receive 25% less damage permanently.",
  "Aegis Thorns": "Enemies receive 15% of the damage they dealt."
};
const menuHtml = `
<div class="content">
  <div class="content-head">
    <h3>Menu</h3>
    <p id="close-menu"><i class="fa fa-xmark"></i></p>
  </div>
  <button id="player-menu">Jinx</button>
  <button id="stats">Current Run</button>
  <button id="volume-btn">Volume Settings</button>
  <button id="quit-run">Abandon</button>
</div>`;
let dungeon = {
  rating: 500,
  grade: "E",
  progress: {
    floor: 1,
    room: 1,
    floorLimit: 100,
    roomLimit: 5,
  },
  settings: {
    enemyBaseLvl: 1,
    enemyLvlGap: 5,
    enemyBaseStats: 1,
    enemyScaling: 1.1,
  },
  status: {
    exploring: false,
    paused: true,
    event: false,
  },
  statistics: {
    kills: 0,
    runtime: 0,
  },
  backlog: [],
  action: 0,
};

const confirmQuitHtml = `
<div class="content">
  <div class="content-head">
    <h3>Confirm Abandonment</h3>
    <p id="quit-close"><i class="fa fa-xmark"></i></p>
  </div>
  <p>Do you really want to abandon the run?</p>
  <div class="button-container">
    <button id="confirm-quit">Yes, abandon</button>
    <button id="cancel-quit">No, return</button>
  </div>
</div>`;

const defaultModalElementHtml = `
<div class="content">
    <p>Do you want to abandon this run?</p>
    <div class="button-container">
        <button id="quit-run">Abandon</button>
        <button id="cancel-quit">Cancel</button>
    </div>
</div>`;

const statConfig = {
  hp: { base: 50, multiplier: (value) => value * 50 },
  atk: { base: 10, multiplier: (value) => value * 10 },
  def: { base: 10, multiplier: (value) => value * 10 },
  speed: { base: 0.4, multiplier: (value) => 0.4 + (0.02 * value) }
};

const stackLimitMessage = "Cannot acquire more materials due to max stack limit.";
const weightLimitMessage = "Cannot acquire more materials due to weight limit.";
const defaultMaterialRarity = "Common";
const defaultMaterialIcon = "loot_bag";
const invalidMaterialDrop = "Invalid quantity to drop.";
const promptMaterialDropMessage = "Enter quantity to drop:";
const quantityAddedMessage = (materialName, quantity) => `Added ${quantity} of ${materialName} to inventory.`;
const quantityToRemoveMessage = (materialName, quantity) => `Removed ${quantity} of ${materialName} from inventory.`;
const materialNotFoundMessage = (materialName) => `${materialName} not found in inventory.`;
const materialDisplayTemplate = (material) => `
<p class="clickable-material">
    <img src="${material.icon}" alt="${material.name} Icon" style="width: 32px; height: 32px; vertical-align: middle;">
    <span class="material-name ${material.rarity}">${material.name} (${material.quantity})</span>
</p>
`;
const materialIconTemplate = (materialData) => `/assets/materials/${materialData.icon || defaultMaterialIcon}.png`;
const materialRemovedTemplate = (materialName) => `Removed all of ${materialName} from inventory.`;
const promptMaterialTemplate = (text) => `Enter quantity to ${text.toLowerCase()}:`;
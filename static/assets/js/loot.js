class LootGenerator {
  constructor () {
    this.rarityChances = rarityChances
    this.equipmentIcons = equipmentIcons
    this.categoryMetadata = {
      Dagger: {
        speedBonus: 0.05,
        flavorText: 'A sharp tool for precise cuts.'
      },
      Flail: { atkBonus: 10, flavorText: 'Unpredictable and deadly.' },
      Scythe: { critRateBonus: 10, flavorText: 'Reap more than just crops.' },
      Plate: { defBonus: 10, flavorText: 'Sturdy as the earth.' },
      Chain: { hpBonus: 50, flavorText: 'Linked for life.' },
      Leather: { vampBonus: 10, flavorText: 'Sleek and deadly.' },
      Tower: { defBonus: 15, flavorText: 'Unmovable and unbreakable.' },
      Kite: { hpBonus: 75, flavorText: 'Soar above the fray.' },
      Buckler: { speedBonus: 0.1, flavorText: 'Swift as the wind.' },
      'Great Helm': {
        hpBonus: 100,
        flavorText: 'For the bravest of the brave.'
      }
    }
    this.prefixes = weaponPrefixes
    this.suffixes = weaponSuffixes
    this.uniqueAbilities = weaponAbilities
}

  *generateLoot (category = null, lvl = 1) {
    while (true) {
      let categoryKeys = category
        ? [category]
        : Object.keys(this.equipmentIcons)
      let selectedCategory =
        categoryKeys[Math.floor(Math.random() * categoryKeys.length)]
      let rarity = this.determineRarity()
      let icon = `<i class="ra ${this.equipmentIcons[selectedCategory]}"></i>`
      let prefixKey = this.randomChance(Object.keys(this.prefixes))
      let suffixKey = this.randomChance(Object.keys(this.suffixes))
      let prefix = this.prefixes[prefixKey]
      let suffix = this.suffixes[suffixKey]
      let name = `${prefixKey ? prefixKey + ' ' : ''}${selectedCategory}${
        suffixKey ? ' ' + suffixKey : ''
      }`
      let stats = this.generateStats(selectedCategory, prefix, suffix, lvl)
      let flavorText =
        this.categoryMetadata[selectedCategory]?.flavorText ||
        'A mysterious item with unknown origins.'
      let uniqueAbility = this.uniqueAbilities[selectedCategory]
        ? this.uniqueAbilities[selectedCategory]
        : null
      let setBonus = this.checkForSetBonus(selectedCategory)

      yield {
        name,
        category: selectedCategory,
        rarity,
        lvl,
        icon,
        stats,
        flavorText,
        uniqueAbility,
        setBonus
      }
    }
  }

  determineRarity() {
    let random = Math.random()
    let cumulativeProbability = 0
    for (let rarity in this.rarityChances) {
      cumulativeProbability += this.rarityChances[rarity]
      if (random < cumulativeProbability) return rarity
    }
    return 'Common'
  }

  generateStats (category, prefix = {}, suffix = {}, lvl = 1) {
    let scaleMultiplier = 1 + (lvl - 1) / 10
    let baseStats = {
      speed: parseFloat(((Math.random() * 2.5 * lvl) / 10).toFixed(2)),
      hp: Math.floor((Math.random() * 101 * lvl) / 10),
      atk: Math.floor((Math.random() * 101 * lvl) / 10),
      def: Math.floor((Math.random() * 101 * lvl) / 10),
      vamp: Math.floor((Math.random() * 101 * lvl) / 10),
      critRate: Math.floor((Math.random() * 101 * lvl) / 10),
      critDmg: Math.floor((Math.random() * 101 * lvl) / 10)
    }
    let categoryModifiers = this.categoryMetadata[category] || {}
    Object.keys(categoryModifiers).forEach(key => {
      baseStats[key] = (baseStats[key] || 0) + categoryModifiers[key]
    })
    Object.keys(baseStats).forEach(stat => {
      baseStats[stat] = Math.floor(baseStats[stat] * scaleMultiplier)
    })
    Object.assign(baseStats, prefix, suffix)
    return baseStats
  }

  randomChance (choices) {
    return choices[Math.floor(Math.random() * choices.length)]
  }

  checkForSetBonus (category) {
    for (let setName in this.itemSets) {
      if (this.itemSets[setName].items.includes(category)) {
        return this.itemSets[setName].setBonus
      }
    }
    return null
  }
}
const lootGenerator = new LootGenerator()


// const allLootIterator = lootGenerator.generateLoot()
// console.log(allLootIterator.next().value)



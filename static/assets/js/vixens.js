const vixenBaseStats = [
  {
    hp: 100,
    atk: 50,
    def: 50,
    speed: 0.1,
    vamp: 0,
    critRate: 0,
    critDmg: 0,
    luck: 1
  }
]

class Vixen {
  constructor () {
    this.name = this.generateName()
    this.category = this.randomCategory()
    this.rarity = this.randomRarity()
    this.lvl = 1 // Starting level
    this.tier = 1 // Starting tier
    this.avatar = 'assets/img/vixen.jpg'
    this.stats = this.adjustStatsForRarityAndLevel(
      vixenBaseStats[0],
      this.rarity,
      this.lvl
    )
    this.uuid = this.generateUUID()
    this.innerHTML = this.generateInnerHTML()
  }

  generateName () {
    const names = ['Lily', 'Rose', 'Daisy', 'Violet']
    const suffix = 'The Vixen'
    return `${names[Math.floor(Math.random() * names.length)]} ${suffix}`
  }

  randomCategory () {
    const categories = ['Offensive', 'Defensive', 'Support']
    return categories[Math.floor(Math.random() * categories.length)]
  }

  randomRarity () {
    let sum = 0
    const rand = Math.random()
    for (const rarity in rarityChances) {
      sum += rarityChances[rarity]
      if (rand <= sum) {
        return rarity
      }
    }
    return 'Common' // Fallback
  }

  adjustStatsForRarityAndLevel (vixenBaseStats, rarity, lvl) {
    const rarityMultiplier = {
      Common: 1,
      Uncommon: 1.1,
      Rare: 1.25,
      Epic: 1.5,
      Legendary: 2,
      Heirloom: 2.5
    }

    const randomFactor = () => 0.9 + Math.random() * 0.2

    let statsMultiplier = rarityMultiplier[rarity]

    return {
      hp: Math.round(vixenBaseStats.hp * statsMultiplier * randomFactor()),
      atk: Math.round(vixenBaseStats.atk * statsMultiplier * randomFactor()),
      def: Math.round(vixenBaseStats.def * statsMultiplier * randomFactor()),
      speed: Math.round(
        vixenBaseStats.speed * statsMultiplier * randomFactor()
      ),
      vamp: Math.round(vixenBaseStats.vamp * statsMultiplier * randomFactor()),
      critRate: Math.round(
        vixenBaseStats.critRate * statsMultiplier * randomFactor()
      ),
      critDmg: Math.round(
        vixenBaseStats.critDmg * statsMultiplier * randomFactor()
      ),
      luck: Math.round(vixenBaseStats.luck * statsMultiplier * randomFactor())
    }
  }

  generateUUID () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  generateInnerHTML () {
    return `<p class="${this.rarity} tavern-vixen-${this.uuid}"><i class="ra ra-player ${this.rarity}"></i>${this.name}</p>`
  }
}
//   console.log(newVixen);

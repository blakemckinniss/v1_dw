let player = JSON.parse(localStorage.getItem('playerData'))

const saveData = () => {
  const playerData = JSON.stringify(player)
  const dungeonData = JSON.stringify(dungeon)
  // const enemyData = JSON.stringify(enemy);
  const volumeData = JSON.stringify(volume)
  localStorage.setItem('playerData', playerData)
  localStorage.setItem('dungeonData', dungeonData)
  // localStorage.setItem("enemyData", enemyData);
  localStorage.setItem('volumeData', volumeData)
}

let inventoryOpen = false
let tavernOpen = false
let materialOpen = false
let leveled = false

window.addEventListener('load', initializeGame)

function initializeGame () {
  if (!player) {
    player = BASE_PLAYER
  }

  if (
    !player.vixens ||
    !verifyObjectKeys(player.vixens[0], requiredVixenKeys)
  ) {
    player = BASE_PLAYER
    player.vixens[0] = new Vixen()
    saveData()
    console.log(
      'Player vixen data was invalid, resetting to default:',
      player.vixens[0]
    )
  }
  player.stats = player.vixens[0].stats

  normalizePlayer()
  enterDungeon()
}

const enterDungeon = () => {
  pauseSwitch()
  player.inCombat = false
  //   if (player.stats.hp == 0) {
  //     progressReset()
  //   }
  initialDungeonLoad()
  playerLoadStats()
}

close.onclick = function () {
  defaultModalElement.style.display = 'none'
  defaultModalElement.innerHTML = ''
}

const objectValidation = () => {
  if (player.skills == undefined) {
    player.skills = []
  }
  if (player.tempStats == undefined) {
    player.tempStats = {}
    player.tempStats.atk = 0
    player.tempStats.speed = 0
  }
  saveData()
}

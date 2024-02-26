

function firstClickHandler (event) {
  setVolume()
  document.removeEventListener('click', firstClickHandler, true)
}

function formatTimestamp (timestamp) {
  return (
    timestamp.getHours() +
    ':' +
    timestamp.getMinutes().toString().padStart(2, '0')
  )
}

let choiceOneAction = function () {}
let choiceTwoAction = function () {}
let choiceThreeAction = function () {}

function raiseAtk (percentage) {
  addDungeonLog(`Attack increased by ${percentage * 100}%`)
}

function raiseDef (percentage) {
  addDungeonLog(`Defense increased by ${percentage * 100}%`)
}

function raiseHp (percentage) {
  addDungeonLog(`HP increased by ${percentage * 100}%`)
}

/**
 * Toggles the visibility of the choice panel and dynamically creates choice buttons.
 * @param {number} numberOfButtons - Number of choice buttons to create.
 * @param {Array} buttonContent - Array of objects containing the title and description for each button.
 * @param {Function} buttonAction - The action to attach to each button click event.
 * @param {Object} settings - Configuration object containing metadata like call to action and reroll chances.
 */
//toggleChoicePanel(buttonChoices, buttonChoicesSettings);
function toggleChoicePanel (buttonContent, buttonChoicesSettings) {
  var choicePanel = document.getElementById('choicePanel')
  var choiceSelect = document.getElementById('choiceSelect')
  choicePanel.style.display =
    choicePanel.style.display === 'flex' ? 'none' : 'flex'
  if (arguments.length < 1) {
    return
  }
  var numberOfButtons = buttonContent.length

  while (choiceSelect.children.length > 3) {
    choiceSelect.removeChild(choiceSelect.lastChild)
  }

  choiceSelect.querySelector('h1').textContent =
    buttonChoicesSettings.callToAction || 'Choose One!'
  choiceSelect.querySelector(
    '.content-head h4'
  ).textContent = `Remaining: ${buttonChoicesSettings.remainingChoices}`
  choiceSelect.querySelector(
    '#rerollButton'
  ).textContent = `Reroll ${buttonChoicesSettings.rerollChances}`
  choiceSelect.querySelector(
    '.modal-text'
  ).textContent = `${buttonChoicesSettings.message}`

  for (let i = 0; i < numberOfButtons; i++) {
    let button = document.createElement('button')
    button.id = `choiceOption${i}`
    button.innerHTML = `<h3>${buttonContent[i].title}</h3><p>${buttonContent[i].description}</p>`
    button.addEventListener('click', function () {
      onChoiceSelected(i)
    })
    choiceSelect.appendChild(button)
  }
}

function onChoiceSelected (index) {
  console.log(`Option ${index} selected`)
  switch (index) {
    case 0:
      choiceOneAction()
      break
    case 1:
      choiceTwoAction()
      break
    case 2:
      choiceThreeAction()
      break
    default:
      console.log('Invalid choice')
  }
  toggleChoicePanel()
}

function handleReroll () {
  console.log('Reroll clicked')
  toggleChoicePanel()
}

document.getElementById('rerollButton').addEventListener('click', handleReroll)

document
  .querySelectorAll('#choiceOption0, #choiceOption1, #choiceOption3')
  .forEach(option => {
    option.addEventListener('click', function () {
      console.log(this.querySelector('h3').innerText + ' selected')
      toggleChoicePanel()
    })
  })

function fullDungeonReset () {
  dungeon.progress.floor = 1
  dungeon.progress.room = 1
  dungeon.statistics.kills = 0
  dungeon.status = {
    exploring: false,
    paused: true,
    event: false
  }
  dungeon.settings = {
    enemyBaseLvl: 1,
    enemyLvlGap: 5,
    enemyBaseStats: 1,
    enemyScaling: 1.1
  }
  delete dungeon.enemyMultipliers
  dungeon.backlog.length = 0
  dungeon.action = 0
  dungeon.statistics.runtime = 0
}

document.addEventListener('click', firstClickHandler, true)

document.querySelector('#menu-btn').addEventListener('click', function () {
  closeInventory()

  pauseSwitch()
  let dimDungeonElement = document.querySelector('#dungeon-main')
  dimDungeonElement.style.filter = 'brightness(50%)'
  menuModalElement.style.display = 'flex'

  // Menu tab
  menuModalElement.innerHTML = `
    <div class="content">
        <div class="content-head">
            <h3>Menu</h3>
            <p id="close-menu"><i class="fa fa-xmark"></i></p>
        </div>
        <button id="player-menu"><i class="fas fa-user"></i>${player.name}</button>
        <button id="stats">Current Run</button>
        <button id="volume-btn">Volume Settings</button>
        <button id="quit-run">Abandon</button>
    </div>`

  let close = document.querySelector('#close-menu')
  let playerMenu = document.querySelector('#player-menu')
  let runMenu = document.querySelector('#stats')
  let quitRun = document.querySelector('#quit-run')
  let volumeSettings = document.querySelector('#volume-btn')

  // Player profile click function
  playerMenu.onclick = function () {
    let playTime = new Date(player.playtime * 1000).toISOString().slice(11, 19)
    menuModalElement.style.display = 'none'
    defaultModalElement.style.display = 'flex'
    defaultModalElement.innerHTML = `
        <div class="content" id="profile-tab">
            <div class="content-head">
                <h3>Statistics</h3>
                <p id="profile-close"><i class="fa fa-xmark"></i></p>
            </div>
            <p>${player.name} Lv.${player.lvl}</p>
            <p>Kills: ${nFormatter(player.kills)}</p>
            <p>Deaths: ${nFormatter(player.deaths)}</p>
            <p>Playtime: ${playTime}</p>
        </div>`
    let profileTab = document.querySelector('#profile-tab')
    profileTab.style.width = '15rem'
    let profileClose = document.querySelector('#profile-close')
    profileClose.onclick = function () {
      defaultModalElement.style.display = 'none'
      defaultModalElement.innerHTML = ''
      menuModalElement.style.display = 'flex'
    }
  }

  // Dungeon run click function
  runMenu.onclick = function () {
    let runTime = new Date(dungeon.statistics.runtime * 1000)
      .toISOString()
      .slice(11, 19)
    menuModalElement.style.display = 'none'
    defaultModalElement.style.display = 'flex'
    defaultModalElement.innerHTML = `
        <div class="content" id="run-tab">
            <div class="content-head">
                <h3>Current Run</h3>
                <p id="run-close"><i class="fa fa-xmark"></i></p>
            </div>
            <p>${player.name} Lv.${player.lvl} (${player.skills})</p>
            <p>Blessing Lvl.${player.blessing}</p>
            <p>Curse Lvl.${Math.round(
              (dungeon.settings.enemyScaling - 1) * 10
            )}</p>
            <p>Kills: ${nFormatter(dungeon.statistics.kills)}</p>
            <p>Runtime: ${runTime}</p>
        </div>`
    let runTab = document.querySelector('#run-tab')
    runTab.style.width = '15rem'
    let runClose = document.querySelector('#run-close')
    runClose.onclick = function () {
      defaultModalElement.style.display = 'none'
      defaultModalElement.innerHTML = ''
      menuModalElement.style.display = 'flex'
    }
  }

  // Quit the current run
  quitRun.onclick = function () {
    menuModalElement.style.display = 'none'
    defaultModalElement.style.display = 'flex'
    defaultModalElement.innerHTML = `
        <div class="content">
            <p>Do you want to abandon this run?</p>
            <div class="button-container">
                <button id="quit-run">Abandon</button>
                <button id="cancel-quit">Cancel</button>
            </div>
        </div>`
    let quit = document.querySelector('#quit-run')
    let cancel = document.querySelector('#cancel-quit')
    quit.onclick = function () {
      let dimDungeonElement = document.querySelector('#dungeon-main')
      dimDungeonElement.style.filter = 'brightness(100%)'
      dimDungeonElement.style.display = 'none'
      menuModalElement.style.display = 'none'
      menuModalElement.innerHTML = ''
      defaultModalElement.style.display = 'none'
      defaultModalElement.innerHTML = ''
      clearInterval(dungeonTimer)
      clearInterval(playTimer)
      progressReset()
    }
    cancel.onclick = function () {
      defaultModalElement.style.display = 'none'
      defaultModalElement.innerHTML = ''
      menuModalElement.style.display = 'flex'
    }
  }

  // Opens the volume settings
  volumeSettings.onclick = function () {
    let master = volume.master * 100
    let bgm = volume.bgm * 100 * 2
    let sfx = volume.sfx * 100
    menuModalElement.style.display = 'none'
    defaultModalElement.style.display = 'flex'
    defaultModalElement.innerHTML = `
        <div class="content" id="volume-tab">
            <div class="content-head">
                <h3>Volume</h3>
                <p id="volume-close"><i class="fa fa-xmark"></i></p>
            </div>
            <label id="master-label" for="master-volume">Master (${master}%)</label>
            <input type="range" id="master-volume" min="0" max="100" value="${master}">
            <label id="bgm-label" for="bgm-volume">BGM (${bgm}%)</label>
            <input type="range" id="bgm-volume" min="0" max="100" value="${bgm}">
            <label id="sfx-label" for="sfx-volume">SFX (${sfx}%)</label>
            <input type="range" id="sfx-volume" min="0" max="100" value="${sfx}">
            <button id="apply-volume">Apply</button>
        </div>`
    let masterVol = document.querySelector('#master-volume')
    let bgmVol = document.querySelector('#bgm-volume')
    let sfxVol = document.querySelector('#sfx-volume')
    let applyVol = document.querySelector('#apply-volume')
    let volumeTab = document.querySelector('#volume-tab')
    volumeTab.style.width = '15rem'
    let volumeClose = document.querySelector('#volume-close')
    volumeClose.onclick = function () {
      sfxDecline.play()
      defaultModalElement.style.display = 'none'
      defaultModalElement.innerHTML = ''
      menuModalElement.style.display = 'flex'
    }

    // Volume Control
    masterVol.oninput = function () {
      master = this.value
      document.querySelector('#master-label').innerHTML = `Master (${master}%)`
    }

    bgmVol.oninput = function () {
      bgm = this.value
      document.querySelector('#bgm-label').innerHTML = `BGM (${bgm}%)`
    }

    sfxVol.oninput = function () {
      sfx = this.value
      document.querySelector('#sfx-label').innerHTML = `SFX (${sfx}%)`
    }

    applyVol.onclick = function () {
      volume.master = master / 100
      volume.bgm = bgm / 100 / 2
      volume.sfx = sfx / 100
      setVolume()
      saveData()
    }
  }

  // Close menu
  close.onclick = function () {
    sfxDecline.play()
    continueExploring()
    menuModalElement.style.display = 'none'
    menuModalElement.innerHTML = ''
    dimDungeonElement.style.filter = 'brightness(100%)'
  }
})

const targetNode = document.getElementById('dungeonLog')
const callback = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      const pElements = targetNode.querySelectorAll('p')
      if (pElements.length > 2) {
        const oldestP = pElements[0]

        oldestP.addEventListener(
          'transitionend',
          function () {
            this.remove() // Remove the element after transition ends
            if (dungeon.backlog.length > 0) {
              dungeon.backlog.shift()
            }
          },
          { once: true }
        ) // Ensures the listener is removed after execution
        oldestP.classList.add('fade-out')
      }
    }
  }
}

function normalizePlayer () {
  console.log('Normalizing player object...')
  if (player.vixens.length <= 0) {
    player.vixens = [];
    console.log('Vixen object is empty, adding default vixen.')
    addVixen('Jinx')
  }
  vixenObject = player.vixens
  vixenObject.forEach(obj => {
    if (!obj.hasOwnProperty('uuid')) {
      obj.uuid = generateUniqueRandomString(10)
    }
  })
  player.vixens = vixenObject
  if (!player.tavern) player.tavern = BASE_PLAYER.tavern
  if (!player.tavern.vixen) player.tavern.vixen = BASE_PLAYER.tavern.vixen
  if (!player.enlisted) player.enlisted = []
  if (!player.buffs) player.buffs = []
  if (!player.banes) player.banes = []
  if (!player.maxWeight) player.maxWeight = 500
  if (!player.currentWeight)
    player.currentWeight = () =>
      player.materials.reduce(
        (total, material) => total + material.weight * material.quantity,
        0
      )
  saveData()
}

function calculateTimeLeft (endTime) {
  const now = new Date()
  const timeLeft = endTime - now
  const minutes = Math.floor(timeLeft / 60000)
  const seconds = ((timeLeft % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

const observer = new MutationObserver(callback)
const config = { childList: true }
observer.observe(targetNode, config)
function sleep (milliseconds) {
  const start = new Date().getTime()
  while (new Date().getTime() - start < milliseconds) {
    // Busy wait does nothing while blocking execution
  }
}

document.ondblclick = function (e) {
  e.preventDefault()
}

const nFormatter = num => {
  let lookup = [
    { value: 1, symbol: '' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ]
  let item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value
    })
  return item
    ? (num / item.value).toFixed(1).replace(rx, '$1') + item.symbol
    : '0'
}

const querySelector = selector => document.querySelector(selector)

const randomizeNum = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.round(Math.floor(Math.random() * (max - min + 1)) + min)
}

const randomizeDecimal = (min, max) => {
  return Math.random() * (max - min) + min
}

const toggleDisplay = (selector, displayStyle) => {
  const element = querySelector(selector)
  element.style.display = displayStyle
}

const updateBrightness = (selector, brightness) => {
  selector.style.filter = `brightness(${brightness})`
}

const allocationPopup = () => {
  let allocation = {
    hp: 5,
    atk: 5,
    def: 5,
    atkSpd: 5
  }
  let stats = {}
  const updateStats = () => {
    Object.keys(allocation).forEach(stat => {
      const { multiplier } = statConfig[stat]
      stats[stat] = multiplier(allocation[stat])
    })
  }
  updateStats()
  let points = 20
  const loadContent = () => {
    const statRows = Object.entries(allocation)
      .map(
        ([key, value]) => `
            <div class="row">
                <p><i class="icon-${key}"></i><span id="${key}Display">${key.toUpperCase()}: ${
          stats[key]
        }</span></p>
                <div class="row">
                    <button id="${key}Min">-</button>
                    <span id="${key}Allo">${value}</span>
                    <button id="${key}Add">+</button>
                </div>
            </div>
        `
      )
      .join('')

    defaultModalElement.innerHTML = `
        <div class="content" id="allocate-stats">
            <div class="content-head">
                <h3>Allocate Stats</h3>
                <p id="allocate-close"><i class="fa fa-xmark"></i></p>
            </div>
            ${statRows}
            <div class="row">
                <p id="alloPts">Stat Points: ${points}</p>
                <button id="allocate-reset">Reset</button>
            </div>
            <div class="row">
                <p>Passive</p>
                <select id="select-skill">...</select>
            </div>
            <div class="row primary-panel pad">
                <p id="skill-desc">...</p>
            </div>
            <button id="allocate-confirm">Confirm</button>
        </div>`
  }

  defaultModalElement.style.display = 'flex'
  loadContent()

  const formatStatName = stat =>
    stat
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/ /g, '.')
      .toUpperCase()
  const updateUI = (stat, points, allocation, stats, rx) => {
    document.querySelector(`#${stat}Display`).innerHTML = `${formatStatName(
      stat
    )}: ${stats[stat].toFixed(2).replace(rx, '$1')}`
    document.querySelector(`#${stat}Allo`).innerHTML = allocation[stat]
    document.querySelector(`#alloPts`).innerHTML = `Stat Points: ${points}`
  }

  const handleStatButtons = e => {
    const action = e.includes('Add') ? 'Add' : 'Min'
    let stat = e.split(action)[0]
    const updateStat = modifier => {
      allocation[stat] += modifier
      points -= modifier
      sfxConfirm.play()
      updateStats()
      updateUI(stat, points, allocation, stats, rx)
    }

    if (action === 'Add' && points > 0) {
      updateStat(1)
    } else if (action === 'Min' && allocation[stat] > 5) {
      updateStat(-1)
    } else {
      sfxDeny.play()
    }
  }

  document
    .querySelector('#statButtonsContainer')
    .addEventListener('click', function (event) {
      if (
        event.target.id &&
        event.target.id.match(/(hp|atk|def|atkSpd)(Add|Min)/)
      ) {
        handleStatButtons(event.target.id)
      }
    })

  let selectSkill = document.querySelector('#select-skill')
  let skillDesc = document.querySelector('#skill-desc')

  selectSkill.addEventListener('change', function () {
    skillDesc.innerHTML =
      skillDescriptions[selectSkill.value] ||
      'Default description for unknown skills.'
    sfxConfirm.play()
  })

  let confirmButton = document.querySelector('#allocate-confirm')
  confirmButton.addEventListener('click', function () {
    objectValidation()
    player.skills.push(selectSkill.value)
    if (skillEffects[selectSkill.value]) {
      skillEffects[selectSkill.value](player)
    }

    enterDungeon()
    player.stats.hp = player.stats.hpMax
    playerLoadStats()
    defaultModalElement.style.display = 'none'
  })
}

const playSoundEffect = type => {
  const soundEffects = {
    open: () => sfxOpen.play(),
    deny: () => sfxDeny.play(),
    equip: () => sfxEquip.play(),
    enlist: () => sfxEquip.play(),
    unequip: () => sfxUnequip.play(),
    unenlist: () => sfxUnequip.play(),
    sell: () => sfxSell.play(),
    decline: () => sfxDecline.play()
  }
  if (soundEffects[type]) soundEffects[type]()
}

function battleRoutine () {
  validateHP()
  playerLoadStats()
  enemyLoadStats()
}

function triggerAnimation (element, animationClass, duration) {
  element.classList.add(animationClass)
  setTimeout(() => element.classList.remove(animationClass), duration)
}

function getRandomElement (array) {
  return array[Math.floor(Math.random() * array.length)]
}

function handleModalButtonClick (buttonId) {
  if (buttonId === 'unequip-confirm') {
    unequipAll()
  }
  continueExploring()
  closeModal()
}
function closeModal () {
  defaultModalElement.style.display = 'none'
  defaultModalElement.innerHTML = ''
}
function updateModalContent (htmlContent) {
  menuModalElement.innerHTML = htmlContent
  menuModalElement.style.display = 'flex'
}

function formatTime (seconds) {
  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

function toggleDim (element, brightness) {
  element.style.filter = `brightness(${brightness}%)`
}

function toggleTavernBrightness (brightness) {
  let dimTarget = document.querySelector('#tavern')
  dimTarget.style.filter = `brightness(${brightness}%)`
}

function showModal () {
  defaultModalElement.style.display = 'flex'
  defaultModalElement.innerHTML = `
        <div class="content">
            <p>Unequip all your items?</p>
            <div class="button-container">
                <button id="unequip-confirm">Unequip</button>
                <button id="unequip-cancel">Cancel</button>
            </div>
        </div>`
}

/**
 * Binds a property of an object to the innerHTML of an HTML element,
 * updating the element whenever the property changes.
 * @param {Object} obj - The object containing the property to monitor.
 * @param {string} propName - The name of the property to monitor.
 * @param {string} elementId - The ID of the HTML element to update.
 */
function bindPropertyToElement (obj, propName, elementId) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found:', elementId)
    return
  }

  const handler = {
    set (target, property, value) {
      if (property === propName) {
        target[property] = value
        element.innerHTML = value // Update the HTML element
        return true // Indicate success
      }
      return false // Indicate failure for other properties
    }
  }

  const proxy = new Proxy(obj, handler)

  // Initial update to ensure the element reflects the current property value
  element.innerHTML = obj[propName]

  // Return the proxy to allow further interaction with the original object
  return proxy
}

// Example usage
//   const data = { myVariable: 0 };
//   const proxyData = bindPropertyToElement(data, 'myVariable', 'myElementId');

// Now, whenever you update `proxyData.myVariable`, the innerHTML of the element
// with ID 'myElementId' will be automatically updated.
//   setInterval(() => {
//     proxyData.myVariable++; // This will update the HTML element's content
//   }, 1000);

const progressReset = () => {
  dimDungeonElement.style.filter = 'brightness(100%)'
  clearInterval(dungeonTimer)
  clearInterval(playTimer)

  player = BASE_PLAYER
  player.inCombat = false

  combatBacklog.length = 0
  fullDungeonReset()
  saveData()
}

function showVolumeSettings () {
  sfxOpen.play()
  const master = volume.master * 100
  const bgm = volume.bgm * 100
  const sfx = volume.sfx * 100
  const volumeSettingsHtml = `
  <div class="content" id="volume-tab">
    <div class="content-head">
      <h3>Volume</h3>
      <p id="volume-close"><i class="fa fa-xmark"></i></p>
    </div>
    <label for="master-volume">Master (${master.toFixed(0)}%)</label>
    <input type="range" id="master-volume" min="0" max="100" value="${master}">
    <label for="bgm-volume">BGM (${bgm.toFixed(0)}%)</label>
    <input type="range" id="bgm-volume" min="0" max="100" value="${bgm}">
    <label for="sfx-volume">SFX (${sfx.toFixed(0)}%)</label>
    <input type="range" id="sfx-volume" min="0" max="100" value="${sfx}">
    <button id="apply-volume">Apply</button>
  </div>`

  updateModalContent(volumeSettingsHtml)
  document.querySelector('#volume-close').addEventListener('click', () => {
    sfxDecline.play()
    openMenu()
  })
  document
    .querySelector('#apply-volume')
    .addEventListener('click', applyVolumeSettings)
  function applyVolumeSettings () {
    const masterVolume = document.querySelector('#master-volume').value / 100
    const bgmVolume = document.querySelector('#bgm-volume').value / 100
    const sfxVolume = document.querySelector('#sfx-volume').value / 100
    setVolume(masterVolume, bgmVolume, sfxVolume)
    sfxConfirm.play()
  }
}

function openMenu () {
  closeInventory()
  closeTavern()
  pauseSwitch()
  dimDungeonElement.style.filter = 'brightness(50%)'
  updateModalContent(menuHtml)
  attachMenuEventListeners()
}

function closeMenu () {
  continueExploring()
  menuModalElement.style.display = 'none'
  dimDungeonElement.style.filter = 'brightness(100%)'
}

function calculatePercentage (part, whole) {
  if (whole === 0) {
    console.log('The whole cannot be 0.')
    return 0 // Avoid division by zero
  }

  let percentage = (part / whole) * 100
  return percentage.toFixed(2) // This will format the percentage to two decimal places
}

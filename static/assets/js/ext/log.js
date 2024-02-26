const updateDungeonLog = (choices) => {
    
    logContainerElement.innerHTML = ''; 

    const startIndex = Math.max(dungeon.backlog.length - 8, 0);
    const recentEntries = dungeon.backlog.slice(startIndex);

    recentEntries.forEach(message => {
        const messageElement = document.createElement("p");
        messageElement.innerHTML = message;
        logContainerElement.appendChild(messageElement);
    });

    if (choices) {
        let eventChoices = document.createElement("div");
        eventChoices.innerHTML = choices;
        logContainerElement.appendChild(eventChoices);
        pauseSwitch(false, false, true);
    }

    logContainerElement.scrollTop = logContainerElement.scrollHeight;
};

/**
 * Enhanced addDungeonLog to accept subject as a string or an object with potential rarity.
 * @param {string} message - The log message with a placeholder for the subject.
 * @param {string|null} choices - Any choices related to the log entry.
 * @param {string|object} subjectObj - The subject of the log entry or an object containing the subject's details.
 */
const addDungeonLog = (message, choices, subjectObj = "") => {

    if (!devMode) {
        pauseSwitch(true, false, false);
    }

    let subject = subjectObj;
    let rarityClass = "";
    
    if (typeof subjectObj === "object" && subjectObj.rarity) {
        rarityClass = `rarity-${subjectObj.rarity.toLowerCase()}`;
        subject = `<span class="${rarityClass}">${subjectObj.name}</span>`;
    }

    message = message.replace("<subject>", subject);

    dungeon.backlog.push(message);
    updateDungeonLog(choices);
};

/**
 * Enhanced addDungeonLog to accept subject as a string or an object with potential rarity.
 * @param {string} message - The log message with a placeholder for the subject.
 * @param {string|null} choices - Any choices related to the log entry.
 * @param {string|object} subjectObj - The subject of the log entry or an object containing the subject's details.
 */
const addDungeonLogPaused = (message, choices, subjectObj = "") => {

    pauseSwitch();

    let subject = subjectObj;
    let rarityClass = "";
    
    if (typeof subjectObj === "object" && subjectObj.rarity) {
        rarityClass = `rarity-${subjectObj.rarity.toLowerCase()}`;
        subject = `<span class="${rarityClass}">${subjectObj.name}</span>`;
    }

    message = message.replace("<subject>", subject);

    dungeon.backlog.push(message);
    updateDungeonLog(choices);
};

const addCombatLog = (message) => {
    combatBacklog.push(message);
    updateCombatLog();
}

const updateCombatLog = () => {
    let combatLogBox = document.getElementById("combatLogBox");
    combatLogBox.innerHTML = "";

    for (let message of combatBacklog) {
        let logElement = document.createElement("p");
        logElement.innerHTML = message;
        combatLogBox.appendChild(logElement);
    }
    combatLogBox.scrollTop = combatLogBox.scrollHeight;
}
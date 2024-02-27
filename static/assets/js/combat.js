class CombatSystem {
    constructor() {
        this.combatSeconds = 0;
        this.combatTimer = null;
        this.enemy = new Enemy(enemyOptions);
    }

    static clampHp(entity) {
        entity.stats.hp = Math.max(0, Math.min(entity.stats.hp, entity.stats.hpMax));
    }

    static updateHpBar(entity, isPlayer = false) {
        const hpPercent = ((entity.stats.hp / entity.stats.hpMax) * 100).toFixed(2);
        if (isPlayer) {
            playerCombatHpElement.innerHTML = `<span class="battleTextBar" id="playerHpText" style="position: absolute;">&nbsp${nFormatter(entity.stats.hp)} / ${nFormatter(entity.stats.hpMax)}(${hpPercent}%)</span>`;
            playerCombatHpElement.style.width = `${hpPercent}%`;
            playerHpDamageElement.style.width = `${hpPercent}%`;
            playerExpElement.style.width = `${player.exp.expPercent}%`;
            playerInfoElement.innerHTML = `${player.name} Lv.${player.lvl} (${player.exp.expPercent}%)`;
        } else {
            const enemyHpElement = document.querySelector('#enemy-hp-battle');
            const enemyHpDamageElement = document.querySelector('#enemy-hp-dmg');
            enemyHpElement.innerHTML = `<span class="battleTextBar" id="enemyHpText" style="position: absolute;">&nbsp${nFormatter(entity.stats.hp)}/${nFormatter(entity.stats.hpMax)}&nbsp(${hpPercent}%)</span>`;
            enemyHpElement.style.width = `${hpPercent}%`;
            enemyHpDamageElement.style.width = `${hpPercent}%`;
        }
    }

    updateCombatUI() {
        CombatSystem.clampHp(this.enemy);
        CombatSystem.clampHp(player);
        CombatSystem.updateHpBar(player, true);
        CombatSystem.updateHpBar(this.enemy);
    }

    combatCounter = () => {
        this.combatSeconds++;
    }

    formatCombatTime = (seconds) => {
        return new Date(seconds * 1000).toISOString().substr(11, 8);
    }

    startCombat = () => {
        player.inCombat = true;
        pauseSwitch(false, true, true); // External function

        this.showCombatInfo();
        combatPanelElement.style.display = "flex"; // External DOM element
        dimDungeonElement.style.filter = "brightness(50%)"; // External DOM element
        this.updateCombatUI();

        setTimeout(this.playerAttack, 1000 / player.stats.speed);
        setTimeout(this.enemyAttack, 1000 / this.enemy.stats.speed);

        this.combatTimer = setInterval(this.combatCounter, 1000);
    }

    stopCombat = () => {
        console.log("Combat stopped");
        player.inCombat = false;
        this.hideCombatInfo();
        pauseSwitch(false, false, true); // External function
        this.closeBattlePanel();
    }

    playerAttack = () => {
        console.log("Player attacking");
        if (!player.inCombat) return;
        const damageInfo = this.calculateDamage(player, this.enemy); // External function
        this.enemy.stats.hp -= damageInfo.damage;
        player.stats.hp += damageInfo.lifesteal;
        this.combatAnimation(false, damageInfo.damage, damageInfo.crit);

        console.log("Player HP: ", player.stats.hp);
        this.updateCombatUI(); // External function
        enemyLoadStats(this.enemy); // External function
        if (this.enemy.stats.hp < 1) this.validateHP();
        if (player.inCombat) {
            setTimeout(this.playerAttack, 1000 / player.stats.speed);
        }
    }

    enemyAttack = () => {
        console.log("Enemy attacking");
        if (!player.inCombat) return;
        const damageInfo = this.calculateDamage(this.enemy, player); // External function
        console.log("Enemy damage: ", damageInfo.damage);
        player.stats.hp -= damageInfo.damage;
        console.log("New player HP: ", player.stats.hp);
        this.combatAnimation(true, damageInfo.damage, damageInfo.crit);

        console.log("Enemy HP: ", this.enemy.stats.hp);
        this.updateCombatUI(); // External function
        enemyLoadStats(this.enemy); // External function
        if (player.stats.hp < 1) this.validateHP();
        if (player.inCombat) {
            setTimeout(this.enemyAttack, 1000 / this.enemy.stats.speed);
        }
    }

    calculateDamage = (attacker, defender) => {
        let missChance = 5;
        missChance += defender.stats.def * 0.1 + (defender.stats.luck / 10) * 0.1;
    
        const speedDifference = defender.stats.speed - attacker.stats.speed;
        let dodgeChance = (speedDifference / 2.5) * 100;
        dodgeChance = Math.max(0, dodgeChance); // Ensure dodge chance is not negative
    
        const missOrDodgeRoll = Math.random() * 100;
        if (missOrDodgeRoll < missChance) {
            console.log("Attack missed!");
            return { damage: 0, lifesteal: 0, crit: false, missed: true, parried: false, dodged: false };
        } else if (missOrDodgeRoll < missChance + dodgeChance) {
            console.log("Attack dodged!");
            return { damage: 0, lifesteal: 0, crit: false, missed: false, parried: false, dodged: true };
        }
    
        let baseDamage = attacker.stats.atk - defender.stats.def;
        baseDamage = Math.max(baseDamage, 0);
    
        const critChance = Math.random() < (attacker.stats.critRate / 100) ? 2 : 1;
        let damage = Math.round(baseDamage * critChance);
    
        let parryChance = Math.max(0, (defender.stats.atk - attacker.stats.atk) / attacker.stats.atk * 100);
        parryChance = Math.min(parryChance, 50); // Optionally cap the parry chance
    
        let isParried = Math.random() * 100 < parryChance;
        if (isParried) {
            damage = Math.round(damage / 2); // Half damage on parry
            console.log("Attack parried!");
        }
    
        const lifesteal = Math.round(damage * (attacker.stats.vamp / 100));
    
        console.log("Damage: ", damage);
        return { damage, lifesteal, crit: critChance === 2, missed: false, parried: isParried, dodged: false };
    }

    validateHP = () => {
        console.log("Validating HP");
        console.log("Player HP: ", player.stats.hp);
        console.log("Enemy HP: ", this.enemy.stats.hp);
        if (player.stats.hp < 1) {
            console.log("Player died");
            handleDeath(player, true); // External function
            this.updateCombatState(true);
        } else if (this.enemy.stats.hp < 1) {
            document.querySelector("#enemyHpText").innerHTML = `&nbsp 0/${nFormatter(this.enemy.stats.hpMax)}&nbsp (0%)`;
            console.log("Enemy died");
            this.handleDeath(this.enemy, false);
            this.updateCombatState(false);
        }
    }

    handleDeath = (entity, isPlayer) => {
        console.log("Handling death");
        entity.stats.hp = 0;
        if (isPlayer) {
            addCombatLog(isPlayer, "You died.");
            player.stats.hp = 1;
        } else {
            addCombatLog(isPlayer, `${entity.name} died! (${this.formatCombatTime(this.combatSeconds)})`);
            this.closeBattlePanel();
            endCombat();
            pauseSwitch(true, false, false);
        }
    }

    combatAnimation = (isPlayer, damage, crit) => {
        let selector = isPlayer ? "#player-sprite" : "#enemy-sprite";
        let targetUI = isPlayer ? "#player-dmg-container" : "#enemy-dmg-container";
        let battleSprite = document.querySelector(selector);
        if (battleSprite) { // Added error handling
            battleSprite.classList.add("animation-shake");
            setTimeout(() => {
                battleSprite.classList.remove("animation-shake");
            }, 200);
        }

        const dmgContainer = document.querySelector(targetUI);
        if (dmgContainer) { // Added error handling
            const dmgNumber = document.createElement("p");
            dmgNumber.classList.add("dmg-numbers");
            dmgNumber.style.color = crit ? "gold" : ""; // Simplified crit handling
            dmgNumber.textContent = crit ? `${nFormatter(damage)}!` : nFormatter(damage); // External function
            dmgContainer.appendChild(dmgNumber);
            setTimeout(() => {
                if (dmgContainer.firstChild) {
                    dmgContainer.removeChild(dmgContainer.firstChild);
                }
            }, 370);
        }
    }

    updateCombatState = (isPlayer) => {
        if (isPlayer) {
            showRevivalOptions(); // External function
        } else {
            this.handleEnemyRewards(); // External function
        }
    }

    endCombat = () => {
        console.log("Combat ended");
        player.inCombat = false;
        pauseSwitch(true, false, false); // External function
        clearInterval(this.combatTimer);
        this.combatSeconds = 0;
    }

    handleEnemyRewards = () => {
        addCombatLog(`You earned ${nFormatter(this.enemy.rewards.exp)} exp.`);
        playerExpGain();
        addCombatLog(`${this.enemy.name} dropped <i class="ra ra-gem" style="color: #FFD700;"></i>${nFormatter(this.enemy.rewards.gold)} gold.`);
        player.gold += this.enemy.rewards.gold;
        if (this.enemy.rewards.drop) {
            createEquipmentPrint("combat");
        }
        player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
        playerLoadStats();
        this.closeBattlePanel();
        pauseSwitch(true, false, false);
    }

    closeBattlePanel = () => {
        document.querySelector("#battleButton").addEventListener("click", function () {
            let dimDungeonElement = document.querySelector('#dungeon-main');
            dimDungeonElement.style.filter = "brightness(100%)";
            combatPanelElement.style.display = "none";
            enemyDead = false;
            combatBacklog.length = 0;
        });
    }

    showCombatInfo = () => {
        console.log("This is the enemy", this.enemy);
        console.log("Max HP ", this.enemy.stats.hpMax);
        document.querySelector("#enemy-combat-info").textContent = `${this.enemy.name} Lv.${this.enemy.lvl}`;
        document.querySelector("#enemyHpText").innerHTML = `&nbsp${nFormatter(this.enemy.stats.hp)}/${nFormatter(this.enemy.stats.hpMax)}&nbsp(${this.enemy.stats.hpPercent}%)`;
        document.querySelector("#enemy-sprite").src = `./assets/img/vixen.jpg`;
        document.querySelector("#enemy-sprite").alt = this.enemy.name;
        document.querySelector("#enemy-sprite").style.width = this.enemy.image.size + 'px';
        document.querySelector("#player-combat-info").textContent = `Your Player Info Here`;
        document.querySelector("#playerHpText").innerHTML = `&nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)}&nbsp(${player.stats.hpPercent}%)`;
        const playerExpPercentage = ((player.stats.exp / player.stats.expMax) * 100).toFixed(2);
        document.querySelector("#player-exp-bar").style.width = playerExpPercentage + '%';
        document.querySelector("#player-exp-bar").textContent = `EXP: ${nFormatter(player.stats.exp)}/${nFormatter(player.stats.expMax)}`;
    };
}

const combatSystem = new CombatSystem();
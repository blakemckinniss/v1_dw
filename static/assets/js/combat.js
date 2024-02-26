class CombatSystem {
    constructor() {
        this.combatSeconds = 0;
        this.combatTimer = null;
    }

    combatCounter = () => {
        this.combatSeconds++;
    }

    formatCombatTime = (seconds) => {
        return new Date(seconds * 1000).toISOString().substr(11, 8);
    }

    startCombat = () => {
        console.log("Combat started");
        player.inCombat = true;
        this.showCombatInfo();
        pauseSwitch(false, true, true); // External function
        combatPanelElement.style.display = "flex"; // External DOM element
        setTimeout(this.playerAttack, 1000 / player.stats.atkSpd);
        setTimeout(this.enemyAttack, 1000 / enemy.stats.atkSpd);
        dimDungeonElement.style.filter = "brightness(50%)"; // External DOM element

        console.log("Player in combat: ", player.inCombat);
        playerLoadStats(); // External function
        enemyLoadStats(); // External function

        this.combatTimer = setInterval(this.combatCounter, 1000);
    }

    playerAttack = () => {
        console.log("Player attacking");
        if (!player.inCombat) return;
        const damageInfo = this.calculateDamage(player, enemy); // External function
        enemy.stats.hp -= damageInfo.damage;
        player.stats.hp += damageInfo.lifesteal;
        this.combatAnimation(false, damageInfo.damage, damageInfo.crit);

        console.log("Player HP: ", player.stats.hp);
        playerLoadStats(); // External function
        enemyLoadStats(); // External function
        if (enemy.stats.hp < 1) this.validateHP();
        if (player.inCombat) {
            setTimeout(this.playerAttack, 1000 / player.stats.atkSpd);
        }
    }

    enemyAttack = () => {
        console.log("Enemy attacking");
        if (!player.inCombat) return;
        const damageInfo = this.calculateDamage(enemy, player); // External function
        player.stats.hp -= damageInfo.damage;
        this.combatAnimation(true, damageInfo.damage, damageInfo.crit);

        console.log("Enemy HP: ", enemy.stats.hp);
        playerLoadStats(); // External function
        enemyLoadStats(); // External function
        if (player.stats.hp < 1) this.validateHP();
        if (player.inCombat) {
            setTimeout(this.enemyAttack, 1000 / enemy.stats.atkSpd);
        }
    }

    calculateDamage = (attacker, defender) => {
        let baseDamage = attacker.stats.atk - defender.stats.def;
        if (devMode) {
            baseDamage = 50;
        }
        baseDamage = Math.max(baseDamage, 0); 
        const critChance = Math.random() < attacker.stats.critRate ? 2 : 1; 
        const damage = Math.round(baseDamage * critChance);
        const lifesteal = Math.round(damage * (attacker.stats.vamp / 100)); 

        console.log("Damage: ", damage);
        return { damage, lifesteal, crit: critChance === 2};
    }

    validateHP = () => {
        console.log("Validating HP");
        console.log("Player HP: ", player.stats.hp);
        console.log("Enemy HP: ", enemy.stats.hp);
        if (player.stats.hp < 1) {
            console.log("Player died");
            handleDeath(player, true); // External function
            this.updateCombatState(true);
        } else if (enemy.stats.hp < 1) {
            document.querySelector("#enemyHpText").innerHTML = `&nbsp 0/${nFormatter(enemy.stats.hpMax)}&nbsp (0%)`;
            console.log("Enemy died");
            this.handleDeath(enemy, false);
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
            addCombatLog(isPlayer, `${entity.name} died! (${this.formatCombatTime(combatSeconds)})`);
            closeBattlePanel();
            endCombat();
            pauseSwitch(true, false, false);
        }
    }

    combatAnimation = (isPlayer, damage, crit) => {
        let selector = isPlayer ? "#player-sprite" : "#enemy-sprite";
        let battleSprite = document.querySelector(selector);
        if (battleSprite) { // Added error handling
            battleSprite.classList.add("animation-shake");
            setTimeout(() => {
                battleSprite.classList.remove("animation-shake");
            }, 200);
        }

        const dmgContainer = document.querySelector("#dmg-container");
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
        addCombatLog(`You earned ${nFormatter(enemy.rewards.exp)} exp.`);
        playerExpGain();
        addCombatLog(`${enemy.name} dropped <i class="ra ra-gem" style="color: #FFD700;"></i>${nFormatter(enemy.rewards.gold)} gold.`);
        player.gold += enemy.rewards.gold;
        if (enemy.rewards.drop) {
            createEquipmentPrint("combat");
        }
        player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
        playerLoadStats();
        closeBattlePanel();
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
        document.querySelector("#enemy-combat-info").textContent = `${enemy.name} Lv.${enemy.lvl}`;
        document.querySelector("#enemyHpText").innerHTML = `&nbsp${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)}&nbsp(${enemy.stats.hpPercent}%)`;
        document.querySelector("#enemy-sprite").src = `./assets/img/vixen.jpg`;
        document.querySelector("#enemy-sprite").alt = enemy.name;
        document.querySelector("#enemy-sprite").style.width = enemy.image.size + 'px';
        document.querySelector("#player-combat-info").textContent = `Your Player Info Here`;
        document.querySelector("#playerHpText").innerHTML = `&nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)}&nbsp(${player.stats.hpPercent}%)`;
        const playerExpPercentage = ((player.stats.exp / player.stats.expMax) * 100).toFixed(2);
        document.querySelector("#player-exp-bar").style.width = playerExpPercentage + '%';
        document.querySelector("#player-exp-bar").textContent = `EXP: ${nFormatter(player.stats.exp)}/${nFormatter(player.stats.expMax)}`;
    };
}

const combatSystem = new CombatSystem();
const recruitVixen = () => {
    const vixenTypes = ["The Cleric", "The Warrior", "The Mage"];
    const statBonuses = ["atk", "def", "hp", "atkspd", "crate", "cdmg", "vamp", "strength", "energy", "luck"];
    const rarities = ["Common", "Rare", "Epic", "Legendary"];
    const bonusValues = [5, 10, 15, 20]; // Corresponding to the rarity
    const recruitmentCosts = [100, 300, 600, 1200]; // Gold cost for each rarity

    const vixenName = `vixen ${Math.floor(Math.random() * 1000)}`;
    const vixenType = vixenTypes[Math.floor(Math.random() * vixenTypes.length)];
    const rarityIndex = Math.floor(Math.random() * rarities.length);
    const statBonus = statBonuses[Math.floor(Math.random() * statBonuses.length)];
    const bonusValue = bonusValues[rarityIndex];
    const recruitmentCost = recruitmentCosts[rarityIndex];
    const rarity = rarities[rarityIndex];

    if (player.gold >= recruitmentCost) {
        player.gold -= recruitmentCost;
        player.vixens.push({
            name: `${vixenName} ${vixenType}`,
            bonus: `${statBonus}+${bonusValue}%`,
            rarity
        });
        addDungeonLog(`You recruited ${vixenName} ${vixenType} for ${recruitmentCost} gold.`, `
            <div class="stat-panel">
                <p class="${rarity}">${vixenName} ${vixenType} - ${statBonus}+${bonusValue}%</p>
            </div>`);
        playerLoadStats();
        updateVixensDisplay();
    } else {
        addDungeonLog("You do not have enough gold to recruit a vixen.");
    }
};

function removeAllVixens() {
    player.vixens = [];
    console.log("All recruits have been removed.");
    applyEquipmentStats();
    playerLoadStats();
}
function updateMaterialQuantity(material, quantityToAdd) {
    const newQuantity = material.quantity + quantityToAdd;
    if (newQuantity > material.maxStack) {
        addDungeonLogPaused(stackLimitMessage);
        return false;
    }
    material.quantity = newQuantity;
    return true;
}

function addMaterial(materialData) {
    const defaults = { weight: 1, quantity: 1, sellValue: 1, rarity: defaultMaterialRarity, maxStack: 100, icon: defaultMaterialIcon };
    const material = { ...defaults, ...materialData };
    material.icon = materialIconTemplate(material); 

    if (player.currentWeight() + material.weight * material.quantity > player.maxWeight) {
        addDungeonLogPaused(weightLimitMessage);
        return;
    }

    addDungeonLogPaused(quantityAddedMessage(material.name, material.quantity));
    const existingMaterial = player.materials.find(m => m.name === material.name);
    existingMaterial ? updateMaterialQuantity(existingMaterial, material.quantity) : player.materials.push(material);
    showMaterials();
}

function removeMaterial(materialName, quantityToRemove) {
    const index = player.materials.findIndex(material => material.name === materialName);
    if (index === -1) {
        addDungeonLogPaused(materialNotFoundMessage(materialName));
        return;
    }
    const material = player.materials[index];
    if (quantityToRemove >= material.quantity) {
        player.materials.splice(index, 1);
        addDungeonLogPaused(materialRemovedTemplate(materialName));
    } else {
        material.quantity -= quantityToRemove;
        addDungeonLogPaused(quantityToRemoveMessage(materialName, quantityToRemove));
    }
    showMaterials();
}

function showMaterials() {
    const materialsPanel = document.querySelector("#materialsPanel");
    materialsPanel.innerHTML = player.materials.map(material => materialDisplayTemplate(material)).join('');
    
    const clickableMaterials = materialsPanel.querySelectorAll('.clickable-material');
    clickableMaterials.forEach((element, index) => {
        element.addEventListener('click', () => openMaterialModal(player.materials[index], index));
    });
}

function setupMaterialActionButton(text, action, material, container) {
    const button = document.createElement("button");
    button.textContent = text;

    button.onclick = () => {
        if (material && material.quantity > 0) {
            action(material.quantity);
            closeMaterialModal();
        } else {
            addDungeonLogPaused("Invalid quantity or no material selected.");
        }
    };
    container.appendChild(button);
}

function openMaterialModal(material, index) {
    updateModalContent(material);
    setupMaterialActionButtons(material, index);
    const materialModalElement = document.querySelector("#materialModal");
    materialModalElement.style.display = "flex";
}

function updateModalContent(material) {
    document.querySelector("#modalMaterialName").innerHTML = `<img src="${material.icon}" alt="${material.name} Icon" style="width: 32px; height: 32px; vertical-align: middle; margin-top: 0px; margin-right: 10px;">${material.name} (${material.quantity})`;
    document.querySelector("#materialActions").innerHTML = "";
}

function setupMaterialActionButtons(material, index) {
    const container = document.querySelector("#materialActions");
    if (!container) {
        console.error("Failed to find #materialActions container.");
        return;
    }
    
    container.innerHTML = "";

    let materialModal = document.querySelector("#materialModal");
    window.addEventListener('click', function(event) {
        if (event.target == materialModal) {
            closeMaterialModal();
        }
    });
    
    setupMaterialActionButton("Sell", (quantity) => sellMaterial(index, quantity), material, container);
    setupMaterialActionButton("Drop", (quantity) => dropMaterial(index, quantity), material, container);
}

function setupMaterialActionButton(text, action, material, container) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = () => {
        
        const quantityInput = document.querySelector("#materialQuantity");
        const inputQuantity = parseInt(quantityInput.value, 10);
        
        
        if (!isNaN(inputQuantity) && inputQuantity > 0) {
            
            action(inputQuantity);
        } else {
            addDungeonLogPaused("Invalid quantity.");
        }
    };
    container.appendChild(button);
}


function sellMaterial(index, quantityToSell) {
    const material = player.materials[index];
    const sellQuantity = Math.min(quantityToSell, material.quantity);
    
    if (sellQuantity > 0) {
        player.gold += sellQuantity * material.sellValue; 
        material.quantity -= sellQuantity; 
        
        if (material.quantity === 0) {
            player.materials.splice(index, 1);
        }
        
        showMaterials();
        closeMaterialModal(`Sold ${sellQuantity} ${material.name} for ${sellQuantity * material.sellValue} gold.`);
    } else {
        addDungeonLogPaused("Invalid quantity to sell.");
    }
}

function dropMaterial(index, quantityToDrop) {
    const material = player.materials[index];
    const dropQuantity = Math.min(quantityToDrop, material.quantity);
    
    if (dropQuantity > 0) {
        material.quantity -= dropQuantity; 
        
        if (material.quantity === 0) {
            player.materials.splice(index, 1);
        }
        
        showMaterials();
        closeMaterialModal(`Dropped ${dropQuantity} ${material.name}.`);
    } else {
        addDungeonLogPaused("Invalid quantity to drop.");
    }
}

function closeMaterialModal(message = null) {
    const modal = document.querySelector('#materialModal');
    modal.style.display = "none";
    if (message) {
        addDungeonLogPaused(message);
    }
}
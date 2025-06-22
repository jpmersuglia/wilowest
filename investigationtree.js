// Game state variables (loaded from localStorage)
let mainCompanyMoney = 500000;
let totalCompaniesCreated = 0;
let totalMoneyEarned = 500000;
let researchPoints = 0;
let companyResources = {
    petroleo: 0,
    logistica: 0,
    finanzas: 0,
    hierro: 0,
    carbon: 0
};

// --- INVESTIGATION TREE DATA STRUCTURE ---
const investigationTrees = {
    Petroleo: [
        {
            companyType: "Petroleo",
            name: "Perforación Avanzada",
            description: "Aumenta la eficiencia de extracción de petróleo.",
            cost: [100000, 10], // [money, investigation points]
            effect: 5, // 5%
            owned: false
        }
    ],
    Transporte: [
        {
            companyType: "Transporte",
            name: "Rutas Optimizadas",
            description: "Reduce los costos logísticos y mejora la eficiencia.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        }
    ],
    Banco: [
        {
            companyType: "Banco",
            name: "Algoritmos de Riesgo",
            description: "Mejora la rentabilidad de las inversiones bancarias.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        }
    ],
    Metalurgica: [
        {
            companyType: "Metalurgica",
            name: "Fundición Eficiente",
            description: "Incrementa la producción de hierro.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        }
    ],
    Mineria: [
        {
            companyType: "Mineria",
            name: "Explosivos Mejorados",
            description: "Aumenta la extracción de carbón.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        }
    ],
    Telecomunicaciones: [
        {
            companyType: "Telecomunicaciones",
            name: "Fibra Óptica",
            description: "Mejora la velocidad y alcance de las comunicaciones.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        }
    ]
};

// --- LOAD GAME STATE FROM LOCALSTORAGE ---
function loadGameState() {
    const saved = localStorage.getItem('wilowest_game_state');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            mainCompanyMoney = gameState.mainCompanyMoney || 500000;
            totalCompaniesCreated = gameState.totalCompaniesCreated || 0;
            totalMoneyEarned = gameState.totalMoneyEarned || 500000;
            researchPoints = gameState.researchPoints || 0;
            companyResources = gameState.companyResources || {
                petroleo: 0,
                logistica: 0,
                finanzas: 0,
                hierro: 0,
                carbon: 0
            };
            
            // Load investigation tree state if it exists
            if (gameState.investigationTrees) {
                Object.keys(investigationTrees).forEach(type => {
                    if (gameState.investigationTrees[type]) {
                        gameState.investigationTrees[type].forEach((savedItem, index) => {
                            if (investigationTrees[type][index]) {
                                investigationTrees[type][index].owned = savedItem.owned || false;
                            }
                        });
                    }
                });
            }
            
            return true;
        } catch (e) {
            console.error('Error loading game state:', e);
            return false;
        }
    }
    return false;
}

// --- SAVE GAME STATE TO LOCALSTORAGE ---
function saveGameState() {
    // First, get the existing game state to preserve companies data
    const existingState = localStorage.getItem('wilowest_game_state');
    let existingGameState = {};
    
    if (existingState) {
        try {
            existingGameState = JSON.parse(existingState);
        } catch (e) {
            console.error('Error parsing existing game state:', e);
        }
    }
    
    const gameState = {
        mainCompanyMoney,
        totalCompaniesCreated,
        totalMoneyEarned,
        researchPoints,
        companyResources,
        investigationTrees,
        // Preserve companies data from existing state
        companies: existingGameState.companies || []
    };
    localStorage.setItem('wilowest_game_state', JSON.stringify(gameState));
}

// --- UPDATE DISPLAY FUNCTIONS ---
function updateMainDisplay() {
    const mainMoneyElement = document.getElementById('mainCompanyMoney');
    if (mainMoneyElement) {
        mainMoneyElement.innerHTML = `<img src="media/usd-circle.svg" alt="Money" class="resource-icon"> ${mainCompanyMoney.toFixed(2)} <img src="media/sparkles.svg" alt="Research" class="resource-icon"> ${researchPoints}`;
    }
}

function updateStatistics() {
    const totalCompaniesElement = document.getElementById('totalCompanies');
    const totalMoneyElement = document.getElementById('totalMoneyEarned');
    
    if (totalCompaniesElement) {
        totalCompaniesElement.textContent = `Compañías creadas: ${totalCompaniesCreated}`;
    }
    if (totalMoneyElement) {
        totalMoneyElement.textContent = `Dinero total ganado: $${totalMoneyEarned.toFixed(2)}`;
    }
}

function updateResourceDisplay() {
    const resourceContainer = document.getElementById('resourceDisplay');
    if (!resourceContainer) return;

    resourceContainer.innerHTML = '';
    for (const [resource, amount] of Object.entries(companyResources)) {
        if (amount > 0) {
            const resourceElement = document.createElement('p');
            resourceElement.textContent = `${resource.charAt(0).toUpperCase() + resource.slice(1)}: ${amount}`;
            resourceContainer.appendChild(resourceElement);
        }
    }
}

// --- INVESTIGATION TREE UI & LOGIC ---
function renderInvestigationTrees() {
    const container = document.getElementById('investigationTreesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('investigationModal');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.className = 'investigation-modal';
        modalContainer.id = 'investigationModal';
        modalContainer.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon" id="modalIcon"></div>
                    <h3 class="modal-title" id="modalTitle"></h3>
                </div>
                <p class="modal-subtitle" id="modalSubtitle"></p>
                <div class="modal-cost" id="modalCost"></div>
                <div class="modal-effect" id="modalEffect"></div>
                <div class="modal-actions" id="modalActions"></div>
            </div>
        `;
        document.body.appendChild(modalContainer);
    }
    
    Object.entries(investigationTrees).forEach(([type, items]) => {
        const treeDiv = document.createElement('div');
        treeDiv.className = 'investigation-tree';
        
        const title = document.createElement('div');
        title.className = 'investigation-title';
        title.textContent = type;
        treeDiv.appendChild(title);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'investigation-grid';

        items.forEach((item, idx) => {
            const iconDiv = document.createElement('div');
            iconDiv.className = 'investigation-icon';
            
            // Determine color scheme
            if (item.owned) {
                iconDiv.classList.add('green');
            } else if (mainCompanyMoney >= item.cost[0] && researchPoints >= item.cost[1]) {
                iconDiv.classList.add('orange');
            } else {
                iconDiv.classList.add('red');
            }
            
            // Add technology icon
            iconDiv.innerHTML = `<img src="media/technology-icon.svg" alt="Technology">`;
            
            // Add click handler
            iconDiv.addEventListener('click', () => {
                showInvestigationModal(item, type);
            });
            
            gridDiv.appendChild(iconDiv);
        });

        treeDiv.appendChild(gridDiv);
        container.appendChild(treeDiv);
    });
}

function showInvestigationModal(item, type) {
    const modal = document.getElementById('investigationModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalCost = document.getElementById('modalCost');
    const modalEffect = document.getElementById('modalEffect');
    const modalActions = document.getElementById('modalActions');
    
    // Set modal content
    modalTitle.textContent = item.name;
    modalSubtitle.textContent = item.description;
    
    // Set icon with appropriate color
    modalIcon.innerHTML = `<img src="media/technology-icon.svg" alt="Technology">`;
    modalIcon.className = 'modal-icon';
    if (item.owned) {
        modalIcon.classList.add('green');
    } else if (mainCompanyMoney >= item.cost[0] && researchPoints >= item.cost[1]) {
        modalIcon.classList.add('orange');
    } else {
        modalIcon.classList.add('red');
    }
    
    // Set cost
    modalCost.innerHTML = `
        <span class="cost-money">💰 $${item.cost[0].toLocaleString()}</span>
        <span class="cost-ip">🔬 ${item.cost[1]} Puntos de Investigación</span>
    `;
    
    // Set effect
    modalEffect.textContent = `Efecto: Aumenta la producción en ${item.effect}%`;
    
    // Set actions
    if (item.owned) {
        modalActions.innerHTML = `
            <button class="modal-btn owned">Investigado</button>
            <button class="modal-btn cancel" onclick="closeInvestigationModal()">Cerrar</button>
        `;
    } else {
        const canAfford = mainCompanyMoney >= item.cost[0] && researchPoints >= item.cost[1];
        modalActions.innerHTML = `
            <button class="modal-btn cancel" onclick="closeInvestigationModal()">Cancelar</button>
            <button class="modal-btn buy" ${!canAfford ? 'disabled' : ''} onclick="purchaseInvestigation('${type}', ${item.cost[0]}, ${item.cost[1]}, ${item.effect})">Comprar</button>
        `;
    }
    
    // Show modal
    modal.classList.add('active');
}

function closeInvestigationModal() {
    const modal = document.getElementById('investigationModal');
    modal.classList.remove('active');
}

function purchaseInvestigation(type, moneyCost, ipCost, effect) {
    if (mainCompanyMoney >= moneyCost && researchPoints >= ipCost) {
        mainCompanyMoney -= moneyCost;
        researchPoints -= ipCost;
        
        // Find and update the item
        const item = investigationTrees[type].find(item => 
            item.cost[0] === moneyCost && item.cost[1] === ipCost && item.effect === effect
        );
        
        if (item) {
            item.owned = true;
            console.log(`Applied ${item.effect}% effect to ${item.companyType} companies`);
        }
        
        updateMainDisplay();
        saveGameState();
        renderInvestigationTrees();
        closeInvestigationModal();
    }
}

// --- NAVIGATION FUNCTIONS ---
function navigateToCompanies() {
    // Save game state before navigating
    saveGameState();
    window.location.href = 'index.html';
}

// --- RESTART GAME FUNCTIONALITY ---
function resetGameState() {
    if (confirm('¿Estás seguro que deseas reiniciar el juego? ¡Perderás todo tu progreso!')) {
        // Reset all variables
        mainCompanyMoney = 500000;
        totalCompaniesCreated = 0;
        totalMoneyEarned = 500000;
        researchPoints = 0;
        for (const key in companyResources) companyResources[key] = 0;
        
        // Reset investigation trees
        Object.keys(investigationTrees).forEach(type => {
            investigationTrees[type].forEach(item => {
                item.owned = false;
            });
        });
        
        // Clear companies array when resetting
        const gameState = {
            mainCompanyMoney,
            totalCompaniesCreated,
            totalMoneyEarned,
            researchPoints,
            companyResources,
            investigationTrees,
            companies: [] // Clear companies on reset
        };
        localStorage.setItem('wilowest_game_state', JSON.stringify(gameState));
        
        // Update displays
        updateMainDisplay();
        updateStatistics();
        updateResourceDisplay();
        renderInvestigationTrees();
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Load game state
    loadGameState();
    
    // Update displays
    updateMainDisplay();
    updateStatistics();
    updateResourceDisplay();
    
    // Render investigation trees
    renderInvestigationTrees();

    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }

    // Navigation buttons
    const companiesBtn = document.getElementById('companiesBtn');
    if (companiesBtn) {
        companiesBtn.addEventListener('click', navigateToCompanies);
    }

    // Restart button
    const restartBtn = document.getElementById('restartGame');
    if (restartBtn) {
        restartBtn.addEventListener('click', resetGameState);
    }

    // Save button
    const saveBtn = document.getElementById('saveGame');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveGameState();
            // Show a brief confirmation message
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Guardado';
            saveBtn.style.background = '#4caf50';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '#2196f3';
            }, 2000);
        });
    }

    // Modal click outside to close
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('investigationModal');
        if (modal && e.target === modal) {
            closeInvestigationModal();
        }
    });

    // Auto-save every minute
    setInterval(saveGameState, 60000);
}); 
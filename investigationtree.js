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
    const gameState = {
        mainCompanyMoney,
        totalCompaniesCreated,
        totalMoneyEarned,
        researchPoints,
        companyResources,
        investigationTrees
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
    Object.entries(investigationTrees).forEach(([type, items]) => {
        const treeDiv = document.createElement('div');
        treeDiv.className = 'investigation-tree';
        
        const title = document.createElement('div');
        title.className = 'investigation-title';
        title.textContent = type;
        treeDiv.appendChild(title);

        items.forEach((item, idx) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'investigation-item';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'investigation-info';

            const name = document.createElement('div');
            name.className = 'investigation-name';
            name.textContent = item.name;

            const desc = document.createElement('div');
            desc.className = 'investigation-desc';
            desc.textContent = item.description;

            const cost = document.createElement('div');
            cost.className = 'investigation-cost';
            cost.textContent = `Costo: $${item.cost[0].toLocaleString()} + ${item.cost[1]} Puntos de Investigación`;

            const effect = document.createElement('div');
            effect.className = 'investigation-effect';
            effect.textContent = `Efecto: +${item.effect}%`;

            infoDiv.appendChild(name);
            infoDiv.appendChild(desc);
            infoDiv.appendChild(cost);
            infoDiv.appendChild(effect);

            itemDiv.appendChild(infoDiv);

            const btn = document.createElement('button');
            btn.className = 'investigation-btn';
            if (item.owned) {
                btn.textContent = 'Investigado';
                btn.disabled = true;
                btn.classList.add('owned');
            } else {
                btn.textContent = 'Investigar';
                btn.disabled = mainCompanyMoney < item.cost[0] || researchPoints < item.cost[1];
                btn.onclick = () => {
                    if (mainCompanyMoney >= item.cost[0] && researchPoints >= item.cost[1]) {
                        mainCompanyMoney -= item.cost[0];
                        researchPoints -= item.cost[1];
                        item.owned = true;
                        
                        // Apply the effect (you can implement this later)
                        console.log(`Applied ${item.effect}% effect to ${item.companyType} companies`);
                        
                        updateMainDisplay();
                        saveGameState();
                        renderInvestigationTrees();
                    }
                };
            }
            itemDiv.appendChild(btn);

            treeDiv.appendChild(itemDiv);
        });

        container.appendChild(treeDiv);
    });
}

// --- NAVIGATION FUNCTIONS ---
function navigateToCompanies() {
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
        
        // Save reset state
        saveGameState();
        
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

    // Auto-save every minute
    setInterval(saveGameState, 60000);
}); 
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
            id: "1.1.1",
            companyType: "Petroleo",
            name: "Perforación Avanzada",
            description: "Aumenta la eficiencia de extracción de petróleo.",
            cost: [100000, 10], // [money, investigation points]
            effect: 5, // 5%
            owned: false
        },
        {
            id: "1.1.2",
            companyType: "Petroleo",
            name: "Refinamiento Mejorado",
            description: "Optimiza el proceso de refinamiento del petróleo.",
            cost: [150000, 15],
            effect: 7,
            owned: false
        },
        {
            id: "1.2.1",
            companyType: "Petroleo",
            name: "Exploración Submarina",
            description: "Permite extraer petróleo de yacimientos submarinos.",
            cost: [200000, 20],
            effect: 10,
            owned: false
        }
    ],
    Transporte: [
        {
            id: "2.1.1",
            companyType: "Transporte",
            name: "Rutas Optimizadas",
            description: "Reduce los costos logísticos y mejora la eficiencia.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        },
        {
            id: "2.1.2",
            companyType: "Transporte",
            name: "Flota Modernizada",
            description: "Actualiza la flota de vehículos para mayor eficiencia.",
            cost: [180000, 18],
            effect: 8,
            owned: false
        },
        {
            id: "2.2.1",
            companyType: "Transporte",
            name: "Logística Inteligente",
            description: "Implementa sistemas de IA para optimizar rutas.",
            cost: [250000, 25],
            effect: 12,
            owned: false
        }
    ],
    Banco: [
        {
            id: "3.1.1",
            companyType: "Banco",
            name: "Algoritmos de Riesgo",
            description: "Mejora la rentabilidad de las inversiones bancarias.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        },
        {
            id: "3.1.2",
            companyType: "Banco",
            name: "Banca Digital",
            description: "Implementa servicios bancarios digitales avanzados.",
            cost: [160000, 16],
            effect: 7,
            owned: false
        },
        {
            id: "3.2.1",
            companyType: "Banco",
            name: "Inversiones Globales",
            description: "Expande las operaciones a mercados internacionales.",
            cost: [300000, 30],
            effect: 15,
            owned: false
        }
    ],
    Metalurgica: [
        {
            id: "4.1.1",
            companyType: "Metalurgica",
            name: "Fundición Eficiente",
            description: "Incrementa la producción de hierro.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        },
        {
            id: "4.1.2",
            companyType: "Metalurgica",
            name: "Aleaciones Avanzadas",
            description: "Desarrolla nuevas aleaciones de mayor calidad.",
            cost: [170000, 17],
            effect: 8,
            owned: false
        },
        {
            id: "4.2.1",
            companyType: "Metalurgica",
            name: "Automatización Industrial",
            description: "Implementa robots para la producción automatizada.",
            cost: [280000, 28],
            effect: 13,
            owned: false
        }
    ],
    Mineria: [
        {
            id: "5.1.1",
            companyType: "Mineria",
            name: "Explosivos Mejorados",
            description: "Aumenta la extracción de carbón.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        },
        {
            id: "5.1.2",
            companyType: "Mineria",
            name: "Maquinaria Pesada",
            description: "Actualiza la maquinaria de extracción minera.",
            cost: [190000, 19],
            effect: 9,
            owned: false
        },
        {
            id: "5.2.1",
            companyType: "Mineria",
            name: "Exploración Geológica",
            description: "Utiliza tecnología avanzada para encontrar nuevos yacimientos.",
            cost: [320000, 32],
            effect: 16,
            owned: false
        }
    ],
    Telecomunicaciones: [
        {
            id: "6.1.1",
            companyType: "Telecomunicaciones",
            name: "Fibra Óptica",
            description: "Mejora la velocidad y alcance de las comunicaciones.",
            cost: [100000, 10],
            effect: 5,
            owned: false
        },
        {
            id: "6.1.2",
            companyType: "Telecomunicaciones",
            name: "5G Network",
            description: "Implementa tecnología 5G para mayor velocidad.",
            cost: [200000, 20],
            effect: 10,
            owned: false
        },
        {
            id: "6.2.1",
            companyType: "Telecomunicaciones",
            name: "Satélites de Comunicación",
            description: "Lanza satélites para cobertura global.",
            cost: [400000, 40],
            effect: 20,
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
            
            console.log('=== LOADING GAME STATE ===');
            console.log('Game state loaded:', gameState);
            console.log('Purchased investigations found:', gameState.purchasedInvestigations);
            
            // Load purchased investigation IDs
            if (gameState.purchasedInvestigations) {
                console.log('Loading purchased investigations...');
                
                // Reset all investigations to not owned first
                Object.keys(investigationTrees).forEach(type => {
                    investigationTrees[type].forEach(item => {
                        item.owned = false;
                    });
                });
                
                console.log('All investigations reset to not owned');
                
                // Set only the purchased ones to owned
                gameState.purchasedInvestigations.forEach(id => {
                    console.log(`Looking for investigation with ID: ${id}`);
                    let found = false;
                    
                    Object.keys(investigationTrees).forEach(type => {
                        const item = investigationTrees[type].find(item => item.id === id);
                        if (item) {
                            item.owned = true;
                            found = true;
                            console.log(`✓ Found and marked as owned: ${id} (${item.name})`);
                        }
                    });
                    
                    if (!found) {
                        console.log(`✗ Investigation with ID ${id} not found in current tree`);
                    }
                });
                
                console.log('=== FINAL INVESTIGATION STATE ===');
                Object.entries(investigationTrees).forEach(([type, items]) => {
                    const ownedItems = items.filter(item => item.owned);
                    if (ownedItems.length > 0) {
                        console.log(`${type}: ${ownedItems.map(item => `${item.id} (${item.name})`).join(', ')}`);
                    }
                });
            } else {
                console.log('No purchased investigations found in saved state');
            }
            
            return true;
        } catch (e) {
            console.error('Error loading game state:', e);
            return false;
        }
    }
    console.log('No saved game state found');
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
    
    // Collect only the IDs of purchased investigations
    const purchasedInvestigations = [];
    console.log('=== SAVING GAME STATE ===');
    console.log('Checking for owned investigations...');
    
    Object.keys(investigationTrees).forEach(type => {
        investigationTrees[type].forEach(item => {
            if (item.owned) {
                purchasedInvestigations.push(item.id);
                console.log(`✓ Found owned investigation: ${item.id} (${item.name})`);
            }
        });
    });
    
    console.log('Total purchased investigations to save:', purchasedInvestigations);
    
    const gameState = {
        mainCompanyMoney,
        totalCompaniesCreated,
        totalMoneyEarned,
        researchPoints,
        companyResources,
        purchasedInvestigations, // Only save the IDs of purchased technologies
        // Preserve companies data from existing state
        companies: existingGameState.companies || []
    };
    
    console.log('Saving game state:', gameState);
    localStorage.setItem('wilowest_game_state', JSON.stringify(gameState));
    console.log('Game state saved successfully');
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

        // Group items by branch
        const branches = {};
        items.forEach(item => {
            const branchNumber = item.id.split('.')[1];
            if (!branches[branchNumber]) {
                branches[branchNumber] = [];
            }
            branches[branchNumber].push(item);
        });

        // Render each branch
        Object.keys(branches).sort().forEach(branchNumber => {
            const branchDiv = document.createElement('div');
            branchDiv.className = 'investigation-branch';
            
            const branchTitle = document.createElement('div');
            branchTitle.className = 'branch-title';
            branchTitle.textContent = `Rama ${branchNumber}`;
            branchDiv.appendChild(branchTitle);

            const gridDiv = document.createElement('div');
            gridDiv.className = 'investigation-grid';

            // Sort items by technology number
            branches[branchNumber].sort((a, b) => {
                const aTech = parseInt(a.id.split('.')[2]);
                const bTech = parseInt(b.id.split('.')[2]);
                return aTech - bTech;
            });

            branches[branchNumber].forEach((item, idx) => {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'investigation-icon';
                
                // Add ID tooltip
                iconDiv.title = `ID: ${item.id}`;
                
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

            branchDiv.appendChild(gridDiv);
            treeDiv.appendChild(branchDiv);
        });

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
    console.log(`=== PURCHASING INVESTIGATION ===`);
    console.log(`Type: ${type}, Money Cost: ${moneyCost}, IP Cost: ${ipCost}, Effect: ${effect}`);
    console.log(`Current money: ${mainCompanyMoney}, Current research points: ${researchPoints}`);
    
    if (mainCompanyMoney >= moneyCost && researchPoints >= ipCost) {
        mainCompanyMoney -= moneyCost;
        researchPoints -= ipCost;
        
        console.log(`Purchase successful! Money remaining: ${mainCompanyMoney}, Research points remaining: ${researchPoints}`);
        
        // Find and update the item
        const item = investigationTrees[type].find(item => 
            item.cost[0] === moneyCost && item.cost[1] === ipCost && item.effect === effect
        );
        
        if (item) {
            item.owned = true;
            console.log(`✓ Investigation marked as owned: ${item.id} (${item.name})`);
            console.log(`Applied ${item.effect}% effect to ${item.companyType} companies`);
        } else {
            console.log(`✗ Investigation not found in tree!`);
        }
        
        updateMainDisplay();
        saveGameState();
        renderInvestigationTrees();
        closeInvestigationModal();
    } else {
        console.log(`✗ Purchase failed! Insufficient resources`);
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
            purchasedInvestigations: [], // Empty array for no purchased investigations
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
    console.log('=== INVESTIGATION TREE PAGE LOADING ===');
    
    // Load game state
    loadGameState();
    
    // Update displays
    updateMainDisplay();
    updateStatistics();
    updateResourceDisplay();
    
    // Render investigation trees
    renderInvestigationTrees();
    
    console.log('=== FINAL STATE AFTER LOADING ===');
    console.log('Current money:', mainCompanyMoney);
    console.log('Current research points:', researchPoints);
    
    // Show final investigation state
    Object.entries(investigationTrees).forEach(([type, items]) => {
        const ownedItems = items.filter(item => item.owned);
        if (ownedItems.length > 0) {
            console.log(`${type} owned: ${ownedItems.map(item => `${item.id} (${item.name})`).join(', ')}`);
        }
    });
    
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
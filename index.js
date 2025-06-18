// Datos base
let mainCompanyMoney = 500000;
let totalCompaniesCreated = 0;
let totalMoneyEarned = mainCompanyMoney;
let researchPoints = 0; // New variable for research points

// Resource tracking
let companyResources = {
    petroleo: 0,
    logistica: 0,
    finanzas: 0,
    hierro: 0,
    carbon: 0
};

// Resource prices (base price per unit)
const resourcePrices = {
    petroleo: 10.50,
    logistica: 10.50,
    finanzas: 10.50,
    hierro: 10.50,
    carbon: 10.50
};

const companyTypes = {
    Petroleo: {
        resource: "petroleo",
        icon: "Petroleo.svg",
        consumes: ["finanzas", "logistica"]
    },
    Transporte: {
        resource: "logistica",
        icon: "Transporte.svg",
        consumes: []
    },
    Banco: {
        resource: "finanzas",
        icon: "Banco.svg",
        consumes: ["logistica"]
    },
    Metalurgica: {
        resource: "hierro",
        icon: "Metalurgica.svg",
        consumes: []
    },
    Mineria: {
        resource: "carbon",
        icon: "Mineria.svg",
        consumes: []
    },
    Telecomunicaciones: {
        resource: "logistica",
        icon: "Telecomunicaciones.svg",
        consumes: []
    }
};

const companyNames = [
    "Starforge", "Moonveil", "Shadowspire", "Ironcrest", "Duskborn", "Brighthelm", "Frostbane", "Voidglass",
    "Stormhall", "Emberfall", "Bell & Sons", "Harper Brothers", "Smith & Co.", "Carter & Carter",
    "Hawthorne & Sons", "Bennett Brothers", "Morgan & Blake", "Fletcher & Co.", "Thornhill & Partners",
    "Parker & Ward", "Mason & Reed", "Hunter & Gray", "Ashford Collective", "Knox & Taylor", "Vance & Co.",
    "Sterling & Blake", "Hayes Group", "Dalton & Finch", "Rowan Partners", "Carter & Lane", "Hale & Mercer",
    "Sage & Wilder", "Ellis & Vaughn", "Drake & Solis", "Beacon & Ash", "Orion & Co.", "Weston & Fox",
    "Luxe & Haven", "Briar & Knox", "Arrow & Finch", "Stonevale", "Horizon Forge", "Driftwood Collective",
    "Summitworks", "Brightfall Industries", "Ironhaven", "Lunaris Ventures", "Stellar Co.", "Vanguard Studio",
    "Emberline"
];
let companies = []; // Arreglo para almacenar instancias de compañías

// Clase para manejar cada compañía
class Company {
    constructor(boxElement, name, type, tier = 0) {
        this.box = boxElement;
        this.name = name;
        this.type = type;
        this.tier = tier;
        this.value = 0;
        this.counter = 0;
        this.dividendRate = 0;
        this.resource = companyTypes[type].resource;
        this.consumes = companyTypes[type].consumes;
        this.mainCounter = this.box.querySelector('.mainCounter');
        this.valueCounter = this.box.querySelector('.valueCounter');
        this.workButton = this.box.querySelector('.work');
        this.upgradeButton = this.box.querySelector('.upgrade');
        this.mergeButton = this.box.querySelector('.merge');
        this.sellButton = this.box.querySelector('.sell');
        this.dividendSlider = this.box.querySelector('.dividendSlider');
        this.dividendPercentage = this.box.querySelector('.dividendPercentage');

        this.upgrade = {
            currentLevel: 0,
            levels: {
                0: { cost: 100, increment: 0, resource: 0, investigation: 0 },
                1: { cost: 500, increment: 15, resource: 1, investigation: 1 },
                2: { cost: 1000, increment: 20, resource: 2, investigation: 1.5 },
                3: { cost: 10000, increment: 30, resource: 3, investigation: 2 },
                4: { cost: 20000, increment: 40, resource: 4, investigation: 2.5 },
                5: { cost: 25000, increment: 50, resource: 5, investigation: 3 },
                6: { cost: 50000, increment: 55, resource: 6, investigation: 5.5 },
                7: { cost: 100000, increment: 60, resource: 7, investigation: 6 },
                8: { cost: 255000, increment: 75, resource: 8, investigation: 8 },
                9: { cost: 500000, increment: 85, resource: 9, investigation: 10 },
                10: { cost: 1000000, increment: 100, resource: 10, investigation: 11 },
            },
            getNextCost: function() {
                return this.levels[this.currentLevel]?.cost || 100;
            },
            getIncrement: function() {
                return this.levels[this.currentLevel]?.increment || 0;
            },
            getResourceGeneration: function() {
                return this.levels[this.currentLevel]?.resource || 0;
            },
            getInvestigationChance: function() {
                return this.levels[this.currentLevel]?.investigation || 0;
            }
        };
        this.intervalId = null;
        this.bindEvents();
        this.applyUpgrade();
        this.updateDividendDisplay();
        this.updateButtons();
        updateResourceDisplay();
    }

    getTierIncrement() {
        switch(this.tier) {
            case 0:
                return this.upgrade.getIncrement();
            case 1:
                return 125;
            case 2:
                return 175;
            case 3:
                return 220;
            default:
                return 0;
        }
    }

    getInvestigationChance() {
        switch(this.tier) {
            case 0:
                return this.upgrade.getInvestigationChance();
            case 1:
                return 15;
            case 2:
                return 25;
            case 3:
                return 50;
            default:
                return 0;
        }
    }

    calculateResourceIncome() {
        let totalIncome = 0;
        this.consumes.forEach(resource => {
            const available = companyResources[resource];
            if (available > 0) {
                totalIncome += available * resourcePrices[resource];
            }
        });
        return totalIncome;
    }

    bindEvents() {
        this.workButton.addEventListener('click', () => this.incrementCounter());
        this.upgradeButton.addEventListener('click', () => this.handleUpgrade());
        this.mergeButton.addEventListener('click', () => this.handleMerge());
        this.sellButton.addEventListener('click', () => this.confirmSell());
        this.dividendSlider.addEventListener('input', () => this.handleDividendChange());
    }

    updateButtons() {
        // Actualizar botón de mejora
        if (this.tier > 0 || this.upgrade.currentLevel >= 10) {
            this.upgradeButton.style.display = 'none';
        } else {
            this.upgradeButton.style.display = 'block';
            const nextCost = this.upgrade.getNextCost();
            if (this.counter >= nextCost && this.upgrade.currentLevel < 10) {
                this.upgradeButton.innerHTML = 'Mejorar <img src="media/arrow-circle-up.svg" alt="Upgrade" class="upgrade-icon">';
                this.upgradeButton.disabled = false;
            } else {
                this.upgradeButton.innerHTML = 'Mejorar';
                this.upgradeButton.disabled = this.counter < nextCost;
            }
        }
    
        // Actualizar botón de merge
        if (this.tier >= 3) {
            this.mergeButton.style.display = 'none';
        } else if ((this.tier === 0 && this.upgrade.currentLevel >= 10) || this.tier > 0) {
            this.mergeButton.style.display = 'block';
            if (this.canMerge()) {
                this.mergeButton.disabled = false;
                this.mergeButton.classList.add('merge-button');
            } else {
                this.mergeButton.disabled = true;
                this.mergeButton.classList.remove('merge-button');
            }
        } else {
            this.mergeButton.style.display = 'none';
        }
    }

    canMerge() {
        if (this.tier >= 3) return false; // Can't merge if already max tier
        
        // For Tier 0, require all companies to be level 10
        if (this.tier === 0 && this.upgrade.currentLevel < 10) return false;
        
        const sameTypeCompanies = companies.filter(c => 
            c.type === this.type && 
            c.tier === this.tier && 
            c !== this &&
            (this.tier > 0 || c.upgrade.currentLevel >= 10) // Require level 10 only for Tier 0
        );
        
        return sameTypeCompanies.length >= 2; // Need 2 other companies of same type and tier
    }

    incrementCounter() {
        const dividend = this.dividendRate / 100;
        const baseEarnings = 1;
        const resourceIncome = this.calculateResourceIncome();
        const totalEarnings = baseEarnings + resourceIncome;
        const companyEarnings = totalEarnings * (1 - dividend);
        const mainCompanyDividend = totalEarnings * dividend;

        this.counter += companyEarnings;
        this.value += companyEarnings;
        mainCompanyMoney += mainCompanyDividend;
        totalMoneyEarned += mainCompanyDividend;

        // Check for research points generation
        const investigationChance = this.getInvestigationChance();
        if (Math.random() * 100 < investigationChance) {
            researchPoints++;
        }

        this.updateDisplay();
        this.updateButtons();
        updateMainDisplay();
        updateStatistics();
        updateResourceDisplay();
    }

    handleUpgrade() {
        if (this.tier > 0) return; // No upgrades for non-Tier 0 companies

        const nextCost = this.upgrade.getNextCost();
        if (this.counter >= nextCost && this.upgrade.currentLevel < 10) {
            this.counter -= nextCost;
            this.upgrade.currentLevel++;
            
            // Clear existing interval before applying new upgrade
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            this.applyUpgrade();
            this.updateDisplay();
            this.updateButtons();
        }
    }

    handleMerge() {
        if (this.tier >= 3) return; // No merges for Tier 3 companies
        if (this.canMerge()) {
            this.merge();
        }
    }

    merge() {
        // For Tier 0, require all companies to be level 10
        if (this.tier === 0 && this.upgrade.currentLevel < 10) return;
        
        const sameTypeCompanies = companies.filter(c => 
            c.type === this.type && 
            c.tier === this.tier && 
            c !== this &&
            (this.tier > 0 || c.upgrade.currentLevel >= 10) // Require level 10 only for Tier 0
        );

        if (sameTypeCompanies.length < 2) return;

        // Get the first two companies for merging
        const [company1, company2] = sameTypeCompanies.slice(0, 2);

        // Sum up the counters and values
        const totalCounter = this.counter + company1.counter + company2.counter;
        const totalValue = this.value + company1.value + company2.value;

        // Remove the merged companies
        company1.box.remove();
        company2.box.remove();
        companies = companies.filter(c => c !== company1 && c !== company2);

        // Update this company to the next tier
        this.tier++;
        this.counter = totalCounter;
        this.value = totalValue;
        this.upgrade.currentLevel = 0;

        // Update tier badge in the interface
        const tierBadge = this.box.querySelector('.tier-badge');
        if (tierBadge) {
            tierBadge.textContent = `Tier ${this.tier}`;
            tierBadge.setAttribute('data-tier', this.tier);
        }

        // Update box border and company head background
        this.box.setAttribute('data-tier', this.tier);
        const companyHead = this.box.querySelector('.companyHead');
        if (companyHead) {
            companyHead.setAttribute('data-tier', this.tier);
        }

        // Reapply upgrade to get the new tier increment
        this.applyUpgrade();

        // Update display
        this.updateDisplay();
        this.updateButtons();
        updateMainDisplay();
        updateStatistics();
        updateResourceDisplay();
    }

    applyUpgrade() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Determinar el incremento basado en el tier
        let increment = 0;
        if (this.tier === 0) {
            increment = this.upgrade.getIncrement();
        } else if (this.tier === 1) {
            increment = 125;
        } else if (this.tier === 2) {
            increment = 175;
        } else if (this.tier === 3) {
            increment = 220;
        }

        console.log(`Company ${this.name} (Tier ${this.tier}) increment set to: ${increment}`); // Debug log

        if (increment > 0) {
            this.intervalId = setInterval(() => {
                const dividend = this.dividendRate / 100;
                const resourceIncome = this.calculateResourceIncome();
                const totalEarnings = increment + resourceIncome;
                const companyEarnings = totalEarnings * (1 - dividend);
                const mainCompanyDividend = totalEarnings * dividend;

                this.value += companyEarnings;
                this.counter += companyEarnings;
                mainCompanyMoney += mainCompanyDividend;
                totalMoneyEarned += mainCompanyDividend;

                // Check for research points generation
                const investigationChance = this.getInvestigationChance();
                if (Math.random() * 100 < investigationChance) {
                    researchPoints++;
                }

                this.updateDisplay();
                this.updateButtons();
                updateMainDisplay();
                updateStatistics();
                updateResourceDisplay();
            }, 1000);
        }
    }

    handleDividendChange() {
        this.dividendRate = parseInt(this.dividendSlider.value);
        this.updateDividendDisplay();
    }

    updateDividendDisplay() {
        this.dividendPercentage.textContent = `${this.dividendRate}%`;
    }

    confirmSell() {
        if (confirm(`¿Estás seguro que deseas vender ${this.name} por $${this.value.toFixed(2)}?`)) {
            this.sellCompany();
        }
    }

    sellCompany() {
        mainCompanyMoney += this.value;
        totalMoneyEarned += this.value;
        this.box.remove();
        companies = companies.filter(c => c !== this);
        updateMainDisplay();
        updateStatistics();
    }

    updateDisplay() {
        this.mainCounter.textContent = `$ ${this.counter.toFixed(2)}`;
        this.valueCounter.textContent = `$ ${this.value.toFixed(2)}`;
        
        // Update tier badge display
        const tierBadge = this.box.querySelector('.tier-badge');
        if (tierBadge) {
            if (this.tier === 0) {
                tierBadge.textContent = `Nivel ${this.upgrade.currentLevel}`;
            } else {
                tierBadge.textContent = `Tier ${this.tier}`;
            }
            tierBadge.setAttribute('data-tier', this.tier);
        }
    }
}

function updateResourceDisplay() {
    const resourceContainer = document.getElementById('resourceDisplay');
    if (!resourceContainer) return;

    // Reset all resources to 0
    for (const resource in companyResources) {
        companyResources[resource] = 0;
    }

    // Calculate total resources based on company levels
    companies.forEach(company => {
        const resourceGeneration = company.upgrade.getResourceGeneration();
        companyResources[company.resource] += resourceGeneration;
    });

    // Update display
    resourceContainer.innerHTML = '';
    for (const [resource, amount] of Object.entries(companyResources)) {
        if (amount > 0) {
            const resourceElement = document.createElement('p');
            resourceElement.textContent = `${resource.charAt(0).toUpperCase() + resource.slice(1)}: ${amount}`;
            resourceContainer.appendChild(resourceElement);
        }
    }
}

// Crear una nueva compañía
function createCompany() {
    if (mainCompanyMoney < 50000 || companies.length >= 5) return;

    mainCompanyMoney -= 50000;
    const name = companyNames[Math.floor(Math.random() * companyNames.length)];
    const type = Object.keys(companyTypes)[Math.floor(Math.random() * Object.keys(companyTypes).length)];

    const box = document.createElement('div');
    box.className = 'counter-box';
    box.setAttribute('data-tier', '0');
    box.innerHTML = `
        <div class="company-info">
            <div class="companyHead" data-tier="0">
                <div class="companyHead-left">
                    <img src="../media/${companyTypes[type].icon}" class="companyImage">
                    <h2 class="companyName">${name}</h2>
                </div>
                <span class="tier-badge" data-tier="0">Nivel 0</span>
            </div>
            <p class="mainCounter">$ 0.00</p>
        </div>
        <div class="company-actions">
            <button class="work">Trabajar</button>
            <button class="upgrade">Mejorar</button>
            <button class="merge" style="display: none;">Merge</button>
            <button class="sell">Vender</button>
        </div>
        <div class="company-details">
            <p>Company Value: <span class="valueCounter">0.00</span></p>
            <div class="dividendControl">
                Dividendos: <input type="range" min="0" max="100" value="0" class="dividendSlider">
                <span class="dividendPercentage">0%</span>
            </div>
        </div>
    `;

    document.getElementById('app').appendChild(box);
    companies.push(new Company(box, name, type));
    totalCompaniesCreated++;
    updateMainDisplay();
    updateStatistics();
    updateResourceDisplay();
}

function updateStatistics() {
    document.getElementById('totalCompanies').textContent = `Compañías creadas: ${totalCompaniesCreated}`;
    document.getElementById('totalMoneyEarned').textContent = `Dinero total ganado: $${totalMoneyEarned.toFixed(2)}`; // Mostrar con decimales
}

// Actualizar el contador principal
function updateMainDisplay() {
    document.getElementById('mainCompanyMoney').innerHTML = `<img src="../media/usd-circle.svg" alt="Money" class="resource-icon"> ${mainCompanyMoney.toFixed(2)} <img src="../media/sparkles.svg" alt="Research" class="resource-icon"> ${researchPoints}`;
    document.getElementById('createCompany').disabled = mainCompanyMoney < 50000 || companies.length >= 5;
}

// --- RESTART GAME FUNCTIONALITY ---
function resetGameState() {
    // Reset all main variables
    mainCompanyMoney = 500000;
    totalCompaniesCreated = 0;
    totalMoneyEarned = mainCompanyMoney;
    researchPoints = 0;
    for (const key in companyResources) companyResources[key] = 0;
    companies.forEach(company => {
        if (company.intervalId) clearInterval(company.intervalId);
    });
    companies = [];
    // Remove all company boxes
    const app = document.getElementById('app');
    while (app.firstChild) app.removeChild(app.firstChild);
    // Reset UI
    updateMainDisplay();
    updateStatistics();
    updateResourceDisplay();
    // Create initial company
    createCompany();
}

// --- GAME PERSISTENCE FUNCTIONALITY ---
function saveGameState() {
    const gameState = {
        mainCompanyMoney,
        totalCompaniesCreated,
        totalMoneyEarned,
        researchPoints,
        companyResources,
        companies: companies.map(company => ({
            name: company.name,
            type: company.type,
            tier: company.tier,
            value: company.value,
            counter: company.counter,
            dividendRate: company.dividendRate,
            upgradeLevel: company.upgrade.currentLevel
        }))
    };
    localStorage.setItem('wilowest_game_state', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('wilowest_game_state');
    if (!saved) return false;
    try {
        const gameState = JSON.parse(saved);
        mainCompanyMoney = gameState.mainCompanyMoney;
        totalCompaniesCreated = gameState.totalCompaniesCreated;
        totalMoneyEarned = gameState.totalMoneyEarned;
        researchPoints = gameState.researchPoints;
        for (const key in companyResources) companyResources[key] = gameState.companyResources[key] || 0;
        // Remove all company boxes and clear intervals
        companies.forEach(company => {
            if (company.intervalId) clearInterval(company.intervalId);
        });
        companies = [];
        const app = document.getElementById('app');
        while (app.firstChild) app.removeChild(app.firstChild);
        // Restore companies
        gameState.companies.forEach(data => {
            const box = document.createElement('div');
            box.className = 'counter-box';
            box.setAttribute('data-tier', data.tier);
            box.innerHTML = `
                <div class="company-info">
                    <div class="companyHead" data-tier="${data.tier}">
                        <div class="companyHead-left">
                            <img src="../media/${companyTypes[data.type].icon}" class="companyImage">
                            <h2 class="companyName">${data.name}</h2>
                        </div>
                        <span class="tier-badge" data-tier="${data.tier}">${data.tier === 0 ? `Nivel ${data.upgradeLevel}` : `Tier ${data.tier}`}</span>
                    </div>
                    <p class="mainCounter">$ 0.00</p>
                </div>
                <div class="company-actions">
                    <button class="work">Trabajar</button>
                    <button class="upgrade">Mejorar</button>
                    <button class="merge" style="display: none;">Merge</button>
                    <button class="sell">Vender</button>
                </div>
                <div class="company-details">
                    <p>Company Value: <span class="valueCounter">0.00</span></p>
                    <div class="dividendControl">
                        Dividendos: <input type="range" min="0" max="100" value="0" class="dividendSlider">
                        <span class="dividendPercentage">0%</span>
                    </div>
                </div>
            `;
            document.getElementById('app').appendChild(box);
            const company = new Company(box, data.name, data.type, data.tier);
            company.value = data.value;
            company.counter = data.counter;
            company.dividendRate = data.dividendRate;
            company.upgrade.currentLevel = data.upgradeLevel;
            company.updateDisplay();
            company.updateButtons();
            company.dividendSlider.value = data.dividendRate;
            company.updateDividendDisplay();
            company.applyUpgrade();
            companies.push(company);
        });
        updateMainDisplay();
        updateStatistics();
        updateResourceDisplay();
        return true;
    } catch (e) {
        console.error('Error loading game state:', e);
        return false;
    }
}

// --- AUTO-SAVE EVERY 1 MINUTE ---
setInterval(saveGameState, 60000);

// --- LOAD GAME ON STARTUP ---
document.addEventListener('DOMContentLoaded', () => {
    const createCompanyButton = document.getElementById('createCompany');
    createCompanyButton.addEventListener('click', createCompany);

    // Load game state if available
    if (!loadGameState()) {
        // Create initial company only if there are no companies
        if (companies.length === 0) {
            createCompany();
        }
    }

    updateMainDisplay();
    updateStatistics();

    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    // Add restart button event
    const restartBtn = document.getElementById('restartGame');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro que deseas reiniciar el juego? ¡Perderás todo tu progreso!')) {
                resetGameState();
            }
        });
    }
});
// Datos base
let mainCompanyMoney = 500000;
let totalCompaniesCreated = 0;
let totalMoneyEarned = mainCompanyMoney;

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
    constructor(boxElement, name, type) {
        this.box = boxElement;
        this.name = name;
        this.type = type;
        this.value = 0;
        this.counter = 0;
        this.dividendRate = 0;
        this.resource = companyTypes[type].resource;
        this.consumes = companyTypes[type].consumes;
        this.mainCounter = this.box.querySelector('.mainCounter');
        this.valueCounter = this.box.querySelector('.valueCounter');
        this.workButton = this.box.querySelector('.work');
        this.upgradeButton = this.box.querySelector('.upgrade');
        this.sellButton = this.box.querySelector('.sell');
        this.dividendSlider = this.box.querySelector('.dividendSlider');
        this.dividendPercentage = this.box.querySelector('.dividendPercentage');

        this.upgrade = {
            currentLevel: 0,
            levels: {
                0: { cost: 100, increment: 0, resource: 0 },
                1: { cost: 500, increment: 15, resource: 1 },
                2: { cost: 1000, increment: 45, resource: 2 },
                3: { cost: 10000, increment: 40, resource: 3 },
                4: { cost: 20000, increment: 50, resource: 4 },
                5: { cost: 25000, increment: 45, resource: 5 },
                6: { cost: 50000, increment: 60, resource: 6 },
                7: { cost: 100000, increment: 50, resource: 7 },
                8: { cost: 255000, increment: 40, resource: 8 },
                9: { cost: 500000, increment: 60, resource: 9 },
                10: { cost: 1000000, increment: 50, resource: 10 },
            },
            getNextCost: function() {
                return this.levels[this.currentLevel]?.cost || 100;
            },
            getIncrement: function() {
                return this.levels[this.currentLevel]?.increment || 0;
            },
            getResourceGeneration: function() {
                return this.levels[this.currentLevel]?.resource || 0;
            }
        };
        this.intervalId = null;
        this.bindEvents();
        this.applyUpgrade();
        this.updateDividendDisplay();
        this.updateUpgradeButton();
        updateResourceDisplay();
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
        this.sellButton.addEventListener('click', () => this.confirmSell());
        this.dividendSlider.addEventListener('input', () => this.handleDividendChange());
    }

    updateUpgradeButton() {
        const nextCost = this.upgrade.getNextCost();
        if (this.upgrade.currentLevel >= 10) {
            this.upgradeButton.innerHTML = 'Nivel Máximo';
            this.upgradeButton.disabled = true;
        } else if (this.counter >= nextCost) {
            this.upgradeButton.innerHTML = 'Mejorar <img src="media/arrow-circle-up.svg" alt="Upgrade" class="upgrade-icon">';
            this.upgradeButton.disabled = false;
        } else {
            this.upgradeButton.innerHTML = 'Mejorar';
            this.upgradeButton.disabled = false;
        }
    }

    incrementCounter() {
        const dividend = this.dividendRate / 100;
        const companyEarnings = 1 * (1 - dividend);
        const mainCompanyDividend = 1 * dividend;

        this.counter += companyEarnings;
        this.value += companyEarnings;
        mainCompanyMoney += mainCompanyDividend;
        totalMoneyEarned += mainCompanyDividend;

        this.updateDisplay();
        this.updateUpgradeButton();
        updateMainDisplay();
        updateStatistics();
        updateResourceDisplay();
    }

    handleUpgrade() {
        const nextCost = this.upgrade.getNextCost();
        if (this.counter >= nextCost && this.upgrade.currentLevel < 10) {
            this.counter -= nextCost;
            this.upgrade.currentLevel++;
            this.applyUpgrade();
            this.updateDisplay();
            this.updateUpgradeButton();
        }
    }

    applyUpgrade() {
        const increment = this.upgrade.getIncrement();
        if (increment > 0 && !this.intervalId) {
            this.intervalId = setInterval(() => {
                const dividend = this.dividendRate / 100;
                const companyEarnings = increment * (1 - dividend);
                const mainCompanyDividend = increment * dividend;
                const resourceIncome = this.calculateResourceIncome();

                this.value += companyEarnings + resourceIncome;
                this.counter += companyEarnings + resourceIncome;
                mainCompanyMoney += mainCompanyDividend;
                totalMoneyEarned += mainCompanyDividend;

                this.updateDisplay();
                this.updateUpgradeButton();
                updateMainDisplay();
                updateStatistics();
                updateResourceDisplay();
            }, 1000);
        } else if (increment === 0 && this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
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
        this.mainCounter.textContent = `$ ${this.counter.toFixed(2)}`; // Mostrar con decimales si es necesario
        this.valueCounter.textContent = `$ ${this.value.toFixed(2)}`;   // Mostrar con decimales si es necesario
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
    box.innerHTML = `
        <div class="company-info">
            <div class="companyHead">
                <img src="../media/${companyTypes[type].icon}" class="companyImage">
                <h2 class="companyName">${name}</h2>
            </div>
            <p class="mainCounter">$ 0.00</p>
        </div>
        <div class="company-actions">
            <button class="work">Trabajar</button>
            <button class="upgrade">Mejorar</button>
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
    document.getElementById('mainCompanyMoney').textContent = `Dinero: $${mainCompanyMoney.toFixed(2)}`; // Mostrar con decimales
    document.getElementById('createCompany').disabled = mainCompanyMoney < 50000 || companies.length >= 5;
}

// Inicializar la primera compañía
document.addEventListener('DOMContentLoaded', () => {
    const createCompanyButton = document.getElementById('createCompany');
    createCompanyButton.addEventListener('click', createCompany);

    // Create initial company
    createCompany();

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
});
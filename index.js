// Datos base
let mainCompanyMoney = 50000;
let totalCompaniesCreated = 1;
let totalMoneyEarned = mainCompanyMoney;

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
const companyTypes = ["Petroleo", "Transporte", "Banco", "Metalurgica", "Carbon", "Telecomunicaciones"];
let companies = []; // Arreglo para almacenar instancias de compañías

// Clase para manejar cada compañía
class Company {
    constructor(boxElement, name, type) {
        this.box = boxElement;
        this.name = name;
        this.type = type;
        this.value = 0;
        this.counter = 0;
        this.dividendRate = 0; // Inicialmente 0% de dividendos
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
                0: { cost: 100, increment: 0 },
                1: { cost: 500, increment: 15 },
                2: { cost: 1000, increment: 45 },
                3: { cost: 10000, increment: 40 },
                4: { cost: 20000, increment: 50 },
                5: { cost: 25000, increment: 45 },
                6: { cost: 50000, increment: 60 },
                7: { cost: 100000, increment: 50 },
                8: { cost: 255000, increment: 40 },
                9: { cost: 500000, increment: 60 },
                10: { cost: 1000000, increment: 50 },
            },
            getNextCost: function() {
                return this.levels[this.currentLevel]?.cost || 100;
            },
            getIncrement: function() {
                return this.levels[this.currentLevel]?.increment || 0;
            },
        };
        this.intervalId = null;
        this.bindEvents();
        this.applyUpgrade();
        this.updateDividendDisplay(); // Inicializar el display del dividendo
    }

    bindEvents() {
        this.workButton.addEventListener('click', () => this.incrementCounter());
        this.upgradeButton.addEventListener('click', () => this.handleUpgrade());
        this.sellButton.addEventListener('click', () => this.sellCompany());
        this.dividendSlider.addEventListener('input', () => this.handleDividendChange());
    }

    incrementCounter() {
        const dividend = this.dividendRate / 100;
        const companyEarnings = 1 * (1 - dividend); // Cada "trabajo" genera 1 unidad de valor
        const mainCompanyDividend = 1 * dividend;

        this.counter += companyEarnings;
        this.value += companyEarnings;
        mainCompanyMoney += mainCompanyDividend;
        totalMoneyEarned += mainCompanyDividend;

        this.updateDisplay();
        updateMainDisplay();
        updateStatistics();
    }

    handleUpgrade() {
        const nextCost = this.upgrade.getNextCost();
        if (this.counter >= nextCost) {
            this.counter -= nextCost;
            this.upgrade.currentLevel++;
            this.applyUpgrade();
            this.updateDisplay();
        }
    }

    applyUpgrade() {
        const increment = this.upgrade.getIncrement();
        if (increment > 0 && !this.intervalId) {
            this.intervalId = setInterval(() => {
                const dividend = this.dividendRate / 100;
                const companyEarnings = increment * (1 - dividend);
                const mainCompanyDividend = increment * dividend;

                this.value += companyEarnings;
                this.counter += companyEarnings;
                mainCompanyMoney += mainCompanyDividend;
                totalMoneyEarned += mainCompanyDividend;

                this.updateDisplay();
                updateMainDisplay();
                updateStatistics();
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

// Crear una nueva compañía
function createCompany() {
    if (mainCompanyMoney < 50000 || companies.length >= 5) return;

    mainCompanyMoney -= 50000;
    const name = companyNames[Math.floor(Math.random() * companyNames.length)];
    const type = companyTypes[Math.floor(Math.random() * companyTypes.length)];

    const box = document.createElement('div');
    box.className = 'counter-box';
    box.innerHTML = `
        <div class="company-info">
            <div class="companyHead">
                <img src="${type}.svg" class="companyImage">
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
});
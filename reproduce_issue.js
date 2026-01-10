
// Mock dependencies
const companyTypes = {
    Transporte: {
        resource: "logistica",
        consumes: []
    }
};

const resourcePrices = {
    logistica: 10.50
};

let companyResources = {
    logistica: 0
};

let hiredOfficials = [];

// Mock localStorage with the specific upgrade
global.localStorage = {
    getItem: (key) => {
        if (key === 'wilowest_game_state') {
            return JSON.stringify({
                purchasedInvestigations: ["2.1.1"] // Rutas Optimizadas (Transporte Effect 5%)
            });
        }
        return null;
    }
};

// Functions from index.js
function getInvestigationBonus(companyType) {
    let totalBonus = 0;
    const saved = localStorage.getItem('wilowest_game_state');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            const purchasedInvestigations = gameState.purchasedInvestigations || [];

            const companyTypeMap = {
                'Petroleo': '1',
                'Transporte': '2',
                'Banco': '3',
                'Metalurgica': '4',
                'Mineria': '5',
                'Telecomunicaciones': '6'
            };

            const companyNumber = companyTypeMap[companyType];
            if (companyNumber) {
                purchasedInvestigations.forEach(id => {
                    if (id.startsWith(companyNumber + '.')) {
                        const investigationData = getInvestigationDataById(id);
                        if (investigationData) {
                            totalBonus += investigationData.effect;
                            console.log(`Applied ${investigationData.effect}% bonus from ${investigationData.name} (${id})`);
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Error:', e);
        }
    }
    return totalBonus;
}

function getInvestigationDataById(id) {
    const investigationTrees = {
        Transporte: [
            { id: "2.1.1", name: "Rutas Optimizadas", effect: 5 }
        ]
    };

    for (const [companyType, investigations] of Object.entries(investigationTrees)) {
        const investigation = investigations.find(inv => inv.id === id);
        if (investigation) {
            return investigation;
        }
    }
    return null;
}

// Simulated Company logic
class Company {
    constructor(name, type, tier = 0) {
        this.name = name;
        this.type = type;
        this.tier = tier;
        this.upgrade = {
            currentLevel: 0,
            levels: {
                0: { cost: 100, increment: 0 },
                1: { cost: 500, increment: 15 }
            },
            getIncrement: function () {
                return this.levels[this.currentLevel]?.increment || 0;
            }
        };
    }

    getTierIncrement() {
        if (this.tier === 0) return this.upgrade.getIncrement();
        return 0; // Simplified
    }

    calculateOfficialBonus() { return 0; }
    calculateResourceIncome() { return 0; }

    // Logic from applyUpgrade's interval
    simulatePassiveInterval() {
        let increment = 0;
        if (this.tier === 0) {
            increment = this.upgrade.getIncrement();
        }

        console.log(`\n--- Simulating Passive Interval for ${this.name} (Level ${this.upgrade.currentLevel}) ---`);
        console.log(`Base Increment: ${increment}`);

        const investigationBonus = getInvestigationBonus(this.type);
        console.log(`Investigation Bonus %: ${investigationBonus}`);

        const bonusAmount = (increment * investigationBonus) / 100;
        console.log(`Bonus Amount: ${bonusAmount}`);

        const totalEarnings = increment + bonusAmount; // + resourceIncome + officialBonusAmount
        console.log(`Total Earnings: ${totalEarnings}`);

        return totalEarnings;
    }

    // Logic from incrementCounter
    simulateManualClick() {
        console.log(`\n--- Simulating Manual Click for ${this.name} (Level ${this.upgrade.currentLevel}) ---`);
        const baseEarnings = 1;
        const baseIncrement = this.getTierIncrement();
        console.log(`Base Earnings: ${baseEarnings}`);
        console.log(`Base Increment (for bonus calc): ${baseIncrement}`);

        const investigationBonus = getInvestigationBonus(this.type);
        console.log(`Investigation Bonus %: ${investigationBonus}`);

        const bonusAmount = (baseIncrement * investigationBonus) / 100;
        console.log(`Bonus Amount: ${bonusAmount}`);

        const totalEarnings = baseEarnings + bonusAmount;
        console.log(`Total Earnings: ${totalEarnings}`);

        return totalEarnings;
    }
}

// Test Run
const c = new Company("TransportCorp", "Transporte");

// Case 1: Level 0
c.upgrade.currentLevel = 0;
c.simulatePassiveInterval();
c.simulateManualClick();

// Case 2: Level 1
c.upgrade.currentLevel = 1;
c.simulatePassiveInterval();
c.simulateManualClick();

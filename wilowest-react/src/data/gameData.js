// Resource prices (base price per unit)
export const resourcePrices = {
    petroleo: 10.50,
    logistica: 10.50,
    finanzas: 10.50,
    hierro: 10.50,
    carbon: 10.50
};

export const companyTypes = {
    Petroleo: {
        resource: "petroleo",
        icon: "Petroleo.svg",
        consumes: ["finanzas", "logistica"],
        cost: 60000
    },
    Transporte: {
        resource: "logistica",
        icon: "Transporte.svg",
        consumes: [],
        cost: 55000
    },
    Banco: {
        resource: "finanzas",
        icon: "Banco.svg",
        consumes: ["logistica"],
        cost: 70000
    },
    Metalurgica: {
        resource: "hierro",
        icon: "Metalurgica.svg",
        consumes: [],
        cost: 80000
    },
    Mineria: {
        resource: "carbon",
        icon: "Mineria.svg",
        consumes: [],
        cost: 90000
    },
    Telecomunicaciones: {
        resource: "logistica",
        icon: "Telecomunicaciones.svg",
        consumes: [],
        cost: 75000
    }
};

export const companyNames = [
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

// Investigation tree data structure
export const investigationTrees = {
    Petroleo: [
        { id: "1.1.1", name: "Perforación Avanzada", effect: 5 },
        { id: "1.1.2", name: "Refinamiento Mejorado", effect: 7 },
        { id: "1.2.1", name: "Exploración Submarina", effect: 10 }
    ],
    Transporte: [
        { id: "2.1.1", name: "Rutas Optimizadas", effect: 5 },
        { id: "2.1.2", name: "Flota Modernizada", effect: 8 },
        { id: "2.2.1", name: "Logística Inteligente", effect: 12 }
    ],
    Banco: [
        { id: "3.1.1", name: "Algoritmos de Riesgo", effect: 5 },
        { id: "3.1.2", name: "Banca Digital", effect: 7 },
        { id: "3.2.1", name: "Inversiones Globales", effect: 15 }
    ],
    Metalurgica: [
        { id: "4.1.1", name: "Fundición Eficiente", effect: 5 },
        { id: "4.1.2", name: "Aleaciones Avanzadas", effect: 8 },
        { id: "4.2.1", name: "Automatización Industrial", effect: 13 }
    ],
    Mineria: [
        { id: "5.1.1", name: "Explosivos Mejorados", effect: 5 },
        { id: "5.1.2", name: "Maquinaria Pesada", effect: 9 },
        { id: "5.2.1", name: "Exploración Geológica", effect: 16 }
    ],
    Telecomunicaciones: [
        { id: "6.1.1", name: "Fibra Óptica", effect: 5 },
        { id: "6.1.2", name: "5G Network", effect: 10 },
        { id: "6.2.1", name: "Satélites de Comunicación", effect: 20 }
    ]
};

// Company type to investigation ID mapping
export const companyTypeMap = {
    'Petroleo': '1',
    'Transporte': '2', 
    'Banco': '3',
    'Metalurgica': '4',
    'Mineria': '5',
    'Telecomunicaciones': '6'
};

// Helper function to get investigation data by ID
export function getInvestigationDataById(id) {
    for (const [, investigations] of Object.entries(investigationTrees)) {
        const investigation = investigations.find(inv => inv.id === id);
        if (investigation) {
            return investigation;
        }
    }
    return null;
}

// Helper function to calculate investigation bonus
export function getInvestigationBonus(companyType, purchasedInvestigations) {
    let totalBonus = 0;
    
    const companyNumber = companyTypeMap[companyType];
    if (companyNumber) {
        purchasedInvestigations.forEach(id => {
            if (id.startsWith(companyNumber + '.')) {
                const investigationData = getInvestigationDataById(id);
                if (investigationData) {
                    totalBonus += investigationData.effect;
                }
            }
        });
    }
    
    return totalBonus;
} 
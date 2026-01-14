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
        idPrefix: "1",
        resource: "petroleo",
        icon: "Petroleo.svg",
        consumes: ["finanzas", "logistica"],
        cost: 60000
    },
    Transporte: {
        idPrefix: "2",
        resource: "logistica",
        icon: "Transporte.svg",
        consumes: ["finanzas", "telecom"],
        cost: 55000
    },
    Banco: {
        idPrefix: "3",
        resource: "finanzas",
        icon: "Banco.svg",
        consumes: ["logistica", "telecom"],
        cost: 70000
    },
    Metalurgica: {
        idPrefix: "4",
        resource: "hierro",
        icon: "Metalurgica.svg",
        consumes: ["finanzas", "logistica"],
        cost: 80000
    },
    Mineria: {
        idPrefix: "5",
        resource: "carbon",
        icon: "Mineria.svg",
        consumes: ["finanzas", "logistica"],
        cost: 90000
    },
    Telecomunicaciones: {
        idPrefix: "6",
        resource: "telecom",
        icon: "Telecomunicaciones.svg",
        consumes: ["finanzas", "logistica"],
        cost: 75000
    },
    DummyCompany: {
        idPrefix: "7",
        resource: "dummy",
        icon: "Banco2.svg",
        consumes: ["finanzas", "logistica"],
        cost: 70
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
    "Emberline", "Nightreach", "Goldspire", "Ashenfall", "Silverwake", "Blackstone Forge", "Sunward", "Grimholt",
    "Aurora Crest", "Frostmere", "Cinderhall", "Obsidian Vale", "Skyreach Industries", "Ravenmark",
    "Dawnforge", "Ironwind", "Starfall Collective", "Whitmore & Sons", "Langley Brothers", "Crowe & Finch", "Redwood & Co.", "Marshall & Keene",
    "Blake & Holloway", "Turner & Shaw", "Everett & Moore", "Caldwell & Price", "Harrison & Wolfe",
    "North & Calder", "Milton & Reeves", "Quinn & Harper", "Lowell & Stone", "Baker & Frost",
    "Atlas Group", "Northstar Ventures", "Crownfall Industries", "Highland Collective",
    "Ironpeak Holdings", "Emberstone", "Silverline Ventures", "Trueforge", "Nova Harbor",
    "Kingsway Studio"
];

// HR Constants
export const firstNames = [
    "Alejandro", "María", "Carlos", "Ana", "Luis", "Carmen", "Javier", "Isabel", "Miguel", "Patricia",
    "Roberto", "Laura", "Fernando", "Sofia", "Diego", "Valentina", "Ricardo", "Camila", "Andrés", "Daniela",
    "Eduardo", "Gabriela", "Francisco", "Natalia", "Manuel", "Andrea", "José", "Paula", "David", "Mariana",
    "Juan", "Carolina", "Pedro", "Lucía", "Antonio", "Valeria", "Rafael", "Adriana", "Alberto", "Claudia",
    "Sergio", "Monica", "Héctor", "Verónica", "Raúl", "Elena", "Oscar", "Rosa", "Victor", "Teresa"
];

export const lastNames = [
    "García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores",
    "Rivera", "Morales", "Castro", "Ortiz", "Silva", "Cruz", "Reyes", "Moreno", "Jiménez", "Díaz",
    "Romero", "Herrera", "Ruiz", "Vargas", "Mendoza", "Aguilar", "Ramos", "Medina", "Vega", "Castro",
    "Fernández", "Gutiérrez", "Cortez", "Soto", "Rojas", "Contreras", "Salazar", "Miranda", "Luna", "Pacheco",
    "Campos", "Vázquez", "Cervantes", "Molina", "Herrera", "Ramos", "Acosta", "Padilla", "Ríos", "Sierra"
];

export const roles = ["CEO", "CFO", "COO", "CTO", "CMO", "CHRO", "CLO", "CRO"];
export const specializations = Object.keys(companyTypes);
export const statsList = ["Operativo", "Financiero", "Logístico", "Marketing", "Tecnológico", "Estratégico"];

// Helper to generate a new official
export const generateOfficial = (forceSpecialization = null) => {
    const id = Math.random().toString(36).substr(2, 9);
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const specialization = forceSpecialization || specializations[Math.floor(Math.random() * specializations.length)];

    // Generate stats
    const stats = {};
    const standoutStat = statsList[Math.floor(Math.random() * statsList.length)];

    statsList.forEach(stat => {
        if (stat === standoutStat) {
            stats[stat] = Math.floor(Math.random() * 5) + 8; // 8-12
        } else {
            stats[stat] = Math.floor(Math.random() * 4) + 3; // 3-6
        }
    });

    const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);

    return {
        id,
        name: `${firstName} ${lastName}`,
        avatar: "human-avatar.svg",
        role,
        specialization,
        stats,
        totalStats,
        workingIn: null,
        trainingUntil: null
    };
};

// Investigation tree data structure
export const investigationTrees = {
    Petroleo: [
        { id: "1.1.1", name: "Perforación Avanzada", effect: 5, cost: [10000, 100] },
        { id: "1.1.2", name: "Refinamiento Mejorado", effect: 7, cost: [25000, 250] },
        { id: "1.2.1", name: "Exploración Submarina", effect: 10, cost: [100000, 1000] }
    ],
    Transporte: [
        { id: "2.1.1", name: "Rutas Optimizadas", effect: 5, cost: [8000, 80] },
        { id: "2.1.2", name: "Flota Modernizada", effect: 8, cost: [20000, 200] },
        { id: "2.2.1", name: "Logística Inteligente", effect: 12, cost: [85000, 850] }
    ],
    Banco: [
        { id: "3.1.1", name: "Algoritmos de Riesgo", effect: 5, cost: [15000, 150] },
        { id: "3.1.2", name: "Banca Digital", effect: 7, cost: [35000, 350] },
        { id: "3.2.1", name: "Inversiones Globales", effect: 15, cost: [150000, 1500] }
    ],
    Metalurgica: [
        { id: "4.1.1", name: "Fundición Eficiente", effect: 5, cost: [12000, 120] },
        { id: "4.1.2", name: "Aleaciones Avanzadas", effect: 8, cost: [30000, 300] },
        { id: "4.2.1", name: "Automatización Industrial", effect: 13, cost: [120000, 1200] }
    ],
    Mineria: [
        { id: "5.1.1", name: "Explosivos Mejorados", effect: 5, cost: [14000, 140] },
        { id: "5.1.2", name: "Maquinaria Pesada", effect: 9, cost: [40000, 400] },
        { id: "5.2.1", name: "Exploración Geológica", effect: 16, cost: [180000, 1800] }
    ],
    Telecomunicaciones: [
        { id: "6.1.1", name: "Fibra Óptica", effect: 5, cost: [18000, 180] },
        { id: "6.1.2", name: "5G Network", effect: 10, cost: [50000, 500] },
        { id: "6.2.1", name: "Satélites de Comunicación", effect: 20, cost: [250000, 2500] }
    ],
    DummyCompany: [
        { id: "7.1.1", name: "Test1", effect: 5, cost: [1000, 180] },
        { id: "7.1.2", name: "Test2", effect: 10, cost: [5000, 500] },
        { id: "7.2.1", name: "Test3", effect: 20, cost: [2000, 200] }
    ]
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

    const companyInfo = companyTypes[companyType];
    const idPrefix = companyInfo?.idPrefix;

    if (idPrefix) {
        purchasedInvestigations.forEach(id => {
            if (id.startsWith(idPrefix + '.')) {
                const investigationData = getInvestigationDataById(id);
                if (investigationData) {
                    totalBonus += investigationData.effect;
                }
            }
        });
    }

    return totalBonus;
}

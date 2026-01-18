// Resource prices (base price per unit)
export const resourcePrices = {
    oil: 11.50,
    logistics: 1.50,
    finance: 1.50,
    metal: 1.50,
    ores: 1.50,
    telecom: 1.50,
    fuel: 5
};

export const companyTypes = {
    Petroleo: {
        idPrefix: "1",
        resource: "oil",
        icon: "Petroleo.svg",
        consumes: ["finance", "logistics"],
        cost: 60000
    },
    Transporte: {
        idPrefix: "2",
        resource: "logistics",
        icon: "Transporte.svg",
        consumes: ["finance", "telecom", "fuel"],
        cost: 55000
    },
    Banco: {
        idPrefix: "3",
        resource: "finance",
        icon: "Banco.svg",
        consumes: ["logistics", "telecom"],
        cost: 70000
    },
    Metalurgica: {
        idPrefix: "4",
        resource: "metal",
        icon: "Metalurgica.svg",
        consumes: ["finance", "logistics"],
        cost: 80000
    },
    Mineria: {
        idPrefix: "5",
        resource: "ores",
        icon: "Mineria.svg",
        consumes: ["finance", "logistics"],
        cost: 90000
    },
    Telecomunicaciones: {
        idPrefix: "6",
        resource: "telecom",
        icon: "Telecomunicaciones.svg",
        consumes: ["finance", "logistics"],
        cost: 75000
    },
    Refineria: {
        idPrefix: "7",
        resource: "fuel",
        icon: "Refineria.svg",
        consumes: ["finance", "logistics", "oil"],
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
        { id: "1.1.1", name: "Perforación Avanzada", effect: 5, cost: [10000, 100], description: "Nuevas aleaciones en las cabezas de taladro permiten penetrar roca más dura y alcanzar yacimientos más profundos." },
        { id: "1.1.2", name: "Refinamiento Mejorado", effect: 7, cost: [25000, 250], description: "Procesos químicos optimizados para separar impurezas, aumentando el rendimiento de barriles refinados." },
        { id: "1.2.1", name: "Exploración Submarina", effect: 10, cost: [100000, 1000], description: "Tecnología de sonar y plataformas flotantes para extraer crudo del lecho marino." }
    ],
    Transporte: [
        { id: "2.1.1", name: "Rutas Optimizadas", effect: 5, cost: [8000, 80], description: "Software de IA para calcular las rutas más eficientes, reduciendo consumo de combustible y tiempo." },
        { id: "2.1.2", name: "Flota Modernizada", effect: 8, cost: [20000, 200], description: "Vehículos con motores híbridos y aerodinámica mejorada para mayor capacidad de carga." },
        { id: "2.2.1", name: "Logística Inteligente", effect: 12, cost: [85000, 850], description: "Sistemas de seguimiento en tiempo real y gestión automatizada de inventarios." }
    ],
    Banco: [
        { id: "3.1.1", name: "Algoritmos de Riesgo", effect: 5, cost: [15000, 150], description: "Modelos predictivos que minimizan préstamos fallidos y maximizan el retorno de inversión." },
        { id: "3.1.2", name: "Banca Digital", effect: 7, cost: [35000, 350], description: "Plataforma online robusta que reduce costos operativos y atrae a más clientes tech-savvy." },
        { id: "3.2.1", name: "Inversiones Globales", effect: 15, cost: [150000, 1500], description: "Acceso a mercados internacionales y divisas extranjeras para diversificar el portafolio." }
    ],
    Metalurgica: [
        { id: "4.1.1", name: "Fundición Eficiente", effect: 5, cost: [12000, 120], description: "Hornos de arco eléctrico de nueva generación que reducen el consumo energético." },
        { id: "4.1.2", name: "Aleaciones Avanzadas", effect: 8, cost: [30000, 300], description: "Nuevas combinaciones de metales que crean productos más ligeros, resistentes y valiosos." },
        { id: "4.2.1", name: "Automatización Industrial", effect: 13, cost: [120000, 1200], description: "Robots y cintas transportadoras autónomas para una línea de producción sin pausas." }
    ],
    Mineria: [
        { id: "5.1.1", name: "Explosivos Mejorados", effect: 5, cost: [14000, 140], description: "Compuestos químicos precisos para voladuras controladas que maximizan la extracción de mineral." },
        { id: "5.1.2", name: "Maquinaria Pesada", effect: 9, cost: [40000, 400], description: "Excavadoras y camiones de gran tonelaje para mover tierra a una escala masiva." },
        { id: "5.2.1", name: "Exploración Geológica", effect: 16, cost: [180000, 1800], description: "Escáneres de resonancia y satélites para detectar vetas minerales ocultas." }
    ],
    Telecomunicaciones: [
        { id: "6.1.1", name: "Fibra Óptica", effect: 5, cost: [18000, 180], description: "Cables de transmisión de datos a la velocidad de la luz para una conectividad sin latencia." },
        { id: "6.1.2", name: "5G Network", effect: 10, cost: [50000, 500], description: "Infraestructura celular de alta velocidad para conectar millones de dispositivos simultáneamente." },
        { id: "6.2.1", name: "Satélites de Comunicación", effect: 20, cost: [250000, 2500], description: "Constelación propia de satélites para cobertura global garantizada." }
    ],
    Refineria: [
        { id: "7.1.1", name: "Craqueo Catalítico", effect: 5, cost: [1000, 180], description: "Descompone hidrocarburos pesados en otros más ligeros y valiosos mediante catalizadores." },
        { id: "7.1.2", name: "Destilación Fraccionada", effect: 10, cost: [5000, 500], description: "Separación precisa de componentes basada en sus puntos de ebullición para mayor pureza." },
        { id: "7.2.1", name: "Tratamiento de Azufre", effect: 20, cost: [2000, 200], description: "Procesos de hidrodesulfuración para reducir emisiones y cumplir normativas ambientales." }
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

export const TIER_CONFIG = [
    { name: 'Lv1', min: 120000, max: 120000, tier: 0 }, // Assuming 0 for "Levels"
    { name: 'Lv2', min: 150000, max: 175000, tier: 0 },
    { name: 'Lv3', min: 175000, max: 220000, tier: 0 },
    { name: 'Lv4', min: 220000, max: 275000, tier: 0 },
    { name: 'Lv5', min: 275000, max: 350000, tier: 0 },
    { name: 'Lv6', min: 350000, max: 475000, tier: 0 },
    { name: 'Lv7', min: 475000, max: 575000, tier: 0 },
    { name: 'Lv8', min: 575000, max: 850000, tier: 0 },
    { name: 'Lv9', min: 850000, max: 1200000, tier: 0 },
    { name: 'Lv10', min: 1200000, max: 5000000, tier: 0 },
    { name: 'Tier1', min: 5000000, max: 20000000, tier: 1 },
    { name: 'Tier2', min: 20000000, max: 100000000, tier: 2 },
    { name: 'Tier3', min: 100000000, max: 100000000000, tier: 3 }
];

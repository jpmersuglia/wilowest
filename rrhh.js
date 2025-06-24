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

// RRHH specific variables
let candidates = [];
let hiredOfficials = [];
let searchInProgress = false;
let searchTimer = null;

// Data for generating officials
const firstNames = [
    "Alejandro", "María", "Carlos", "Ana", "Luis", "Carmen", "Javier", "Isabel", "Miguel", "Patricia",
    "Roberto", "Laura", "Fernando", "Sofia", "Diego", "Valentina", "Ricardo", "Camila", "Andrés", "Daniela",
    "Eduardo", "Gabriela", "Francisco", "Natalia", "Manuel", "Andrea", "José", "Paula", "David", "Mariana",
    "Juan", "Carolina", "Pedro", "Lucía", "Antonio", "Valeria", "Rafael", "Adriana", "Alberto", "Claudia",
    "Sergio", "Monica", "Héctor", "Verónica", "Raúl", "Elena", "Oscar", "Rosa", "Victor", "Teresa"
];

const lastNames = [
    "García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores",
    "Rivera", "Morales", "Castro", "Ortiz", "Silva", "Cruz", "Reyes", "Moreno", "Jiménez", "Díaz",
    "Romero", "Herrera", "Ruiz", "Vargas", "Mendoza", "Aguilar", "Ramos", "Medina", "Vega", "Castro",
    "Fernández", "Gutiérrez", "Cortez", "Soto", "Rojas", "Contreras", "Salazar", "Miranda", "Luna", "Pacheco",
    "Campos", "Vázquez", "Cervantes", "Molina", "Herrera", "Ramos", "Acosta", "Padilla", "Ríos", "Sierra"
];

const roles = ["CEO", "CFO", "COO", "CTO", "CMO", "CHRO", "CLO", "CRO"];

const specializations = ["Petroleo", "Transporte", "Banco", "Metalurgica", "Mineria", "Telecomunicaciones"];

const stats = ["Operativo", "Financiero", "Logístico", "Marketing", "Tecnológico", "Estratégico"];

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
            
            // Load RRHH specific data
            candidates = gameState.candidates || [];
            hiredOfficials = gameState.hiredOfficials || [];
            
            console.log('=== LOADING RRHH GAME STATE ===');
            console.log('Raw game state:', gameState);
            console.log('Candidates loaded:', candidates.length);
            console.log('Hired officials loaded:', hiredOfficials.length);
            console.log('Companies in state:', gameState.companies?.length || 0);
            console.log('Investigations in state:', gameState.purchasedInvestigations?.length || 0);
            
            // Debug: Log each candidate and official
            if (candidates.length > 0) {
                console.log('Candidates details:', candidates.map(c => ({ id: c.id, name: c.name, role: c.role })));
            }
            if (hiredOfficials.length > 0) {
                console.log('Hired officials details:', hiredOfficials.map(o => ({ id: o.id, name: o.name, role: o.role, workingIn: o.workingIn })));
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
    // First, get the existing game state to preserve other data
    const existingState = localStorage.getItem('wilowest_game_state');
    let existingGameState = {};
    
    if (existingState) {
        try {
            existingGameState = JSON.parse(existingState);
        } catch (e) {
            console.error('Error parsing existing game state:', e);
        }
    }
    
    // Create new game state, preserving ALL existing data
    const gameState = {
        // Current page data
        mainCompanyMoney,
        totalCompaniesCreated,
        totalMoneyEarned,
        researchPoints,
        companyResources,
        candidates,
        hiredOfficials,
        
        // Preserve ALL other data from existing state
        companies: existingGameState.companies || [],
        purchasedInvestigations: existingGameState.purchasedInvestigations || []
    };
    
    console.log('=== SAVING RRHH GAME STATE ===');
    console.log('Candidates to save:', candidates.length);
    console.log('Hired officials to save:', hiredOfficials.length);
    console.log('Existing companies preserved:', existingGameState.companies?.length || 0);
    console.log('Existing investigations preserved:', existingGameState.purchasedInvestigations?.length || 0);
    
    // Debug: Log what we're about to save
    console.log('About to save candidates:', candidates.map(c => ({ id: c.id, name: c.name })));
    console.log('About to save hired officials:', hiredOfficials.map(o => ({ id: o.id, name: o.name, workingIn: o.workingIn })));
    
    localStorage.setItem('wilowest_game_state', JSON.stringify(gameState));
    console.log('Game state saved successfully');
    
    // Verify what was actually saved
    const verifyState = localStorage.getItem('wilowest_game_state');
    if (verifyState) {
        const verifyGameState = JSON.parse(verifyState);
        console.log('Verification - Saved candidates:', verifyGameState.candidates?.length || 0);
        console.log('Verification - Saved hired officials:', verifyGameState.hiredOfficials?.length || 0);
    }
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

// --- OFFICIAL GENERATION FUNCTIONS ---
function generateOfficial(specialization = null) {
    const id = Math.random().toString(36).substr(2, 9);
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const role = roles[Math.floor(Math.random() * roles.length)];
    const officialSpecialization = specialization || specializations[Math.floor(Math.random() * specializations.length)];
    
    // Generate stats with one standout stat
    const officialStats = {};
    const standoutStat = stats[Math.floor(Math.random() * stats.length)];
    
    stats.forEach(stat => {
        if (stat === standoutStat) {
            officialStats[stat] = Math.floor(Math.random() * 5) + 8; // 8-12 for standout
        } else {
            officialStats[stat] = Math.floor(Math.random() * 4) + 3; // 3-6 for others
        }
    });
    
    return {
        id,
        name,
        avatar: "human-avatar.svg", // Placeholder
        role,
        specialization: officialSpecialization,
        stats: officialStats,
        employed: false,
        workingIn: null,
        trainingUntil: null,
        totalStats: Object.values(officialStats).reduce((sum, stat) => sum + stat, 0)
    };
}

function generateCandidates(count = 5, specialization = null) {
    const newCandidates = [];
    for (let i = 0; i < count; i++) {
        newCandidates.push(generateOfficial(specialization));
    }
    return newCandidates;
}

// --- SEARCH FUNCTIONALITY ---
function startCandidateSearch() {
    if (searchInProgress) return;
    
    const specializationFilter = document.getElementById('specializationFilter').value;
    const searchBtn = document.getElementById('searchCandidatesBtn');
    const searchProgress = document.getElementById('searchProgress');
    const progressFill = document.querySelector('.progress-fill');
    const timeLeftSpan = document.getElementById('searchTimeLeft');
    
    searchInProgress = true;
    searchBtn.disabled = true;
    searchProgress.style.display = 'block';
    
    let timeLeft = 60;
    timeLeftSpan.textContent = timeLeft;
    
    const updateProgress = () => {
        timeLeft--;
        timeLeftSpan.textContent = timeLeft;
        const progressPercent = ((60 - timeLeft) / 60) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        if (timeLeft <= 0) {
            // Search complete
            const newCandidates = generateCandidates(5, specializationFilter || null);
            candidates = newCandidates;
            
            searchInProgress = false;
            searchBtn.disabled = false;
            searchProgress.style.display = 'none';
            progressFill.style.width = '0%';
            
            renderCandidates();
            saveGameState();
            
            console.log(`Search complete! Generated ${candidates.length} candidates`);
        } else {
            searchTimer = setTimeout(updateProgress, 1000);
        }
    };
    
    searchTimer = setTimeout(updateProgress, 1000);
}

// --- RENDERING FUNCTIONS ---
function renderCandidates() {
    const container = document.getElementById('candidatesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (candidates.length === 0) {
        container.innerHTML = '<p class="no-candidates">No hay candidatos disponibles. Realiza una búsqueda para encontrar oficiales.</p>';
        return;
    }
    
    candidates.forEach(candidate => {
        const candidateCard = createCandidateCard(candidate);
        container.appendChild(candidateCard);
    });
}

function renderHiredOfficials() {
    const container = document.getElementById('hiredOfficialsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (hiredOfficials.length === 0) {
        container.innerHTML = '<p class="no-officials">No hay oficiales contratados.</p>';
        return;
    }
    
    hiredOfficials.forEach(official => {
        const officialCard = createHiredOfficialCard(official);
        container.appendChild(officialCard);
    });
}

function createCandidateCard(candidate) {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.setAttribute('data-id', candidate.id);
    
    const isTraining = candidate.trainingUntil && new Date() < new Date(candidate.trainingUntil);
    
    card.innerHTML = `
        <div class="candidate-header">
            <div class="candidate-avatar">
                <img src="media/${candidate.avatar}" alt="Avatar" class="avatar-img">
            </div>
            <div class="candidate-info">
                <h3 class="candidate-name">${candidate.name}</h3>
                <p class="candidate-role">${candidate.role}</p>
                <p class="candidate-specialization">${candidate.specialization}</p>
            </div>
            <div class="candidate-status ${isTraining ? 'training' : 'available'}">
                ${isTraining ? 'Entrenando' : 'Disponible'}
            </div>
        </div>
        <div class="candidate-stats">
            <h4>Estadísticas</h4>
            <div class="stats-grid">
                ${Object.entries(candidate.stats).map(([stat, value]) => `
                    <div class="stat-item">
                        <span class="stat-name">${stat}</span>
                        <span class="stat-value">${value}</span>
                    </div>
                `).join('')}
            </div>
            <div class="total-stats">
                <strong>Total: ${candidate.totalStats} puntos</strong>
            </div>
        </div>
        <div class="candidate-actions">
            <button class="hire-btn" onclick="hireOfficial('${candidate.id}')" ${isTraining ? 'disabled' : ''}>
                Contratar
            </button>
        </div>
    `;
    
    return card;
}

function createHiredOfficialCard(official) {
    const card = document.createElement('div');
    card.className = 'hired-official-card';
    card.setAttribute('data-id', official.id);
    
    const isTraining = official.trainingUntil && new Date() < new Date(official.trainingUntil);
    const companies = getAvailableCompanies();
    
    card.innerHTML = `
        <div class="official-header">
            <div class="official-avatar">
                <img src="media/${official.avatar}" alt="Avatar" class="avatar-img">
            </div>
            <div class="official-info">
                <h3 class="official-name">${official.name}</h3>
                <p class="official-role">${official.role}</p>
                <p class="official-specialization">${official.specialization}</p>
                <p class="official-company">${official.workingIn ? `Trabajando en: ${official.workingIn}` : 'Sin asignar'}</p>
            </div>
            <div class="official-status ${isTraining ? 'training' : 'active'}">
                ${isTraining ? 'Entrenando' : 'Activo'}
            </div>
        </div>
        <div class="official-stats">
            <h4>Estadísticas</h4>
            <div class="stats-grid">
                ${Object.entries(official.stats).map(([stat, value]) => `
                    <div class="stat-item">
                        <span class="stat-name">${stat}</span>
                        <span class="stat-value">${value}</span>
                    </div>
                `).join('')}
            </div>
            <div class="total-stats">
                <strong>Total: ${official.totalStats} puntos</strong>
                <span class="bonus-info">(+${(official.totalStats * 0.01).toFixed(2)}% bonus)</span>
            </div>
        </div>
        <div class="official-actions">
            <select class="company-assignment" onchange="assignToCompany('${official.id}', this.value)" ${isTraining ? 'disabled' : ''}>
                <option value="">Sin asignar</option>
                ${companies.map(company => `
                    <option value="${company.name}" ${official.workingIn === company.name ? 'selected' : ''}>
                        ${company.name} (${company.type})
                    </option>
                `).join('')}
            </select>
            <button class="train-btn" onclick="trainOfficial('${official.id}')" ${isTraining ? 'disabled' : ''}>
                Entrenar
            </button>
            <button class="fire-btn" onclick="fireOfficial('${official.id}')">
                Despedir
            </button>
        </div>
    `;
    
    return card;
}

// --- OFFICIAL MANAGEMENT FUNCTIONS ---
function hireOfficial(candidateId) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    // Remove from candidates
    candidates = candidates.filter(c => c.id !== candidateId);
    
    // Add to hired officials
    hiredOfficials.push(candidate);
    
    renderCandidates();
    renderHiredOfficials();
    saveGameState();
    
    console.log(`Hired official: ${candidate.name}`);
}

function assignToCompany(officialId, companyName) {
    const official = hiredOfficials.find(o => o.id === officialId);
    if (!official) return;
    
    official.workingIn = companyName || null;
    
    renderHiredOfficials();
    saveGameState();
    
    console.log(`Assigned ${official.name} to ${companyName || 'no company'}`);
}

function trainOfficial(officialId) {
    const official = hiredOfficials.find(o => o.id === officialId);
    if (!official) return;
    
    // Find the highest stat
    let highestStat = null;
    let highestValue = 0;
    
    Object.entries(official.stats).forEach(([stat, value]) => {
        if (value > highestValue) {
            highestValue = value;
            highestStat = stat;
        }
    });
    
    if (highestStat) {
        // Increase the highest stat by 1
        official.stats[highestStat]++;
        official.totalStats++;
        
        // Set training time (5 minutes)
        const trainingEnd = new Date();
        trainingEnd.setMinutes(trainingEnd.getMinutes() + 5);
        official.trainingUntil = trainingEnd.toISOString();
        
        renderHiredOfficials();
        saveGameState();
        
        console.log(`Training ${official.name} - Increased ${highestStat} to ${official.stats[highestStat]}`);
    }
}

function fireOfficial(officialId) {
    if (!confirm('¿Estás seguro que deseas despedir a este oficial?')) return;
    
    const official = hiredOfficials.find(o => o.id === officialId);
    if (!official) return;
    
    // Remove from hired officials
    hiredOfficials = hiredOfficials.filter(o => o.id !== officialId);
    
    renderHiredOfficials();
    saveGameState();
    
    console.log(`Fired official: ${official.name}`);
}

// --- HELPER FUNCTIONS ---
function getAvailableCompanies() {
    // This function should get companies from the main game state
    // For now, we'll return a placeholder
    const saved = localStorage.getItem('wilowest_game_state');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            return gameState.companies || [];
        } catch (e) {
            console.error('Error getting companies:', e);
        }
    }
    return [];
}

function calculateOfficialBonus(official) {
    if (!official.workingIn || official.trainingUntil && new Date() < new Date(official.trainingUntil)) {
        return 0;
    }
    return official.totalStats * 0.01; // 0.01% per stat point
}

// --- NAVIGATION FUNCTIONS ---
function navigateToCompanies() {
    console.log('=== NAVIGATING TO COMPANIES ===');
    console.log('Saving state before navigation...');
    saveGameState();
    
    // Verify save was successful
    const verifyState = localStorage.getItem('wilowest_game_state');
    if (verifyState) {
        const verifyGameState = JSON.parse(verifyState);
        console.log('Verification before navigation - Candidates:', verifyGameState.candidates?.length || 0);
        console.log('Verification before navigation - Hired officials:', verifyGameState.hiredOfficials?.length || 0);
    }
    
    window.location.href = 'index.html';
}

function navigateToInvestigationTree() {
    console.log('=== NAVIGATING TO INVESTIGATION TREE ===');
    console.log('Saving state before navigation...');
    saveGameState();
    
    // Verify save was successful
    const verifyState = localStorage.getItem('wilowest_game_state');
    if (verifyState) {
        const verifyGameState = JSON.parse(verifyState);
        console.log('Verification before navigation - Candidates:', verifyGameState.candidates?.length || 0);
        console.log('Verification before navigation - Hired officials:', verifyGameState.hiredOfficials?.length || 0);
    }
    
    window.location.href = 'investigationtree.html';
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
        
        // Reset RRHH data
        candidates = [];
        hiredOfficials = [];
        searchInProgress = false;
        if (searchTimer) {
            clearTimeout(searchTimer);
            searchTimer = null;
        }
        
        // Clear all data when resetting
        const gameState = {
            mainCompanyMoney,
            totalCompaniesCreated,
            totalMoneyEarned,
            researchPoints,
            companyResources,
            candidates: [],
            hiredOfficials: [],
            companies: [],
            purchasedInvestigations: []
        };
        localStorage.setItem('wilowest_game_state', JSON.stringify(gameState));
        
        // Update displays
        updateMainDisplay();
        updateStatistics();
        updateResourceDisplay();
        renderCandidates();
        renderHiredOfficials();
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== RRHH PAGE LOADING ===');
    
    // Load game state
    loadGameState();
    
    // Update displays
    updateMainDisplay();
    updateStatistics();
    updateResourceDisplay();
    
    // Render content
    renderCandidates();
    renderHiredOfficials();
    
    console.log('=== FINAL RRHH STATE AFTER LOADING ===');
    console.log('Current money:', mainCompanyMoney);
    console.log('Current research points:', researchPoints);
    console.log('Candidates:', candidates.length);
    console.log('Hired officials:', hiredOfficials.length);
    
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

    const investigationTreeBtn = document.getElementById('investigationTreeBtn');
    if (investigationTreeBtn) {
        investigationTreeBtn.addEventListener('click', navigateToInvestigationTree);
    }

    // Search button
    const searchBtn = document.getElementById('searchCandidatesBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', startCandidateSearch);
    }

    // Test state button
    const testStateBtn = document.getElementById('testStateBtn');
    if (testStateBtn) {
        testStateBtn.addEventListener('click', () => {
            console.log('=== TESTING CURRENT STATE ===');
            console.log('Current candidates:', candidates);
            console.log('Current hired officials:', hiredOfficials);
            
            // Test localStorage
            const saved = localStorage.getItem('wilowest_game_state');
            if (saved) {
                const gameState = JSON.parse(saved);
                console.log('localStorage state:', gameState);
                console.log('localStorage candidates:', gameState.candidates);
                console.log('localStorage hired officials:', gameState.hiredOfficials);
            } else {
                console.log('No localStorage data found');
            }
            
            alert(`Candidatos: ${candidates.length}, Oficiales: ${hiredOfficials.length}`);
        });
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

    // Auto-save every minute
    setInterval(saveGameState, 60000);
    
    // Check for training completion every 30 seconds
    setInterval(() => {
        let needsUpdate = false;
        hiredOfficials.forEach(official => {
            if (official.trainingUntil && new Date() >= new Date(official.trainingUntil)) {
                official.trainingUntil = null;
                needsUpdate = true;
            }
        });
        
        if (needsUpdate) {
            renderHiredOfficials();
            saveGameState();
        }
    }, 30000);
}); 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import Header from './Header';
import '../styles/RRHH.css';

// Constants for generation
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
const statsList = ["Operativo", "Financiero", "Logístico", "Marketing", "Tecnológico", "Estratégico"];

function RRHH() {
  const navigate = useNavigate();
  const {
    candidates,
    hiredOfficials,
    companies,
    setCandidates,
    addOfficial,
    updateOfficial,
    removeOfficial
  } = useGame();

  const [searchInProgress, setSearchInProgress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [specializationFilter, setSpecializationFilter] = useState('');

  // Check for training completion
  useEffect(() => {
    const interval = setInterval(() => {
      let needsUpdate = false;
      hiredOfficials.forEach(official => {
        if (official.trainingUntil && new Date() >= new Date(official.trainingUntil)) {
          updateOfficial({ ...official, trainingUntil: null });
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [hiredOfficials, updateOfficial]);

  const generateOfficial = (forceSpecialization = null) => {
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

  const startSearch = () => {
    if (searchInProgress) return;
    setSearchInProgress(true);
    setTimeLeft(60);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSearchInProgress(false);
          const newCandidates = Array(5).fill(null).map(() => generateOfficial(specializationFilter || null));
          setCandidates(newCandidates);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Changed to 100ms for testing? No, keep 1s
  };

  const handleHire = (candidate) => {
    const newCandidates = candidates.filter(c => c.id !== candidate.id);
    setCandidates(newCandidates);
    addOfficial(candidate);
  };

  const handleFire = (officialId) => {
    if (window.confirm('¿Estás seguro que deseas despedir a este oficial?')) {
      removeOfficial(officialId);
    }
  };

  const handleAssign = (official, companyName) => {
    updateOfficial({ ...official, workingIn: companyName });
  };

  const handleTrain = (official) => {
    // Find highest stat
    const highestStatEntry = Object.entries(official.stats).reduce((a, b) => a[1] > b[1] ? a : b);
    const statName = highestStatEntry[0];

    const trainingEnd = new Date();
    trainingEnd.setMinutes(trainingEnd.getMinutes() + 5);

    updateOfficial({
      ...official,
      stats: {
        ...official.stats,
        [statName]: official.stats[statName] + 1
      },
      totalStats: official.totalStats + 1,
      trainingUntil: trainingEnd.toISOString()
    });
  };

  const isTraining = (official) => {
    return official.trainingUntil && new Date() < new Date(official.trainingUntil);
  };

  return (
    <div className="rrhh-container">
      <Header />

      {/* Search Section */}
      <div className="candidates-section">
        <div className="section-header">
          <h2>Buscar Candidatos</h2>
          <div className="search-controls">
            <select
              className="search-select"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              disabled={searchInProgress}
            >
              <option value="">Todas las especializaciones</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              className="search-btn"
              onClick={startSearch}
              disabled={searchInProgress}
            >
              Forzar Búsqueda
            </button>
            <button
              className="search-btn"
              onClick={() => {
                setSearchInProgress(false);
                setTimeLeft(0);
                const newCandidates = Array(5).fill(null).map(() => generateOfficial(specializationFilter || null));
                setCandidates(newCandidates);
              }}
              style={{ background: '#ff9800' }}
            >
              Debug: Instant Search
            </button>
          </div>
        </div>

        {searchInProgress && (
          <div className="search-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((60 - timeLeft) / 60) * 100}%`, transition: 'width 1s linear' }}
              ></div>
            </div>
            <p>Buscando candidatos... {timeLeft}s</p>
          </div>
        )}

        <div className="grid-container">
          {candidates.length === 0 && !searchInProgress && <p>No hay candidatos. Inicia una búsqueda.</p>}
          {candidates.map(candidate => (
            <div key={candidate.id} className="person-card">
              <div className="person-header">
                <div className="avatar">
                  <img src="/media/human-avatar.svg" alt="Avatar" />
                </div>
                <div className="person-info">
                  <h3>{candidate.name}</h3>
                  <p className="role">{candidate.role}</p>
                  <p className="specialization">{candidate.specialization}</p>
                </div>
                <div className="status-badge available">Disponible</div>
              </div>

              <div className="stats-grid">
                {Object.entries(candidate.stats).map(([key, val]) => (
                  <div key={key} className="stat-row">
                    <span>{key}</span>
                    <span className="stat-value">{val}</span>
                  </div>
                ))}
              </div>
              <div className="total-bonus">
                Total: {candidate.totalStats} (+{(candidate.totalStats * 0.01).toFixed(2)}%)
              </div>

              <div className="card-actions">
                <button className="action-btn hire-btn" onClick={() => handleHire(candidate)}>
                  Contratar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hired Section */}
      <div className="hired-section">
        <div className="section-header">
          <h2>Oficiales Contratados</h2>
        </div>

        <div className="grid-container">
          {hiredOfficials.length === 0 && <p>No hay oficiales contratados.</p>}
          {hiredOfficials.map(official => {
            const training = isTraining(official);
            return (
              <div key={official.id} className="person-card">
                <div className="person-header">
                  <div className="avatar">
                    <img src="/media/human-avatar.svg" alt="Avatar" />
                  </div>
                  <div className="person-info">
                    <h3>{official.name}</h3>
                    <p className="role">{official.role}</p>
                    <p className="specialization">{official.specialization}</p>
                  </div>
                  <div className={`status-badge ${training ? 'training' : 'active'}`}>
                    {training ? 'Entrenando' : 'Activo'}
                  </div>
                </div>

                <div className="stats-grid">
                  {Object.entries(official.stats).map(([key, val]) => (
                    <div key={key} className="stat-row">
                      <span>{key}</span>
                      <span className="stat-value">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="card-actions">
                  <select
                    className="assignment-select"
                    value={official.workingIn || ''}
                    onChange={(e) => handleAssign(official, e.target.value)}
                    disabled={training}
                  >
                    <option value="">Sin asignar</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.type})</option>
                    ))}
                  </select>

                  <button
                    className="action-btn train-btn"
                    onClick={() => handleTrain(official)}
                    disabled={training}
                  >
                    Entrenar (+1 Stat)
                  </button>
                  <button
                    className="action-btn fire-btn"
                    onClick={() => handleFire(official.id)}
                  >
                    Despedir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RRHH; 
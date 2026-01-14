import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import Header from './Header';
import { specializations, generateOfficial } from '../data/gameData';
import '../styles/RRHH.css';

function RRHH() {
  const {
    candidates,
    hiredOfficials,
    companies,
    hrSearchUntil,
    hrSearchFilter,
    setCandidates,
    addOfficial,
    updateOfficial,
    removeOfficial,
    startHRSearch
  } = useGame();

  const [specializationFilter, setSpecializationFilter] = useState(hrSearchFilter || '');
  const [timeLeft, setTimeLeft] = useState(0);

  // Update countdown timer
  useEffect(() => {
    if (!hrSearchUntil) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const until = new Date(hrSearchUntil);
      const diff = Math.max(0, Math.floor((until - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hrSearchUntil]);

  const startSearch = () => {
    if (hrSearchUntil) return;
    // 10 minutes = 600 seconds
    startHRSearch(600, specializationFilter);
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
    const trainingEnd = new Date();
    // 24 hours training as requested
    trainingEnd.setHours(trainingEnd.getHours() + 24);

    updateOfficial({
      ...official,
      trainingUntil: trainingEnd.toISOString()
    });
  };

  const isTraining = (official) => {
    return official.trainingUntil && new Date() < new Date(official.trainingUntil);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getTrainingTimeLeft = (official) => {
    if (!official.trainingUntil) return '';
    const diff = Math.max(0, Math.floor((new Date(official.trainingUntil) - new Date()) / 1000));
    return formatTime(diff);
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
              disabled={!!hrSearchUntil}
            >
              <option value="">Todas las especializaciones</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              className="search-btn"
              onClick={startSearch}
              disabled={!!hrSearchUntil}
            >
              Forzar Búsqueda (10m)
            </button>
            <button
              className="search-btn"
              onClick={() => {
                const newCandidates = Array(5).fill(null).map(() => generateOfficial(specializationFilter || null));
                setCandidates(newCandidates);
              }}
              style={{ background: '#ff9800' }}
            >
              Debug: Instant Search
            </button>
          </div>
        </div>

        {hrSearchUntil && (
          <div className="search-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((600 - timeLeft) / 600) * 100}%`, transition: 'width 1s linear' }}
              ></div>
            </div>
            <p>Buscando candidatos... {formatTime(timeLeft)}</p>
          </div>
        )}

        <div className="grid-container">
          {candidates.length === 0 && !hrSearchUntil && <p>No hay candidatos. Inicia una búsqueda.</p>}
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
                    {training ? `Entrenando (${getTrainingTimeLeft(official)})` : 'Activo'}
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
                    Entrenar (+1 Stat / 24h)
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

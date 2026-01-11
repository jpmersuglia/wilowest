import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { investigationTrees } from '../data/gameData';
import '../styles/InvestigationTree.css';

function InvestigationTree() {
  const navigate = useNavigate();
  const {
    mainCompanyMoney,
    researchPoints,
    purchasedInvestigations,
    addInvestigation,
    addMoney,
    updateResearchPoints
  } = useGame();

  const [selectedTech, setSelectedTech] = useState(null);

  const handleTechClick = (tech, type) => {
    setSelectedTech({ ...tech, type });
  };

  const handleCloseModal = () => {
    setSelectedTech(null);
  };

  const handlePurchase = () => {
    if (!selectedTech) return;

    if (mainCompanyMoney >= selectedTech.cost[0] && researchPoints >= selectedTech.cost[1]) {
      addMoney(-selectedTech.cost[0]);
      updateResearchPoints(researchPoints - selectedTech.cost[1]);
      addInvestigation(selectedTech.id);
      handleCloseModal();
    }
  };

  const isAffordable = (cost) => {
    return mainCompanyMoney >= cost[0] && researchPoints >= cost[1];
  };

  const getStatus = (tech) => {
    if (purchasedInvestigations.includes(tech.id)) return 'owned';
    if (isAffordable(tech.cost)) return 'available';
    return 'locked';
  };

  // Group technologies by branch for rendering
  const getBranches = (items) => {
    const branches = {};
    items.forEach(item => {
      const branchNum = item.id.split('.')[1];
      if (!branches[branchNum]) branches[branchNum] = [];
      branches[branchNum].push(item);
    });
    return branches;
  };

  return (
    <div className="investigation-container">
      <header className="investigation-header">
        <h1>Árbol de Investigación</h1>

        <div className="stats-container">
          <div className="stat-item">
            <img src="/media/usd-circle.svg" alt="Money" className="resource-icon" />
            <span>${mainCompanyMoney.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <img src="/media/sparkles.svg" alt="Research" className="resource-icon" />
            <span>{researchPoints}</span>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="back-btn">
          Volver al Inicio
        </button>
      </header>

      <div className="trees-grid">
        {Object.entries(investigationTrees).map(([type, items]) => {
          const branches = getBranches(items);

          return (
            <div key={type} className="investigation-tree">
              <div className="tree-title">{type}</div>
              {Object.keys(branches).sort().map(branchNum => (
                <div key={branchNum} className="branch-container">
                  <div className="branch-title">Rama {branchNum}</div>
                  <div className="technologies-grid">
                    {branches[branchNum]
                      .sort((a, b) => parseInt(a.id.split('.')[2]) - parseInt(b.id.split('.')[2]))
                      .map(tech => {
                        const status = getStatus(tech);
                        return (
                          <div
                            key={tech.id}
                            className={`tech-node ${status}`}
                            onClick={() => handleTechClick(tech, type)}
                            title={tech.name}
                          >
                            <img src="/media/technology-icon.svg" alt="Tech" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {selectedTech && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className={`modal-icon ${getStatus(selectedTech)}`}>
                <img src="/media/technology-icon.svg" alt="Tech" />
              </div>
              <div className="modal-title">
                <h2>{selectedTech.name}</h2>
              </div>
            </div>

            <p className="modal-description">{selectedTech.description}</p>

            <div className="modal-cost">
              <div className={`cost-item ${mainCompanyMoney >= selectedTech.cost[0] ? 'affordable' : 'expensive'}`}>
                <span>💰 Costo: ${selectedTech.cost[0].toLocaleString()}</span>
              </div>
              <div className={`cost-item ${researchPoints >= selectedTech.cost[1] ? 'affordable' : 'expensive'}`}>
                <span>🔬 Puntos de UI: {selectedTech.cost[1]}</span>
              </div>
              <div className="effect-info">
                <span>⚡ Efecto: +{selectedTech.effect}% producción</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={handleCloseModal}>
                Cerrar
              </button>
              {!purchasedInvestigations.includes(selectedTech.id) ? (
                <button
                  className="modal-btn confirm"
                  disabled={!isAffordable(selectedTech.cost)}
                  onClick={handlePurchase}
                >
                  Investigar
                </button>
              ) : (
                <button className="modal-btn confirm" disabled>
                  Investigado
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestigationTree; 
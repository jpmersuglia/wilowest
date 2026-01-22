import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { investigationTrees, companyTypes } from '../data/gameData';
import Header from './Header';
import Raphael from 'raphael';
import 'treantjs';
import 'treantjs/Treant.css';
import '../styles/InvestigationTree.css';

// Treant depends on Raphael being in global scope
window.Raphael = Raphael;

function InvestigationTree() {
  const {
    mainCompanyMoney,
    researchPoints,
    purchasedInvestigations,
    addInvestigation,
    addMoney,
    updateResearchPoints
  } = useGame();

  const [selectedTech, setSelectedTech] = useState(null);
  const treeContainers = useRef({});

  const handleTechClick = useCallback((tech) => {
    setSelectedTech(tech);
  }, []);

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

  const isAffordable = useCallback((cost) => {
    if (!cost) return false;
    return mainCompanyMoney >= cost[0] && researchPoints >= cost[1];
  }, [mainCompanyMoney, researchPoints]);

  const getStatus = useCallback((tech) => {
    if (purchasedInvestigations.includes(tech.id)) return 'owned';
    if (isAffordable(tech.cost)) return 'available';
    return 'locked';
  }, [purchasedInvestigations, isAffordable]);

  useEffect(() => {
    const charts = [];

    // Clear previous charts content from DOM if any and from ref
    Object.keys(treeContainers.current).forEach(id => {
      const el = treeContainers.current[id];
      if (el) el.innerHTML = '';
    });

    Object.entries(investigationTrees).forEach(([type, items]) => {
      const containerId = `tree-${type.replace(/\s+/g, '-')}`;
      const container = treeContainers.current[containerId];
      if (!container) return;

      // Group by branch
      const branches = {};
      items.forEach(item => {
        const branchNum = item.id.split('.')[1];
        if (!branches[branchNum]) branches[branchNum] = [];
        branches[branchNum].push(item);
      });

      const companyInfo = companyTypes[type];
      const rootIcon = companyInfo ? `/media/${companyInfo.icon}` : "/media/company-default-icon.svg";

      const nodeStructure = {
        text: { name: type },
        image: rootIcon,
        HTMLclass: 'tree-root-node',
        children: Object.keys(branches).sort().map(branchNum => {
          const branchTechs = branches[branchNum].sort((a, b) =>
            parseInt(a.id.split('.')[2]) - parseInt(b.id.split('.')[2])
          );

          let currentChild = null;
          for (let i = branchTechs.length - 1; i >= 0; i--) {
            const tech = branchTechs[i];
            const status = purchasedInvestigations.includes(tech.id) ? 'owned' :
              (isAffordable(tech.cost) ? 'available' : 'locked');

            const newNode = {
              text: { name: tech.name },
              HTMLclass: `tech-node ${status}`,
              HTMLid: `tech-${tech.id.replace(/\./g, '-')}`,
              image: "/media/technology-icon.svg",
              contact: tech,
              children: currentChild ? [currentChild] : []
            };
            currentChild = newNode;
          }

          return {
            text: { name: `Rama ${branchNum}` },
            HTMLclass: 'branch-node',
            children: currentChild ? [currentChild] : []
          };
        })
      };

      const chartConfig = {
        chart: {
          container: `#${containerId}`,
          rootOrientation: 'WEST',
          scrollbar: 'native',
          siblingSeparation: 60,
          levelSeparation: 100,
          connectors: {
            type: 'bCurve',
            style: {
              'stroke': '#747474', // Fixed 6-digit hex
              'stroke-width': 3
            }
          },
          node: {
            HTMLclass: 'custom-treant-node'
          }
        },
        nodeStructure: nodeStructure
      };

      try {
        const chart = new window.Treant(chartConfig);
        charts.push(chart);

        // Add click listeners to nodes
        setTimeout(() => {
          items.forEach(tech => {
            const element = document.getElementById(`tech-${tech.id.replace(/\./g, '-')}`);
            if (element) {
              element.onclick = () => handleTechClick(tech);
            }
          });
        }, 300);

      } catch (e) {
        console.error("Error creating Treant chart:", e);
      }
    });

    return () => {
      // Treant doesn't have a formal destroy, but we clear the DOM
      Object.keys(treeContainers.current).forEach(id => {
        const el = treeContainers.current[id];
        if (el) el.innerHTML = '';
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTechClick]); // Only re-run if handlers change (should be stable)

  // Effect to update node statuses without re-drawing the whole tree
  useEffect(() => {
    Object.values(investigationTrees).flat().forEach(tech => {
      const element = document.getElementById(`tech-${tech.id.replace(/\./g, '-')}`);
      if (element) {
        const status = purchasedInvestigations.includes(tech.id) ? 'owned' :
          (isAffordable(tech.cost) ? 'available' : 'locked');

        // Remove old status classes manually for performance
        element.classList.remove('owned', 'available', 'locked');
        element.classList.add(status);
      }
    });
  }, [purchasedInvestigations, isAffordable]);

  return (
    <div className="investigation-container">
      <Header />

      <div className="trees-stack unified">
        {Object.keys(investigationTrees).map(type => {
          const containerId = `tree-${type.replace(/\s+/g, '-')}`;
          return (
            <div key={type} className="investigation-tree-seamless">
              <div
                id={containerId}
                ref={el => treeContainers.current[containerId] = el}
                className="treant-canvas seamless"
              ></div>
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

            <p className="modal-description">{selectedTech.description || "Mejora la eficiencia de producción para este sector."}</p>

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
                  className={`modal-btn confirm ${!isAffordable(selectedTech.cost) ? 'disabled' : ''}`}
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


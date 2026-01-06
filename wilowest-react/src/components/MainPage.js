import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import CompanyBox from './CompanyBox';
import CreateCompanyModal from './CreateCompanyModal';
import '../styles/MainPage.css';

function MainPage() {
  const navigate = useNavigate();
  const { 
    mainCompanyMoney, 
    researchPoints, 
    companies, 
    totalCompaniesCreated, 
    totalMoneyEarned,
    companyResources,
    resetGame,
    saveGameState
  } = useGame();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCompany = () => {
    setShowCreateModal(true);
  };

  const handleResetGame = () => {
    if (window.confirm('¿Estás seguro que deseas reiniciar el juego? ¡Perderás todo tu progreso!')) {
      resetGame();
    }
  };

  const handleSaveGame = () => {
    saveGameState();
    // Show a brief confirmation message
    const saveBtn = document.getElementById('saveGame');
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '✓ Guardado';
      saveBtn.style.background = '#4caf50';
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.style.background = '#2196f3';
      }, 2000);
    }
  };

  return (
    <div className="main-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>Wilowest</h1>
          </div>
          
          <div className="main-stats">
            <div className="stat">
              <img src="/media/usd-circle.svg" alt="Money" className="resource-icon" />
              <span>{mainCompanyMoney.toFixed(2)}</span>
            </div>
            <div className="stat">
              <img src="/media/sparkles.svg" alt="Research" className="resource-icon" />
              <span>{researchPoints}</span>
            </div>
          </div>

          <nav className="nav">
            <button 
              className="nav-btn"
              onClick={() => navigate('/investigation')}
            >
              <img src="/media/research-icon.svg" alt="Research" />
              Investigación
            </button>
            <button 
              className="nav-btn"
              onClick={() => navigate('/rrhh')}
            >
              <img src="/media/human-resources-icon.svg" alt="RRHH" />
              RRHH
            </button>
          </nav>

          <div className="header-actions">
            <button id="saveGame" onClick={handleSaveGame} className="action-btn">
              Guardar
            </button>
            <button onClick={handleResetGame} className="action-btn reset-btn">
              Reiniciar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Recursos</h3>
            <div className="resource-display">
              {Object.entries(companyResources).map(([resource, amount]) => (
                amount > 0 && (
                  <p key={resource}>
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}: {amount}
                  </p>
                )
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Estadísticas</h3>
            <p>Compañías creadas: {totalCompaniesCreated}</p>
            <p>Dinero total ganado: ${totalMoneyEarned.toFixed(2)}</p>
          </div>

          <div className="sidebar-section">
            <button 
              id="createCompany"
              onClick={handleCreateCompany}
              disabled={mainCompanyMoney < 50000 || companies.length >= 5}
              className="create-company-btn"
            >
              Crear Compañía
            </button>
          </div>
        </div>

        <div className="companies-container">
          {companies.map((company) => (
            <CompanyBox key={company.id} company={company} />
          ))}
        </div>
      </main>

      {/* Create Company Modal */}
      {showCreateModal && (
        <CreateCompanyModal 
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default MainPage; 
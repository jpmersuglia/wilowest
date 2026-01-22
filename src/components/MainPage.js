import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import CompanyBox from './CompanyBox';
import CreateCompanyModal from './CreateCompanyModal';
import Header from './Header';
import '../styles/MainPage.css';

function MainPage() {
  const {
    mainCompanyMoney,
    companies
  } = useGame();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCompany = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="main-page">
      <Header />

      {/* Main Content */}
      <main className="main-content">
        <div className="companies-view">
          <div className="companies-actions-header">
            <button
              id="createCompany"
              onClick={handleCreateCompany}
              disabled={mainCompanyMoney < 50000 || companies.length >= 5}
              className="create-company-btn-main"
            >
              Crear Compañía
              {companies.length >= 5 && <span className="limit-msg"> (Límite alcanzado)</span>}
              {mainCompanyMoney < 50000 && <span className="limit-msg"> (Falta dinero: $50,000)</span>}
            </button>
          </div>

          <div className="companies-container">
            {companies.map((company) => (
              <CompanyBox key={company.id} company={company} />
            ))}
            {companies.length === 0 && (
              <div className="empty-state">
                <p>No tienes compañías todavía. ¡Crea tu primera empresa para empezar!</p>
              </div>
            )}
          </div>
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
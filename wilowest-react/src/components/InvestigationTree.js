import React from 'react';
import { useNavigate } from 'react-router-dom';

function InvestigationTree() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1>Árbol de Investigación</h1>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Volver al Inicio
          </button>
        </header>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2>🚧 En Construcción 🚧</h2>
          <p>El árbol de investigación será migrado próximamente...</p>
        </div>
      </div>
    </div>
  );
}

export default InvestigationTree; 
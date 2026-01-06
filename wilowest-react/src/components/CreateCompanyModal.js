import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { companyTypes } from '../data/gameData';
import '../styles/Modal.css';

function CreateCompanyModal({ onClose }) {
  const { mainCompanyMoney, addCompany, updateMoney } = useGame();
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Update form validation
  useEffect(() => {
    setIsFormValid(companyName.trim() && companyType);
  }, [companyName, companyType]);

  // Get selected company cost
  const getSelectedCompanyCost = () => {
    return companyType && companyTypes[companyType] ? companyTypes[companyType].cost : 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    const cost = getSelectedCompanyCost();
    if (mainCompanyMoney < cost) {
      alert('No tienes suficiente dinero para crear esta compañía.');
      return;
    }

    updateMoney(mainCompanyMoney - cost); // <-- descontar dinero
    const newCompany = {
      id: Date.now().toString(), // Simple ID generation
      name: companyName.trim(),
      type: companyType,
      tier: 0,
      counter: 0,
      value: 0,
      dividendRate: 0,
      upgradeLevel: 0,
      resource: companyTypes[companyType].resource,
      consumes: companyTypes[companyType].consumes,
      resources: {}
    };

    addCompany(newCompany);
    onClose();
  };

  // Handle modal close
  const handleClose = () => {
    setCompanyName('');
    setCompanyType('');
    onClose();
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        
        <div className="modal-preview-header">
          <img 
            id="modalPreviewIcon" 
            className="companyImage" 
            style={{ display: companyType ? 'block' : 'none' }} 
            src={companyType ? `/media/${companyTypes[companyType].icon}` : ''} 
            alt="Icono"
          />
          <h2 className="companyName" id="modalPreviewName">
            {companyName || 'Nombre de la compañía'}
          </h2>
        </div>
        
        <h2>Crear Compañía</h2>
        
        <form id="createCompanyForm" onSubmit={handleSubmit}>
          <label htmlFor="companyNameInput">Nombre:</label>
          <input 
            type="text" 
            id="companyNameInput" 
            name="companyNameInput" 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required 
          />
          <br />
          
          <label htmlFor="companyTypeSelect">Tipo:</label>
          <select 
            id="companyTypeSelect" 
            name="companyTypeSelect" 
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            required
          >
            <option value="" disabled>Selecciona un tipo</option>
            <option value="Petroleo">Petróleo</option>
            <option value="Transporte">Transporte</option>
            <option value="Banco">Banco</option>
            <option value="Metalurgica">Metalúrgica</option>
            <option value="Mineria">Minería</option>
            <option value="Telecomunicaciones">Telecomunicaciones</option>
          </select>
          <br />
          
          <p id="companyCostDisplay">
            Costo: {companyType ? `$${getSelectedCompanyCost().toLocaleString()}` : '-'}
          </p>
          
          <button 
            type="submit" 
            id="confirmCreateCompanyBtn"
            disabled={!isFormValid}
          >
            Crear
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCompanyModal; 
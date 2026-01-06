import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { companyTypes, resourcePrices, getInvestigationBonus } from '../data/gameData';

function CompanyBox({ company }) {
  const { 
    updateMoney, 
    updateCompany, 
    removeCompany, 
    updateResearchPoints,
    purchasedInvestigations,
    hiredOfficials,
    mainCompanyMoney // <-- agregar aquí
  } = useGame();

  const [localCounter, setLocalCounter] = useState(company.counter || 0);
  const [localValue, setLocalValue] = useState(company.value || 0);
  const [dividendRate, setDividendRate] = useState(company.dividendRate || 0);
  const intervalRef = useRef(null);

  // Sincronizar localCounter y localValue con el contexto
  useEffect(() => {
    setLocalCounter(company.counter || 0);
    setLocalValue(company.value || 0);
  }, [company.counter, company.value]);

  // Calculate resource income
  const calculateResourceIncome = useCallback(() => {
    let totalIncome = 0;
    company.consumes.forEach(resource => {
      const available = company.resources?.[resource] || 0;
      if (available > 0) {
        totalIncome += available * resourcePrices[resource];
      }
    });
    return totalIncome;
  }, [company.consumes, company.resources]);

  // Calculate official bonus
  const calculateOfficialBonus = useCallback(() => {
    let totalBonus = 0;
    const companyOfficials = hiredOfficials.filter(official => 
      official.workingIn === company.name && 
      (!official.trainingUntil || new Date() >= new Date(official.trainingUntil))
    );
    
    companyOfficials.forEach(official => {
      totalBonus += official.totalStats * 0.01;
    });
    
    return totalBonus;
  }, [hiredOfficials, company.name]);

  // Get tier increment
  const getTierIncrement = useCallback(() => {
    switch(company.tier) {
      case 0:
        return company.upgradeLevel || 0;
      case 1:
        return 125;
      case 2:
        return 175;
      case 3:
        return 220;
      default:
        return 0;
    }
  }, [company.tier, company.upgradeLevel]);

  // Get investigation chance
  const getInvestigationChance = useCallback(() => {
    switch(company.tier) {
      case 0:
        return company.upgradeLevel || 0;
      case 1:
        return 15;
      case 2:
        return 25;
      case 3:
        return 50;
      default:
        return 0;
    }
  }, [company.tier, company.upgradeLevel]);

  // Auto-save company state to context
  useEffect(() => {
    const updatedCompany = {
      ...company,
      counter: localCounter,
      value: localValue,
      dividendRate
    };
    updateCompany(updatedCompany);
  }, [localCounter, localValue, dividendRate, company, updateCompany]);

  // Handle work button click
  const handleWork = () => {
    const dividend = dividendRate / 100;
    const baseEarnings = 1;
    const resourceIncome = calculateResourceIncome();
    
    const investigationBonus = getInvestigationBonus(company.type, purchasedInvestigations);
    const baseIncrement = getTierIncrement();
    const bonusAmount = (baseIncrement * investigationBonus) / 100;
    
    const officialBonus = calculateOfficialBonus();
    const officialBonusAmount = (baseIncrement * officialBonus) / 100;
    
    const totalEarnings = baseEarnings + resourceIncome + bonusAmount + officialBonusAmount;
    const companyEarnings = totalEarnings * (1 - dividend);
    const mainCompanyDividend = totalEarnings * dividend;

    setLocalCounter(prev => prev + companyEarnings);
    setLocalValue(prev => prev + companyEarnings);
    updateMoney(mainCompanyMoney + mainCompanyDividend); // <-- corregido

    // Check for research points generation
    const investigationChance = getInvestigationChance();
    if (Math.random() * 100 < investigationChance) {
      updateResearchPoints(prev => prev + 1);
    }
  };

  // Handle upgrade
  const handleUpgrade = () => {
    if (company.tier > 0) return;

    const upgradeLevels = {
      0: { cost: 100, increment: 0, resource: 0, investigation: 0 },
      1: { cost: 500, increment: 15, resource: 1, investigation: 1 },
      2: { cost: 1000, increment: 20, resource: 2, investigation: 1.5 },
      3: { cost: 10000, increment: 30, resource: 3, investigation: 2 },
      4: { cost: 20000, increment: 40, resource: 4, investigation: 2.5 },
      5: { cost: 25000, increment: 50, resource: 5, investigation: 3 },
      6: { cost: 50000, increment: 55, resource: 6, investigation: 5.5 },
      7: { cost: 100000, increment: 60, resource: 7, investigation: 6 },
      8: { cost: 255000, increment: 75, resource: 8, investigation: 8 },
      9: { cost: 500000, increment: 85, resource: 9, investigation: 10 },
      10: { cost: 1000000, increment: 100, resource: 10, investigation: 11 },
    };

    const currentLevel = company.upgradeLevel || 0;
    const nextLevel = currentLevel + 1;
    const nextCost = upgradeLevels[nextLevel]?.cost;

    if (localCounter >= nextCost && nextLevel <= 10) {
      setLocalCounter(prev => prev - nextCost);
      updateCompany({
        ...company,
        upgradeLevel: nextLevel
      });
    }
  };

  // Handle sell
  const handleSell = () => {
    if (window.confirm(`¿Estás seguro que deseas vender ${company.name} por $${localValue.toFixed(2)}?`)) {
      updateMoney(mainCompanyMoney + localValue); // <-- corregido
      removeCompany(company.id);
    }
  };

  // Auto-income interval
  useEffect(() => {
    if (company.tier > 0 || (company.upgradeLevel && company.upgradeLevel > 0)) {
      intervalRef.current = setInterval(() => {
        const dividend = dividendRate / 100;
        const resourceIncome = calculateResourceIncome();
        
        const investigationBonus = getInvestigationBonus(company.type, purchasedInvestigations);
        const baseIncrement = getTierIncrement();
        const bonusAmount = (baseIncrement * investigationBonus) / 100;
        
        const officialBonus = calculateOfficialBonus();
        const officialBonusAmount = (baseIncrement * officialBonus) / 100;
        
        const totalEarnings = baseIncrement + resourceIncome + bonusAmount + officialBonusAmount;
        const companyEarnings = totalEarnings * (1 - dividend);
        const mainCompanyDividend = totalEarnings * dividend;

        setLocalValue(prev => prev + companyEarnings);
        setLocalCounter(prev => prev + companyEarnings);
        updateMoney(prev => prev + mainCompanyDividend);

        // Check for research points generation
        const investigationChance = getInvestigationChance();
        if (Math.random() * 100 < investigationChance) {
          updateResearchPoints(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    company.tier, 
    company.upgradeLevel, 
    dividendRate, 
    company.type,
    calculateResourceIncome,
    getInvestigationBonus,
    purchasedInvestigations,
    getTierIncrement,
    calculateOfficialBonus,
    updateMoney,
    updateResearchPoints,
    getInvestigationChance
  ]);

  const currentLevel = company.upgradeLevel || 0;
  const upgradeLevels = {
    0: { cost: 100, increment: 0, resource: 0, investigation: 0 },
    1: { cost: 500, increment: 15, resource: 1, investigation: 1 },
    2: { cost: 1000, increment: 20, resource: 2, investigation: 1.5 },
    3: { cost: 10000, increment: 30, resource: 3, investigation: 2 },
    4: { cost: 20000, increment: 40, resource: 4, investigation: 2.5 },
    5: { cost: 25000, increment: 50, resource: 5, investigation: 3 },
    6: { cost: 50000, increment: 55, resource: 6, investigation: 5.5 },
    7: { cost: 100000, increment: 60, resource: 7, investigation: 6 },
    8: { cost: 255000, increment: 75, resource: 8, investigation: 8 },
    9: { cost: 500000, increment: 85, resource: 9, investigation: 10 },
    10: { cost: 1000000, increment: 100, resource: 10, investigation: 11 },
  };
  const nextCost = upgradeLevels[currentLevel + 1]?.cost;

  return (
    <div className="counter-box" data-tier={company.tier}>
      <div className="company-info">
        <div className="companyHead" data-tier={company.tier}>
          <div className="companyHead-left">
            <img src={`/media/${companyTypes[company.type].icon}`} className="companyImage" alt={company.type} />
            <h2 className="companyName">{company.name}</h2>
          </div>
          <span className="tier-badge" data-tier={company.tier}>
            {company.tier === 0 ? `Nivel ${currentLevel}` : `Tier ${company.tier}`}
          </span>
        </div>
        <p className="mainCounter">$ {localCounter.toFixed(2)}</p>
      </div>
      
      <div className="company-actions">
        <button className="work" onClick={handleWork}>Trabajar</button>
        {company.tier === 0 && currentLevel < 10 && (
          <button 
            className="upgrade" 
            onClick={handleUpgrade}
            disabled={localCounter < nextCost}
          >
            Mejorar {localCounter >= nextCost && <img src="/media/arrow-circle-up.svg" alt="Upgrade" className="upgrade-icon" />}
          </button>
        )}
        <button className="sell" onClick={handleSell}>Vender</button>
      </div>
      
      <div className="company-details">
        <p>Company Value: <span className="valueCounter">{localValue.toFixed(2)}</span></p>
        <div className="dividendControl">
          Dividendos: 
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={dividendRate} 
            onChange={(e) => setDividendRate(parseInt(e.target.value))}
            className="dividendSlider"
          />
          <span className="dividendPercentage">{dividendRate}%</span>
        </div>
      </div>
    </div>
  );
}

export default CompanyBox; 
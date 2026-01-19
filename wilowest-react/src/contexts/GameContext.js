import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { resourcePrices, getInvestigationBonus, generateOfficial, companyNames, companyTypes, TIER_CONFIG } from '../data/gameData';
import { events } from '../data/events';

// Estado inicial del juego
const initialState = {
  mainCompanyMoney: 150000,
  totalCompaniesCreated: 0,
  totalMoneyEarned: 150000,
  researchPoints: 0,
  companyResources: {
    oil: 0,
    logistics: 0,
    finance: 0,
    metal: 0,
    ores: 0,
    telecom: 0,
    fuell: 0
  },
  hiredOfficials: [],
  companies: [],
  purchasedInvestigations: [],
  candidates: [],
  hrSearchUntil: null,
  hrSearchFilter: '',
  stockMarketCompanies: [],
  tickCount: 0,
  activeEvent: null
};

// Tipos de acciones para el reducer
const ACTIONS = {
  UPDATE_MONEY: 'UPDATE_MONEY',
  ADD_COMPANY: 'ADD_COMPANY',
  UPDATE_COMPANY: 'UPDATE_COMPANY',
  REMOVE_COMPANY: 'REMOVE_COMPANY',
  UPDATE_RESOURCES: 'UPDATE_RESOURCES',
  UPDATE_RESEARCH_POINTS: 'UPDATE_RESEARCH_POINTS',
  ADD_OFFICIAL: 'ADD_OFFICIAL',
  UPDATE_OFFICIAL: 'UPDATE_OFFICIAL',
  ADD_INVESTIGATION: 'ADD_INVESTIGATION',
  LOAD_GAME_STATE: 'LOAD_GAME_STATE',
  RESET_GAME: 'RESET_GAME',
  ADD_MONEY: 'ADD_MONEY',
  SET_CANDIDATES: 'SET_CANDIDATES',
  REMOVE_OFFICIAL: 'REMOVE_OFFICIAL',
  START_HR_SEARCH: 'START_HR_SEARCH',
  REMOVE_OFFICIAL: 'REMOVE_OFFICIAL',
  START_HR_SEARCH: 'START_HR_SEARCH',
  TICK: 'TICK',
  TICK: 'TICK',
  SET_STOCK_MARKET_COMPANIES: 'SET_STOCK_MARKET_COMPANIES',
  SET_ACTIVE_EVENT: 'SET_ACTIVE_EVENT'
};

// Reducer para manejar el estado
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_MONEY:
      return {
        ...state,
        mainCompanyMoney: action.payload,
        totalMoneyEarned: action.payload > state.mainCompanyMoney
          ? state.totalMoneyEarned + (action.payload - state.mainCompanyMoney)
          : state.totalMoneyEarned
      };

    case ACTIONS.ADD_MONEY:
      return {
        ...state,
        mainCompanyMoney: state.mainCompanyMoney + action.payload,
        totalMoneyEarned: state.totalMoneyEarned + action.payload
      };

    case ACTIONS.ADD_COMPANY:
      return {
        ...state,
        companies: [...state.companies, action.payload],
        totalCompaniesCreated: state.totalCompaniesCreated + 1
      };

    case ACTIONS.UPDATE_COMPANY:
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id ? action.payload : company
        )
      };

    case ACTIONS.REMOVE_COMPANY:
      return {
        ...state,
        companies: state.companies.filter(company => company.id !== action.payload)
      };

    case ACTIONS.UPDATE_RESOURCES:
      return {
        ...state,
        companyResources: { ...state.companyResources, ...action.payload }
      };

    case ACTIONS.UPDATE_RESEARCH_POINTS:
      return {
        ...state,
        researchPoints: typeof action.payload === 'function'
          ? action.payload(state.researchPoints)
          : action.payload
      };

    case ACTIONS.ADD_OFFICIAL:
      return {
        ...state,
        hiredOfficials: [...state.hiredOfficials, action.payload]
      };

    case ACTIONS.UPDATE_OFFICIAL:
      return {
        ...state,
        hiredOfficials: state.hiredOfficials.map(official =>
          official.id === action.payload.id ? action.payload : official
        )
      };

    case ACTIONS.REMOVE_OFFICIAL:
      return {
        ...state,
        hiredOfficials: state.hiredOfficials.filter(o => o.id !== action.payload)
      };

    case ACTIONS.SET_CANDIDATES:
      return {
        ...state,
        candidates: action.payload
      };

    case ACTIONS.START_HR_SEARCH:
      return {
        ...state,
        hrSearchUntil: action.payload.until,
        hrSearchFilter: action.payload.filter
      };

    case ACTIONS.SET_STOCK_MARKET_COMPANIES:
      return {
        ...state,
        stockMarketCompanies: action.payload
      };

    case ACTIONS.SET_ACTIVE_EVENT:
      return {
        ...state,
        activeEvent: action.payload
      };

    case ACTIONS.ADD_INVESTIGATION:
      return {
        ...state,
        purchasedInvestigations: [...state.purchasedInvestigations, action.payload]
      };

    case ACTIONS.LOAD_GAME_STATE:
      return {
        ...state,
        ...action.payload
      };

    case ACTIONS.RESET_GAME:
      return initialState;

    case ACTIONS.TICK: {
      const { companies, hiredOfficials, purchasedInvestigations, researchPoints, mainCompanyMoney, totalMoneyEarned, hrSearchUntil, hrSearchFilter, stockMarketCompanies, tickCount = 0 } = state;
      let newResearchPoints = researchPoints;
      let additionalMainMoney = 0;
      let newCandidates = state.candidates;
      let newHrSearchUntil = hrSearchUntil;
      let generatedResources = { ...state.companyResources };
      let newStockMarketCompanies = stockMarketCompanies;
      let newActiveEvent = state.activeEvent;

      // Random Event Trigger (0.5% chance per tick if no event active)
      if (!newActiveEvent && Math.random() < 0.005) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        newActiveEvent = randomEvent;
      }

      // Handle Stock Market Fluctuations (Every 150 ticks)
      const currentTick = tickCount + 1;
      if (currentTick % 150 === 0 && stockMarketCompanies && stockMarketCompanies.length > 0) {
        newStockMarketCompanies = stockMarketCompanies.map(company => {
          // Find tier config to enforce limits
          const tierConfig = TIER_CONFIG.find(t => t.name === company.tierLabel) ||
            TIER_CONFIG.find(t => t.tier === company.tier);
          // Fallback might be imprecise if multiple match tier, but tierLabel should match.

          // Random change +/- 5%
          const changePercent = (Math.random() * 10 - 5) / 100;
          let newValue = company.value * (1 + changePercent);

          // Force bounds
          if (tierConfig) {
            if (newValue < tierConfig.min) newValue = tierConfig.min;
            if (newValue > tierConfig.max) newValue = tierConfig.max;
          }

          const newSharePrice = newValue / company.shareCount;

          // Update History
          // Maintain last 15 prices
          // The current 'value' before this update becomes the newest history entry?
          // Or should we push the *new* value? 
          // Implementation plan said "Push old value to history", user said "track de hasta los ultimos 15 precios"
          // Let's treat valid chart data as: [p_14, p_13, ... p_1, p_current].
          // So we should push the *new* value to the history list if we want to show it, or keep it separate.
          // Let's assume history array holds PAST prices, and current price is just current.
          // BUT, usually a sparkline wants the whole series including current.
          // Let's push the PREVIOUS value to history, then truncate.
          const newHistory = [...(company.history || []), company.value];
          if (newHistory.length > 15) {
            newHistory.shift(); // Remove oldest
          }

          let movement = 'neutral';
          if (newValue > company.value) movement = 'up';
          else if (newValue < company.value) movement = 'down';

          return {
            ...company,
            value: newValue,
            sharePrice: newSharePrice,
            history: newHistory,
            movement
          };
        });
      }

      // Calculate global production rates per tick
      const globalProductionRates = {};
      companies.forEach(company => {
        if (!company.resource) return;
        let amount = 0;
        switch (company.tier) {
          case 0:
            const upgradeLevels = { 0: 0, 1: 1, 2: 5, 3: 7, 4: 15, 5: 30, 6: 45, 7: 70, 8: 100, 9: 125, 10: 150 };
            amount = upgradeLevels[company.upgradeLevel || 0] || 0;
            break;
          case 1: amount = 15; break;
          case 2: amount = 25; break;
          case 3: amount = 50; break;
          default: amount = 0;
        }
        globalProductionRates[company.resource] = (globalProductionRates[company.resource] || 0) + amount;
      });

      // Handle HR Search Completion
      if (hrSearchUntil && new Date() >= new Date(hrSearchUntil)) {
        newCandidates = Array(5).fill(null).map(() => generateOfficial(hrSearchFilter || null));
        newHrSearchUntil = null;
      }

      const updatedCompanies = companies.map(company => {
        if (company.tier === 0 && (!company.upgradeLevel || company.upgradeLevel === 0)) {
          return company;
        }

        // Calculate Tier Increment
        let baseIncrement = 0;
        switch (company.tier) {
          case 0: baseIncrement = company.upgradeLevel || 0; break;
          case 1: baseIncrement = 200; break;
          case 2: baseIncrement = 300; break;
          case 3: baseIncrement = 400; break;
          default: baseIncrement = 0;
        }

        // Resource Income (Consumption Synergy)
        let resourceIncome = 0;
        if (company.consumes) {
          company.consumes.forEach(resource => {
            const productionRate = globalProductionRates[resource] || 0;
            if (productionRate > 0) {
              resourceIncome += productionRate * resourcePrices[resource];
            }
          });
        }

        // Investigation Bonus
        const investigationBonus = getInvestigationBonus(company.type, purchasedInvestigations);
        const bonusAmount = (baseIncrement * investigationBonus) / 100;

        // Official Bonus
        let officialBonusAmount = 0;
        const companyOfficials = hiredOfficials.filter(official =>
          official.workingIn === company.name &&
          (!official.trainingUntil || new Date() >= new Date(official.trainingUntil))
        );
        companyOfficials.forEach(official => {
          officialBonusAmount += (baseIncrement * (official.totalStats * 0.01));
        });

        const totalEarnings = baseIncrement + resourceIncome + bonusAmount + officialBonusAmount;
        const dividend = (company.dividendRate || 0) / 100;
        const companyEarnings = totalEarnings * (1 - dividend);
        const mainCompanyDividend = totalEarnings * dividend;

        additionalMainMoney += mainCompanyDividend;

        // Research points generation
        let investigationChance = 0;
        switch (company.tier) {
          case 0: investigationChance = company.upgradeLevel || 0; break;
          case 1: investigationChance = 15; break;
          case 2: investigationChance = 25; break;
          case 3: investigationChance = 50; break;
          default: investigationChance = 0;
        }

        if (Math.random() * 100 < investigationChance) {
          newResearchPoints += 1;
        }

        // Resource generation
        if (company.resource) {
          let resourceAmount = 0;
          switch (company.tier) {
            case 0:
              const upgradeLevels = {
                0: 0, 1: 1, 2: 4, 3: 5, 4: 8, 5: 12, 6: 16, 7: 21, 8: 30, 9: 40, 10: 50
              };
              resourceAmount = upgradeLevels[company.upgradeLevel || 0] || 0;
              break;
            case 1: resourceAmount = 75; break;
            case 2: resourceAmount = 100; break;
            case 3: resourceAmount = 150; break;
            default: resourceAmount = 0;
          }
          if (resourceAmount > 0) {
            generatedResources[company.resource] = (generatedResources[company.resource] || 0) + resourceAmount;
          }
        }

        return {
          ...company,
          counter: (company.counter || 0) + companyEarnings,
          value: (company.value || 0) + companyEarnings
        };
      });

      // Update hired officials training status and apply bonuses
      const updatedOfficials = hiredOfficials.map(official => {
        if (official.trainingUntil && new Date() >= new Date(official.trainingUntil)) {
          // Training finished, apply the +1 stat bonus to highest stat
          const highestStatEntry = Object.entries(official.stats).reduce((a, b) => a[1] > b[1] ? a : b);
          const statName = highestStatEntry[0];

          return {
            ...official,
            trainingUntil: null,
            stats: {
              ...official.stats,
              [statName]: official.stats[statName] + 1
            },
            totalStats: official.totalStats + 1
          };
        }
        return official;
      });

      return {
        ...state,
        companies: updatedCompanies,
        hiredOfficials: updatedOfficials,
        researchPoints: newResearchPoints,
        mainCompanyMoney: mainCompanyMoney + additionalMainMoney,
        totalMoneyEarned: totalMoneyEarned + additionalMainMoney,
        candidates: newCandidates,
        hrSearchUntil: newHrSearchUntil,
        companyResources: generatedResources,
        stockMarketCompanies: newStockMarketCompanies,
        tickCount: currentTick,
        activeEvent: newActiveEvent
      };
    }

    default:
      return state;
  }
}

// Crear el contexto
const GameContext = createContext();

// Hook personalizado para usar el contexto
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Provider del contexto
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Global Tick Interval
  useEffect(() => {
    const tickInterval = setInterval(() => {
      dispatch({ type: ACTIONS.TICK });
    }, 1000);

    return () => clearInterval(tickInterval);
  }, []);

  // Auto-guardado cada vez que cambie algo relevante
  useEffect(() => {
    localStorage.setItem('wilowest_game_state', JSON.stringify(state));
  }, [state]);

  // Cargar estado guardado al iniciar
  useEffect(() => {
    const savedState = localStorage.getItem('wilowest_game_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: ACTIONS.LOAD_GAME_STATE, payload: parsedState });
      } catch (error) {
        console.error('Error loading game state:', error);
      }
    }
  }, []);

  // Funciones helper para dispatch
  const updateMoney = (amount) => {
    dispatch({ type: ACTIONS.UPDATE_MONEY, payload: amount });
  };

  const addCompany = (company) => {
    dispatch({ type: ACTIONS.ADD_COMPANY, payload: company });
  };

  const updateCompany = (company) => {
    dispatch({ type: ACTIONS.UPDATE_COMPANY, payload: company });
  };

  const removeCompany = (companyId) => {
    dispatch({ type: ACTIONS.REMOVE_COMPANY, payload: companyId });
  };

  const addMoney = (amount) => {
    dispatch({ type: ACTIONS.ADD_MONEY, payload: amount });
  };

  const updateResources = (resources) => {
    dispatch({ type: ACTIONS.UPDATE_RESOURCES, payload: resources });
  };

  const updateResearchPoints = (points) => {
    dispatch({ type: ACTIONS.UPDATE_RESEARCH_POINTS, payload: points });
  };

  const addOfficial = (official) => {
    dispatch({ type: ACTIONS.ADD_OFFICIAL, payload: official });
  };

  const updateOfficial = (official) => {
    dispatch({ type: ACTIONS.UPDATE_OFFICIAL, payload: official });
  };

  const addInvestigation = (investigationId) => {
    dispatch({ type: ACTIONS.ADD_INVESTIGATION, payload: investigationId });
  };

  const setCandidates = (candidates) => {
    dispatch({ type: ACTIONS.SET_CANDIDATES, payload: candidates });
  };

  const removeOfficial = (officialId) => {
    dispatch({ type: ACTIONS.REMOVE_OFFICIAL, payload: officialId });
  };

  const startHRSearch = (durationSeconds, filter = '') => {
    const until = new Date();
    until.setSeconds(until.getSeconds() + durationSeconds);
    dispatch({ type: ACTIONS.START_HR_SEARCH, payload: { until: until.toISOString(), filter } });
  };

  const setStockMarketCompanies = (companies) => {
    dispatch({ type: ACTIONS.SET_STOCK_MARKET_COMPANIES, payload: companies });
  };

  const closeEvent = () => {
    dispatch({ type: ACTIONS.SET_ACTIVE_EVENT, payload: null });
  };

  const resolveEventOption = (event, option) => {
    const isSuccess = Math.random() < option.successRate;
    const effect = isSuccess ? option.successEffect : option.failEffect;

    // Apply Effect
    if (effect) {
      switch (effect.type) {
        case 'money_multiplier':
          const bonus = Math.floor(state.mainCompanyMoney * (effect.value - 1));
          addMoney(bonus);
          break;
        case 'money_loss':
          addMoney(-effect.value);
          break;
        case 'lump_sum':
          addMoney(effect.value);
          break;
        case 'research_points':
          updateResearchPoints(prev => prev + effect.value);
          break;
        case 'resource_gain':
          if (effect.resource) {
            updateResources({
              [effect.resource]: (state.companyResources[effect.resource] || 0) + effect.value
            });
          }
          break;
        case 'resource_loss_all':
          const newResources = {};
          Object.keys(state.companyResources).forEach(res => {
            newResources[res] = Math.floor(state.companyResources[res] * (1 - effect.value));
          });
          updateResources(newResources);
          break;
        case 'production_dip':
          addMoney(-5000);
          break;
        default:
          break;
      }
    }

    return {
      success: isSuccess,
      message: effect ? effect.message : "No pasó nada.",
      onClose: closeEvent
    };
  };

  const resetGame = () => {
    dispatch({ type: ACTIONS.RESET_GAME });
  };

  const saveGameState = () => {
    localStorage.setItem('wilowest_game_state', JSON.stringify(state));
  };

  const value = {
    ...state,
    updateMoney,
    addCompany,
    updateCompany,
    removeCompany,
    updateResources,
    updateResearchPoints,
    addOfficial,
    updateOfficial,
    addInvestigation,
    resetGame,
    saveGameState,
    addMoney,
    setCandidates,
    removeOfficial,
    setCandidates,
    removeOfficial,
    startHRSearch,
    setStockMarketCompanies,
    resolveEventOption,
    closeEvent
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

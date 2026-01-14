import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { resourcePrices, getInvestigationBonus, generateOfficial } from '../data/gameData';

// Estado inicial del juego
const initialState = {
  mainCompanyMoney: 500000,
  totalCompaniesCreated: 0,
  totalMoneyEarned: 500000,
  researchPoints: 0,
  companyResources: {
    petroleo: 0,
    logistica: 0,
    finanzas: 0,
    hierro: 0,
    carbon: 0
  },
  hiredOfficials: [],
  companies: [],
  purchasedInvestigations: [],
  candidates: [],
  hrSearchUntil: null,
  hrSearchFilter: ''
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
  TICK: 'TICK'
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
      const { companies, hiredOfficials, purchasedInvestigations, researchPoints, mainCompanyMoney, totalMoneyEarned, hrSearchUntil, hrSearchFilter } = state;
      let newResearchPoints = researchPoints;
      let additionalMainMoney = 0;
      let newCandidates = state.candidates;
      let newHrSearchUntil = hrSearchUntil;

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
          case 1: baseIncrement = 125; break;
          case 2: baseIncrement = 175; break;
          case 3: baseIncrement = 220; break;
          default: baseIncrement = 0;
        }

        // Resource Income
        let resourceIncome = 0;
        if (company.consumes) {
          company.consumes.forEach(resource => {
            const available = company.resources?.[resource] || 0;
            if (available > 0) {
              resourceIncome += available * resourcePrices[resource];
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
        hrSearchUntil: newHrSearchUntil
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
    startHRSearch
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

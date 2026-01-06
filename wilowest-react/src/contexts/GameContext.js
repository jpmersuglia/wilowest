import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
  candidates: []
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
  RESET_GAME: 'RESET_GAME'
};

// Reducer para manejar el estado
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_MONEY:
      return {
        ...state,
        mainCompanyMoney: action.payload,
        totalMoneyEarned: action.payload
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
        researchPoints: action.payload
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

  // Auto-guardado cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('wilowest_game_state', JSON.stringify(state));
    }, 60000);

    return () => clearInterval(interval);
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
    saveGameState
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
} 
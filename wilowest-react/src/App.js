import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import MainPage from './components/MainPage';
import InvestigationTree from './components/InvestigationTree';
import RRHH from './components/RRHH';
import Statistics from './components/Statistics';
import StockMarket from './components/StockMarket';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/investigation" element={<InvestigationTree />} />
            <Route path="/rrhh" element={<RRHH />} />
            <Route path="/rrhh" element={<RRHH />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/stock-market" element={<StockMarket />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;

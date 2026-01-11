import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import '../styles/Header.css';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        mainCompanyMoney,
        researchPoints,
        saveGameState,
        resetGame
    } = useGame();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSaveGame = () => {
        saveGameState();
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

    const handleResetGame = () => {
        if (window.confirm('¿Estás seguro que deseas reiniciar el juego? ¡Perderás todo tu progreso!')) {
            resetGame();
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-top">
                    <div className="logo" onClick={() => navigate('/')}>
                        <h1>Wilowest</h1>
                    </div>

                    <div className="main-stats-container">
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
                    </div>

                    <button className="mobile-menu-btn" onClick={toggleMenu}>
                        <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
                    </button>
                </div>

                <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <img src="/media/companies-icon.svg" alt="" className="nav-icon" />
                        Compañías
                    </NavLink>
                    <NavLink
                        to="/investigation"
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <img src="/media/technology-icon.svg" alt="" className="nav-icon" />
                        Investigación
                    </NavLink>
                    <NavLink
                        to="/rrhh"
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <img src="/media/human-resources-icon.svg" alt="" className="nav-icon" />
                        RRHH
                    </NavLink>
                    <NavLink
                        to="/statistics"
                        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <img src="/media/usd-circle.svg" alt="" className="nav-icon" />
                        Estadísticas
                    </NavLink>
                </nav>

                <div className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
                    <button id="saveGame" onClick={handleSaveGame} className="action-btn">
                        Guardar
                    </button>
                    <button onClick={handleResetGame} className="action-btn reset-btn">
                        Reiniciar
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;

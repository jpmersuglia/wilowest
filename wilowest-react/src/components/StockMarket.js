import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { companyNames, companyTypes, TIER_CONFIG, firstNames, lastNames } from '../data/gameData';
import Header from './Header';
import StockMarketModal from './StockMarketModal';
import '../styles/StockMarket.css';



function StockMarket() {
    const { stockMarketCompanies, setStockMarketCompanies } = useGame();
    const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' });
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        if (!stockMarketCompanies || stockMarketCompanies.length === 0) {
            generateMarket();
        } else {
            // Migration: Check if CEOs are missing (for existing saves)
            const firstCompany = stockMarketCompanies[0];
            if (firstCompany && !firstCompany.ceo) {
                const updatedCompanies = stockMarketCompanies.map(company => {
                    const ceoFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                    const ceoLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                    return {
                        ...company,
                        ceo: `${ceoFirstName} ${ceoLastName}`
                    };
                });
                setStockMarketCompanies(updatedCompanies);
            }
        }
    }, [stockMarketCompanies, setStockMarketCompanies]);

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedCompanies = useMemo(() => {
        if (!stockMarketCompanies) return [];
        let sortableItems = [...stockMarketCompanies];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [stockMarketCompanies, sortConfig]);

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return <span className="sort-indicator">{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>;
    };

    const formatCurrency = (value) => {
        if (value >= 1000000000) {
            return '$' + (value / 1000000000).toFixed(2) + 'B';
        }
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(2) + 'M';
        }
        if (value >= 1000) {
            return '$' + (value / 1000).toFixed(0) + 'k';
        }
        return '$' + value.toFixed(2);
    };

    const generateMarket = () => {
        const newCompanies = [];
        const numCompanies = 50; // Generate 50 companies for now

        for (let i = 0; i < numCompanies; i++) {
            // Random Name
            const name = companyNames[Math.floor(Math.random() * companyNames.length)];

            // Random Type
            const typeKeys = Object.keys(companyTypes);
            const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];

            // Random Tier Config
            const tierConfig = TIER_CONFIG[Math.floor(Math.random() * TIER_CONFIG.length)];

            // Random Value
            const value = Math.floor(Math.random() * (tierConfig.max - tierConfig.min + 1)) + tierConfig.min;

            // Random Share Count (Round numbers)
            // Higher value -> more shares usually, but let's keep it random but round
            const shareOptions = [10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000];
            // Filter options based on value approx to keep share price realistic? 
            // User said "Cuanto mas valor tenga una compania mas acciones tendra para ofrecer"
            // Let's bias:
            let validShares = shareOptions;
            if (value > 1000000000) validShares = shareOptions.slice(5); // Big companies
            else if (value > 1000000) validShares = shareOptions.slice(3); // Mid companies
            else validShares = shareOptions.slice(0, 5); // Small companies

            const shareCount = validShares[Math.floor(Math.random() * validShares.length)];
            const sharePrice = value / shareCount;


            // Generate History (Random Walk)
            const history = [];
            let currentHistoryValue = value;
            for (let j = 0; j < 15; j++) {
                // Generate a previous value
                // We want: current = prev * (1 + change)
                // So prev = current / (1 + change)

                // Random change roughly +/- 5%
                const changePercent = (Math.random() * 10 - 5) / 100;

                // Reverse calculation to go backwards in time
                let historyValue = currentHistoryValue / (1 + changePercent);

                // Clamp within reasonable limits of the tier (optional, but good for consistency)
                if (historyValue < tierConfig.min) historyValue = tierConfig.min;
                if (historyValue > tierConfig.max) historyValue = tierConfig.max;

                history.unshift(historyValue); // Add to beginning (oldest first)
                currentHistoryValue = historyValue;
            }

            // Ensure current value is the last one in history (it's the "current" price)
            // Actually, based on requirements "track the last 15 prices", usually includes current.
            // Let's just make sure the history array is what we want.
            // Requirement: "track de hasta los ultimos 15 precios"

            // Movement indicator
            // Compare current value with the one immediately before it
            const previousValue = history[history.length - 1];
            let movement = 'neutral';
            if (value > previousValue) movement = 'up';
            else if (value < previousValue) movement = 'down';

            // Generate CEO
            const ceoFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ceoLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const ceo = `${ceoFirstName} ${ceoLastName}`;

            newCompanies.push({
                id: Math.random().toString(36).substr(2, 9),
                name,
                type,
                tierLabel: tierConfig.name,
                tier: tierConfig.tier,
                value,
                shareCount,
                sharePrice,
                history, // Store the array of prices
                movement, // 'up', 'down', 'neutral'
                ceo
            });
        }
        setStockMarketCompanies(newCompanies);
    };

    return (
        <div className="stock-market-page">
            <Header />
            <div className="stock-market-view">
                <h2>Stock Market</h2>
                <p>Participa en la Bolsa de Mercado Mundial, obteniendo participacion y posiblemente el control total y completo de companias. Dominar el mercado es una opcion, y tu tienes el control</p>

                <div className="stock-table-container">
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th
                                    className="sortable"
                                    onClick={() => handleSort('type')}
                                    title="Ordenar por Tipo"
                                >
                                    Tipo {getSortIndicator('type')}
                                </th>
                                <th
                                    className="sortable"
                                    onClick={() => handleSort('value')}
                                    title="Ordenar por Valor"
                                >
                                    Valor Total {getSortIndicator('value')}
                                </th>
                                <th>Precio por Acción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCompanies.map(company => (
                                <tr key={company.id} onClick={() => setSelectedCompany(company)} className="clickable-row">
                                    <td>
                                        <div className="company-name-cell">
                                            <span className="tier-badge" data-tier={company.tier}>
                                                {company.tierLabel}
                                            </span>
                                            <span className="name">{company.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="company-type-cell">
                                            <img
                                                src={`/media/${companyTypes[company.type].icon}`}
                                                alt={company.type}
                                                className="type-icon"
                                            />
                                            {company.type}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="money-value">{formatCurrency(company.value)}</span>
                                    </td>
                                    <td>
                                        <div className="share-price-cell">
                                            {company.movement === 'up' && <span className="price-movement up">▲</span>}
                                            {company.movement === 'down' && <span className="price-movement down">▼</span>}
                                            <span className="share-price">${company.sharePrice.toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td>{company.shareCount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedCompany && (
                <StockMarketModal
                    company={selectedCompany}
                    onClose={() => setSelectedCompany(null)}
                />
            )}
        </div>
    );
}

export default StockMarket;

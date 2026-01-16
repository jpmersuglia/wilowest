import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { companyNames, companyTypes } from '../data/gameData';
import Header from './Header';
import '../styles/StockMarket.css';

const TIER_CONFIG = [
    { name: 'Lv1', min: 120000, max: 120000, tier: 0 }, // Assuming 0 for "Levels"
    { name: 'Lv2', min: 150000, max: 175000, tier: 0 },
    { name: 'Lv3', min: 175000, max: 220000, tier: 0 },
    { name: 'Lv4', min: 220000, max: 275000, tier: 0 },
    { name: 'Lv5', min: 275000, max: 350000, tier: 0 },
    { name: 'Lv6', min: 350000, max: 475000, tier: 0 },
    { name: 'Lv7', min: 475000, max: 575000, tier: 0 },
    { name: 'Lv8', min: 575000, max: 850000, tier: 0 },
    { name: 'Lv9', min: 850000, max: 1200000, tier: 0 },
    { name: 'Lv10', min: 1200000, max: 5000000, tier: 0 },
    { name: 'Tier1', min: 5000000, max: 20000000, tier: 1 },
    { name: 'Tier2', min: 20000000, max: 100000000, tier: 2 },
    { name: 'Tier3', min: 100000000, max: 100000000000, tier: 3 }
];

function StockMarket() {
    const { stockMarketCompanies, setStockMarketCompanies } = useGame();
    const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' });

    useEffect(() => {
        if (!stockMarketCompanies || stockMarketCompanies.length === 0) {
            generateMarket();
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

            newCompanies.push({
                id: Math.random().toString(36).substr(2, 9),
                name,
                type,
                tierLabel: tierConfig.name,
                tier: tierConfig.tier,
                value,
                shareCount,
                sharePrice
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
                                <th>Nombre / Lv</th>
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
                                <th>Valor Acción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCompanies.map(company => (
                                <tr key={company.id}>
                                    <td>
                                        <div className="company-name-cell">
                                            <span className="name">{company.name}</span>
                                            <span className="tier-badge" data-tier={company.tier}>
                                                {company.tierLabel}
                                            </span>
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
                                        <span className="share-price">${company.sharePrice.toFixed(2)}</span>
                                    </td>
                                    <td>{company.shareCount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StockMarket;

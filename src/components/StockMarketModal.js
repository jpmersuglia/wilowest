import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { companyTypes, resourcePrices } from '../data/gameData';
import { useGame } from '../contexts/GameContext';
import '../styles/StockMarket.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function StockMarketModal({ company, onClose }) {
    const {
        mainCompanyMoney,
        addMoney,
        stockMarketCompanies,
        setStockMarketCompanies,
        addCompany,
        companies
    } = useGame();

    const [buyAmount, setBuyAmount] = useState(0);
    const [sellAmount, setSellAmount] = useState(0);

    // Reset amounts when company changes
    useEffect(() => {
        setBuyAmount(0);
        setSellAmount(0);
    }, [company]);

    if (!company) return null;

    // Derived State
    const ownedShares = company.ownedShares || 0;
    const availableShares = company.shareCount - ownedShares;
    const sharePrice = company.sharePrice;

    // Buy Logic Calculation
    const maxAffordableShares = Math.floor(mainCompanyMoney / sharePrice);
    const maxBuyShares = Math.min(availableShares, maxAffordableShares);
    const buyTotalCost = buyAmount * sharePrice;
    const canBuy = buyAmount > 0 && buyAmount <= maxBuyShares;

    // Sell Logic Calculation
    const maxSellShares = ownedShares;
    const sellTotalReturn = sellAmount * sharePrice;
    const canSell = sellAmount > 0 && sellAmount <= maxSellShares;

    // --- Handlers ---

    // Buy Handlers
    const handleBuyMoneyChange = (e) => {
        const moneyVal = parseFloat(e.target.value) || 0;
        // Convert money to shares (floor)
        const sharesVal = Math.floor(moneyVal / sharePrice);
        setBuyAmount(Math.min(sharesVal, maxBuyShares));
    };

    const handleBuySharesChange = (e) => {
        const sharesVal = parseInt(e.target.value) || 0;
        setBuyAmount(Math.min(sharesVal, maxBuyShares));
    };

    const executeBuy = () => {
        if (!canBuy) return;

        addMoney(-buyTotalCost);

        const updatedCompany = {
            ...company,
            ownedShares: ownedShares + buyAmount,
            averageBuyPrice: ((ownedShares * (company.averageBuyPrice || 0)) + buyTotalCost) / (ownedShares + buyAmount)
        };

        if (updatedCompany.ownedShares >= updatedCompany.shareCount) {
            handleAcquisition(updatedCompany);
        } else {
            const updatedList = stockMarketCompanies.map(c =>
                c.id === company.id ? updatedCompany : c
            );
            setStockMarketCompanies(updatedList);
        }
        setBuyAmount(0);
    };

    // Sell Handlers
    const handleSellReturnChange = (e) => {
        const moneyVal = parseFloat(e.target.value) || 0;
        const sharesVal = Math.floor(moneyVal / sharePrice);
        setSellAmount(Math.min(sharesVal, maxSellShares));
    };

    const handleSellSharesChange = (e) => {
        const sharesVal = parseInt(e.target.value) || 0;
        setSellAmount(Math.min(sharesVal, maxSellShares));
    };

    const executeSell = () => {
        if (!canSell) return;

        addMoney(sellTotalReturn);

        const updatedCompany = {
            ...company,
            ownedShares: ownedShares - sellAmount,
        };

        const updatedList = stockMarketCompanies.map(c =>
            c.id === company.id ? updatedCompany : c
        );
        setStockMarketCompanies(updatedList);
        setSellAmount(0);
    };

    // Acquisition Helper
    const calculateGlobalProductionRates = (currentCompanies) => {
        const rates = {};
        currentCompanies.forEach(c => {
            if (!c.resource) return;
            let amount = 0;
            const uLevel = c.upgradeLevel || 0;
            switch (c.tier) {
                case 0:
                    const levels = { 0: 0, 1: 1, 2: 5, 3: 7, 4: 15, 5: 30, 6: 45, 7: 70, 8: 100, 9: 125, 10: 150 };
                    amount = levels[uLevel] || 0;
                    break;
                case 1: amount = 15; break;
                case 2: amount = 25; break;
                case 3: amount = 50; break;
                default: amount = 0;
            }
            if (amount > 0) {
                rates[c.resource] = (rates[c.resource] || 0) + amount;
            }
        });
        return rates;
    };

    const handleAcquisition = (acquiredCompany) => {
        const updatedList = stockMarketCompanies.filter(c => c.id !== acquiredCompany.id);
        setStockMarketCompanies(updatedList);

        const staticData = companyTypes[acquiredCompany.type];
        let initialUpgradeLevel = 1;
        if (acquiredCompany.tierLabel && acquiredCompany.tierLabel.startsWith('Lv')) {
            initialUpgradeLevel = parseInt(acquiredCompany.tierLabel.replace('Lv', ''), 10) || 1;
        }

        let baseIncrement = 0;
        switch (acquiredCompany.tier) {
            case 0: baseIncrement = initialUpgradeLevel; break;
            case 1: baseIncrement = 200; break;
            case 2: baseIncrement = 300; break;
            case 3: baseIncrement = 400; break;
            default: baseIncrement = 0;
        }

        let resourceIncome = 0;
        const globalRates = calculateGlobalProductionRates(companies);

        if (staticData.consumes) {
            staticData.consumes.forEach(res => {
                const productionRate = globalRates[res] || 0;
                if (productionRate > 0) {
                    resourceIncome += productionRate * (resourcePrices[res] || 0);
                }
            });
        }

        const projectedEarnings = baseIncrement + resourceIncome;

        const newMainCompany = {
            id: acquiredCompany.id,
            name: acquiredCompany.name,
            type: acquiredCompany.type,
            tier: acquiredCompany.tier,
            tierLabel: acquiredCompany.tierLabel,
            upgradeLevel: initialUpgradeLevel,
            value: acquiredCompany.value,
            resource: staticData.resource,
            consumes: staticData.consumes,
            resources: {},
            founded: new Date().toISOString(),
            earnings: projectedEarnings,
            ...acquiredCompany
        };

        addCompany(newMainCompany);
        onClose();
    };


    // Chart Data
    const chartDataValues = company.history ? company.history.map(val => val / company.shareCount) : [];
    const chartData = {
        labels: Array.from({ length: chartDataValues.length }, (_, i) => i + 1),
        datasets: [{
            label: 'Precio Histórico (Acción)',
            data: chartDataValues,
            fill: false,
            borderColor: '#4caf50',
            tension: 0.1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Historial de Precios', color: '#e0e0e0' },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return '$' + context.parsed.y.toFixed(2);
                    }
                }
            }
        },
        scales: {
            x: { display: false },
            y: {
                ticks: {
                    color: '#a0a0a0',
                    callback: function (value) { return '$' + value.toFixed(2); }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    };

    // Calculate profit/loss
    const currentValOfOwned = ownedShares * company.sharePrice;
    const costOfOwned = ownedShares * (company.averageBuyPrice || company.sharePrice);
    const profitLoss = currentValOfOwned - costOfOwned;

    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content stock-modal" onClick={handleContentClick}>

                <div className="modal-header">
                    <div className="modal-title-box">
                        <div className="header-top-row">
                            <span className="tier-badge" data-tier={company.tier}>{company.tierLabel}</span>
                        </div>
                        <h2>{company.name}</h2>
                        <span className="company-type-badge">{company.type}</span>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body-grid">
                    <div className="modal-info-column">
                        <div className="info-item">
                            <label>CEO</label>
                            <span>{company.ceo || 'Unknown'}</span>
                        </div>
                        <div className="info-item">
                            <label>Valor de Acción</label>
                            <span className="high-value">${company.sharePrice.toFixed(2)}</span>
                        </div>
                        <div className="info-item">
                            <label>Total Acciones</label>
                            <span>{company.shareCount.toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                            <label>Cap. de Mercado</label>
                            <span>${company.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        {ownedShares > 0 && (
                            <>
                                <div className="info-divider"></div>
                                <div className="info-item">
                                    <label>Acciones en Tenencia</label>
                                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                                        {ownedShares.toLocaleString()} ({(ownedShares / company.shareCount * 100).toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="info-item">
                                    <label>Ganancias / Pérdidas</label>
                                    <span style={{ color: profitLoss >= 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                        {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-chart-column">
                        <div className="stock-chart-container">
                            <Line data={chartData} options={options} />
                        </div>
                    </div>
                </div>

                {/* TRADING SECTION */}
                <div className="trading-grid">

                    {/* BUY PANEL (Left) */}
                    <div className="trade-panel buy-panel">
                        <h3>Comprar</h3>

                        <div className="slider-group">
                            <label>Monto en Dinero: <span className="highlight-val">${buyTotalCost.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max={maxBuyShares * sharePrice}
                                value={buyAmount * sharePrice}
                                step={sharePrice} /* Snap to share price multiples */
                                onChange={handleBuyMoneyChange}
                                className="styled-range buy-range"
                            />
                        </div>

                        <div className="slider-group">
                            <label>Cantidad de Acciones: <span className="highlight-val">{buyAmount.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max={maxBuyShares}
                                value={buyAmount}
                                onChange={handleBuySharesChange}
                                className="styled-range buy-range"
                            />
                        </div>

                        <div className="panel-footer">
                            <div className="trade-summary">
                                <span>Total:</span>
                                <span className={canBuy ? 'valid-cost' : 'invalid-cost'}>
                                    ${buyTotalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <button
                                className="action-btn buy-btn"
                                disabled={!canBuy}
                                onClick={executeBuy}
                            >
                                CONFIRMAR COMPRA
                            </button>
                        </div>
                    </div>

                    {/* SELL PANEL (Right) */}
                    <div className="trade-panel sell-panel">
                        <h3>Vender</h3>

                        <div className="slider-group">
                            <label>Retorno en Dinero: <span className="highlight-val">${sellTotalReturn.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max={maxSellShares * sharePrice}
                                value={sellAmount * sharePrice}
                                step={sharePrice}
                                onChange={handleSellReturnChange}
                                disabled={ownedShares === 0}
                                className="styled-range sell-range"
                            />
                        </div>

                        <div className="slider-group">
                            <label>Cantidad de Acciones: <span className="highlight-val">{sellAmount.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max={maxSellShares}
                                value={sellAmount}
                                onChange={handleSellSharesChange}
                                disabled={ownedShares === 0}
                                className="styled-range sell-range"
                            />
                        </div>

                        <div className="panel-footer">
                            <div className="trade-summary">
                                <span>Retorno:</span>
                                <span className="valid-cost">
                                    ${sellTotalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <button
                                className="action-btn sell-btn"
                                disabled={!canSell}
                                onClick={executeSell}
                            >
                                CONFIRMAR VENTA
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default StockMarketModal;

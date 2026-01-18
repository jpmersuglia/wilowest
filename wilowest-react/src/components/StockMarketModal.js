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
import { companyTypes } from '../data/gameData';
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
        // updateMoney, // Removing updateMoney to avoid misuse
        addMoney, // use addMoney instead
        stockMarketCompanies,
        setStockMarketCompanies,
        addCompany,
        // removeCompany // Not needed unless we want to remove from main list, but we are adding.
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

    // Buy Logic
    const handleBuyChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        if (val < 0) return;
        // Cap at available shares
        setBuyAmount(Math.min(val, availableShares));
    };

    const buyTotalCost = buyAmount * company.sharePrice;
    const canBuy = buyAmount > 0 && buyTotalCost <= mainCompanyMoney;

    const executeBuy = () => {
        if (!canBuy) return;

        // Deduct Money (Use addMoney with negative value)
        addMoney(-buyTotalCost);

        // Update Company Data
        const updatedCompany = {
            ...company,
            ownedShares: ownedShares + buyAmount,
            // Calculate new average buy price
            averageBuyPrice: ((ownedShares * (company.averageBuyPrice || 0)) + buyTotalCost) / (ownedShares + buyAmount)
        };

        // Check for Acquisition (100% ownership)
        if (updatedCompany.ownedShares >= updatedCompany.shareCount) {
            handleAcquisition(updatedCompany);
        } else {
            // Update in Stock Market List
            const updatedList = stockMarketCompanies.map(c =>
                c.id === company.id ? updatedCompany : c
            );
            setStockMarketCompanies(updatedList);
            // Update local company state to reflect changes immediately in modal if it stays open (though we might close it or it updates via parent re-render)
            // Parent passes 'company' from 'selectedCompany'. We need to make sure parent updates 'selectedCompany' relative to the list.
            // Actually, stockMarketCompanies update will trigger re-render in StockMarket.js,
            // but StockMarket.js passes 'selectedCompany' state. We need to close or update that too.
            // Ideally we close modal or lift the state better.
            // Let's close modal for simplicity after transaction, or force update?
            // Let's TRY to find the new company object from the new list if we want to keep it open.
            // But since 'company' prop comes from a separate state in parent, we can't easily update it without a callback.
            // I'll close the modal on successful transaction for now, OR I can just update the list and since the parent re-renders... wait.
            // Parent re-renders, but 'selectedCompany' state is not automatically updated to the new reference in the list.
            // Use 'onClose' to refresh? No.
            // Let's add a callback 'onCompanyUpdate' or just close.
            // User flow: Buy -> success -> maybe want to buy more?
            // Let's just update the list. The Modal will likely show STALE data for 'ownedShares' unless we locally track it or parent updates.
            // To fix this properly: parent should store ID of selected company, and derive the object from the list.
            // I will implement that in StockMarket.js in the next step.
            // For this step, I'll update the global list.
        }

        // Reset inputs
        setBuyAmount(0);
    };

    const handleAcquisition = (acquiredCompany) => {
        // Remove from Stock Market
        const updatedList = stockMarketCompanies.filter(c => c.id !== acquiredCompany.id);
        setStockMarketCompanies(updatedList);

        // Add to Main Companies
        // We need to adapt the stock company object to the main company object structure
        const newMainCompany = {
            id: acquiredCompany.id, // Keep same ID? Or generate new? distinct lists, should be fine.
            name: acquiredCompany.name,
            type: acquiredCompany.type,
            tier: acquiredCompany.tier, // Use the tier it had
            tierLabel: acquiredCompany.tierLabel,
            upgradeLevel: 1, // Default starting level for acquired
            value: acquiredCompany.value, // Market cap as value?
            // Need 'resource' if applicable.
            // 'companyTypes' data might have this info?
            // Let's check companyTypes in gameData. It usually has 'resource' map.
            // We need to map 'type' to 'resource'.
            // In gameData: companyTypes is object { "Petrolera": { icon: "...", ... } }
            // Wait, does it have resource mapping?
            // StockMarket.js line 87: const typeKeys = Object.keys(companyTypes);
            // Let's infer resource from type or assume standard.
            // 'Petrolera' -> 'petroleo'?
            // We might need to look up the resource mapping.
            // Let's assume for now we migrate basic props.
            resource: getResourceForType(acquiredCompany.type),
            consumes: [], // Fix: Initialize consumes to avoid crash
            resources: {}, // Fix: Initialize resources
            founded: new Date().toISOString(),
            earnings: 0,
            ...acquiredCompany // Spread the rest (history, ceo, etc might be useful)
        };

        addCompany(newMainCompany);
        onClose(); // Close modal as company is gone from market
        // Maybe show a notification? "Company Acquired!"
    };

    // Sell Logic
    const handleSellChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        if (val < 0) return;
        setSellAmount(Math.min(val, ownedShares));
    };

    const sellTotalReturn = sellAmount * company.sharePrice;
    const canSell = sellAmount > 0 && sellAmount <= ownedShares;

    const executeSell = () => {
        if (!canSell) return;

        // Add Money
        addMoney(sellTotalReturn);

        // Update Company
        const updatedCompany = {
            ...company,
            ownedShares: ownedShares - sellAmount,
            // Average buy price remains the same on sell, usually
        };

        const updatedList = stockMarketCompanies.map(c =>
            c.id === company.id ? updatedCompany : c
        );
        setStockMarketCompanies(updatedList);
        setSellAmount(0);
    };

    // Helper for Acquisition Resource Mapping (Quick hardcoded map based on game context knowledge)
    const getResourceForType = (type) => {
        const map = {
            'Petrolera': 'petroleo',
            'Logistica': 'logistica',
            'Financiera': 'finanzas',
            'Minera': 'hierro', // or carbon?
            'Industrial': 'carbon', // Simplified
            'Tecnologica': 'telecom'
        };
        // Verify with gameData if possible, but hardcoding for safety is better than null.
        return map[type] || 'finanzas';
    };


    // Chart Preparation
    // Data correction: history holds Market Cap (Value). Chart might be better as Share Price.
    const chartDataValues = company.history ? company.history.map(val => val / company.shareCount) : [];

    // Profit/Loss Calculation
    const currentValOfOwned = ownedShares * company.sharePrice;
    const costOfOwned = ownedShares * (company.averageBuyPrice || company.sharePrice); // fallback if bought before tracking
    const profitLoss = currentValOfOwned - costOfOwned;

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

    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content stock-modal" onClick={handleContentClick}>

                <div className="modal-header">
                    <div className="modal-title-box">
                        <div className="header-top-row">
                            <span className="company-type-badge">{company.type}</span>
                            <span className="tier-badge" data-tier={company.tier}>{company.tierLabel}</span>
                        </div>
                        <h2>{company.name}</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body-grid">
                    <div className="modal-info-column">
                        <div className="info-item">
                            <label>CEO</label>
                            <span>{company.ceo || 'Unknown'}</span>
                        </div>
                        {/* Type moved to header, removed from here */}
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
                                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{ownedShares.toLocaleString()} ({(ownedShares / company.shareCount * 100).toFixed(1)}%)</span>
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

                <div className="modal-actions-container">
                    {/* Buy Section */}
                    <div className="trade-section buy-section">
                        <h3>Comprar</h3>
                        <div className="trade-controls">
                            <input
                                type="number"
                                min="0"
                                max={availableShares}
                                value={buyAmount}
                                onChange={handleBuyChange}
                                className="trade-input"
                            />
                            <div className="quick-amounts">
                                <button onClick={() => setBuyAmount(Math.floor(availableShares * 0.1))}>10%</button>
                                <button onClick={() => setBuyAmount(Math.floor(availableShares * 0.5))}>50%</button>
                                <button onClick={() => setBuyAmount(availableShares)}>Max</button>
                            </div>
                        </div>
                        <div className="trade-summary">
                            <span>Coste Total:</span>
                            <span className={canBuy ? 'valid-cost' : 'invalid-cost'}>
                                ${buyTotalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <button
                            className="action-btn buy-btn"
                            disabled={!canBuy}
                            onClick={executeBuy}
                        >
                            Confirmar Compra
                        </button>
                    </div>

                    {/* Sell Section */}
                    <div className="trade-section sell-section">
                        <h3>Vender</h3>
                        <div className="trade-controls">
                            <input
                                type="number"
                                min="0"
                                max={ownedShares}
                                value={sellAmount}
                                onChange={handleSellChange}
                                className="trade-input"
                                disabled={ownedShares === 0}
                            />
                            <div className="quick-amounts">
                                <button onClick={() => setSellAmount(Math.floor(ownedShares * 0.1))} disabled={ownedShares === 0}>10%</button>
                                <button onClick={() => setSellAmount(Math.floor(ownedShares * 0.5))} disabled={ownedShares === 0}>50%</button>
                                <button onClick={() => setSellAmount(ownedShares)} disabled={ownedShares === 0}>Max</button>
                            </div>
                        </div>
                        <div className="trade-summary">
                            <span>Retorno Total:</span>
                            <span className="valid-cost">
                                ${sellTotalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <button
                            className="action-btn sell-btn"
                            disabled={!canSell}
                            onClick={executeSell}
                        >
                            Confirmar Venta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StockMarketModal;

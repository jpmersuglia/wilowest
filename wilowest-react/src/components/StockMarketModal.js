import React from 'react';
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
    if (!company) return null;

    const data = {
        // Labels usually time, but we just have 15 points. Let's use generic indices or empty strings
        labels: Array(company.history.length).fill(''),
        datasets: [
            {
                label: 'Precio de Acción',
                data: company.history, // history contains TOTAL VALUE or SHARE PRICE?
                // Wait, previous implementation pushed `value` (total value) to history.
                // We should probably chart Share Price, or convert it. 
                // Since user sees share price more directly, let's normalize it to share price.
                // Or if history is value, we map it: v / shareCount
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
                pointRadius: 2
            }
        ]
    };

    // Data correction: history holds Market Cap (Value). Chart might be better as Share Price.
    const chartDataValues = company.history.map(val => val / company.shareCount);
    // Add current price as the last point ?
    // In StockMarket.js generation, I made history have 15 points ending with current.
    // In GameContext.js update, I added logic to push to history. 
    // Let's assume history is the source of truth for the chart.

    const chartData = {
        labels: Array.from({ length: company.history.length }, (_, i) => i + 1),
        datasets: [{
            label: 'Precio Histórico',
            data: chartDataValues,
            fill: false,
            borderColor: '#4caf50',
            tension: 0.1
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Historial de Precios',
                color: '#e0e0e0'
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                ticks: {
                    color: '#a0a0a0',
                    callback: function (value) {
                        return '$' + value.toFixed(2);
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    // Stop propagation on modal content click
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content stock-modal" onClick={handleContentClick}>

                <div className="modal-header">
                    <div className="modal-title-box">
                        <span className="tier-badge" data-tier={company.tier}>{company.tierLabel}</span>
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
                        <div className="info-item">
                            <label>Tipo</label>
                            <span>{company.type}</span>
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
                    </div>

                    <div className="modal-chart-column">
                        <div className="stock-chart-container">
                            <Line data={chartData} options={options} />
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="action-btn buy-btn">Comprar Acciones</button>
                    <button className="action-btn sell-btn">Vender Acciones</button>
                </div>
            </div>
        </div>
    );
}

export default StockMarketModal;

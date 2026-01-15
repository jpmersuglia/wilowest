import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { companyTypes, resourcePrices, getInvestigationBonus, getInvestigationDataById } from '../data/gameData';
import Header from './Header';
import CompanyDetailsModal from './CompanyDetailsModal';
import '../styles/Statistics.css';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

function Statistics() {
    const {
        companies,
        totalCompaniesCreated,
        totalMoneyEarned,
        purchasedInvestigations,
        hiredOfficials
    } = useGame();

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCompanyClick = (company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    // Calculate global production rates per tick for synergy
    const globalProductionRates = {};
    companies.forEach(company => {
        if (!company.resource) return;
        let amount = 0;
        switch (company.tier) {
            case 0:
                const upgradeLevels = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 };
                amount = upgradeLevels[company.upgradeLevel || 0] || 0;
                break;
            case 1: amount = 15; break;
            case 2: amount = 25; break;
            case 3: amount = 50; break;
            default: amount = 0;
        }
        globalProductionRates[company.resource] = (globalProductionRates[company.resource] || 0) + amount;
    });

    const calculateCompanyStats = (company) => {
        // This logic mimics CompanyBox.js auto-income calculation
        const investigationBonus = getInvestigationBonus(company.type, purchasedInvestigations);

        // Tier increment calculation
        let baseIncrement = 0;
        switch (company.tier) {
            case 0: baseIncrement = company.upgradeLevel || 0; break;
            case 1: baseIncrement = 125; break;
            case 2: baseIncrement = 175; break;
            case 3: baseIncrement = 220; break;
            default: baseIncrement = 0;
        }

        // Resource income (Synergy)
        let resourceIncome = 0;
        company.consumes.forEach(resource => {
            const productionRate = globalProductionRates[resource] || 0;
            if (productionRate > 0) {
                resourceIncome += productionRate * resourcePrices[resource];
            }
        });

        // Official bonus
        let officialBonus = 0;
        const companyOfficials = hiredOfficials.filter(official =>
            official.workingIn === company.name &&
            (!official.trainingUntil || new Date() >= new Date(official.trainingUntil))
        );
        companyOfficials.forEach(official => {
            officialBonus += official.totalStats * 0.01;
        });

        const bonusFromInv = (baseIncrement * investigationBonus) / 100;
        const bonusFromOff = (baseIncrement * officialBonus) / 100;

        const totalMoneyPerTick = baseIncrement + resourceIncome + bonusFromInv + bonusFromOff;
        const moneyPerMin = totalMoneyPerTick * 60; // Assuming 1 tick per second
        const dividendsPerMin = moneyPerMin * (company.dividendRate / 100);
        const profitPerMin = moneyPerMin - dividendsPerMin;

        // Research chance
        let investigationChance = 0;
        switch (company.tier) {
            case 0: investigationChance = company.upgradeLevel || 0; break;
            case 1: investigationChance = 15; break;
            case 2: investigationChance = 25; break;
            case 3: investigationChance = 50; break;
            default: investigationChance = 0;
        }
        const researchPerMin = (investigationChance / 100) * 60;

        // Breakdown for modal
        const synergyBreakdown = company.consumes.map(resource => ({
            name: resource,
            perTick: (globalProductionRates[resource] || 0) * resourcePrices[resource]
        })).filter(s => s.perTick > 0);

        const companyInfo = companyTypes[company.type];
        const idPrefix = companyInfo?.idPrefix;
        const appliedInvestigations = purchasedInvestigations
            .filter(id => idPrefix && id.startsWith(idPrefix + '.'))
            .map(id => {
                const data = getInvestigationDataById(id);
                return {
                    name: data?.name || id,
                    bonus: (baseIncrement * (data?.effect || 0)) / 100
                };
            });

        return {
            name: company.name,
            value: company.value || 0,
            moneyPerMin,
            profitPerMin,
            dividendsPerMin,
            researchPerMin,
            resourceName: company.resource,
            resourcePerMin: (company.tier === 0 ? (company.upgradeLevel || 0) : (company.tier === 1 ? 15 : (company.tier === 2 ? 25 : 50))) * 60,
            breakdown: {
                baseIncome: baseIncrement,
                synergy: synergyBreakdown,
                investigations: appliedInvestigations,
                totalPerTick: totalMoneyPerTick
            }
        };
    };

    const companyStats = companies.map(calculateCompanyStats);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#e0e0e0',
                    font: { size: 10 }
                }
            }
        }
    };

    const companyValuesData = {
        labels: companyStats.map(s => s.name),
        datasets: [{
            label: 'Valor de Empresa ($)',
            data: companyStats.map(s => s.value),
            backgroundColor: [
                '#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#ffeb3b', '#795548'
            ],
            borderWidth: 1
        }]
    };

    const dividendsData = {
        labels: companyStats.map(s => s.name),
        datasets: [{
            label: 'Dividendos ($/min)',
            data: companyStats.map(s => s.dividendsPerMin),
            backgroundColor: '#f44336'
        }]
    };

    const moneyPerMinData = {
        labels: companyStats.map(s => s.name),
        datasets: [{
            label: 'Dinero ($/min)',
            data: companyStats.map(s => s.moneyPerMin),
            backgroundColor: '#4caf50'
        }]
    };

    const researchPerMinData = {
        labels: companyStats.map(s => s.name),
        datasets: [{
            label: 'Investigación (pts/min)',
            data: companyStats.map(s => s.researchPerMin),
            backgroundColor: '#9c27b0'
        }]
    };

    return (
        <div className="statistics-page">
            <Header />

            <main className="statistics-content">
                <section className="global-stats">
                    <div className="stat-card">
                        <h3>Compañías Creadas</h3>
                        <p className="stat-value">{totalCompaniesCreated}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Dinero Total Ganado</h3>
                        <p className="stat-value">${totalMoneyEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Compañías Activas</h3>
                        <p className="stat-value">{companies.length}</p>
                    </div>
                </section>

                <section className="statistics-charts">
                    <div className="chart-container">
                        <h3>Valor de Empresas</h3>
                        <div className="chart-wrapper">
                            <Pie data={companyValuesData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3>Dividendos Pagados ($/min)</h3>
                        <div className="chart-wrapper">
                            <Bar data={dividendsData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3>Dinero Generado ($/min)</h3>
                        <div className="chart-wrapper">
                            <Bar data={moneyPerMinData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3>Investigación (pts/min)</h3>
                        <div className="chart-wrapper">
                            <Bar data={researchPerMinData} options={chartOptions} />
                        </div>
                    </div>
                </section>

                <section className="companies-stats">
                    <h2>Detalle por Compañía</h2>
                    <div className="stats-table-container">
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>Compañía</th>
                                    <th>Tipo / Nivel</th>
                                    <th>Dinero / mín</th>
                                    <th>Investigación / mín</th>
                                    <th>Recursos / min</th>
                                    <th>Dividendos / mín</th>
                                    <th>Ganancia Neta / mín</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(company => {
                                    const stats = calculateCompanyStats(company);
                                    return (
                                        <tr key={company.id}>
                                            <td>
                                                <div
                                                    className="company-name-cell clickable"
                                                    onClick={() => handleCompanyClick(company)}
                                                    title="Ver detalles"
                                                >
                                                    <img src={`/media/${companyTypes[company.type].icon}`} alt="" className="table-icon" />
                                                    <span>{company.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {company.type} {company.tier === 0 ? `(Niv ${company.upgradeLevel || 0})` : `(Tier ${company.tier})`}
                                            </td>
                                            <td className="money-plus">+ ${stats.moneyPerMin.toFixed(2)}</td>
                                            <td className="research-plus">+ {stats.researchPerMin.toFixed(2)} pts</td>
                                            <td>{stats.resourceName[0].toUpperCase() + stats.resourceName.slice(1)}: {stats.resourcePerMin}</td>
                                            <td className="money-minus">- ${stats.dividendsPerMin.toFixed(2)} ({company.dividendRate}%)</td>
                                            <td className="money-profit">${stats.profitPerMin.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                                {companies.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="no-data">No hay compañías activas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {isModalOpen && selectedCompany && (
                <CompanyDetailsModal
                    company={selectedCompany}
                    stats={calculateCompanyStats(selectedCompany)}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

export default Statistics;

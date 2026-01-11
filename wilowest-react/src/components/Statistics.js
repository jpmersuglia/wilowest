import React from 'react';
import { useGame } from '../contexts/GameContext';
import { companyTypes, resourcePrices, getInvestigationBonus } from '../data/gameData';
import Header from './Header';
import '../styles/Statistics.css';

function Statistics() {
    const {
        companies,
        totalCompaniesCreated,
        totalMoneyEarned,
        purchasedInvestigations,
        hiredOfficials,
        companyResources
    } = useGame();

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

        // Resource income
        let resourceIncome = 0;
        company.consumes.forEach(resource => {
            const available = company.resources?.[resource] || 0;
            if (available > 0) {
                resourceIncome += available * resourcePrices[resource];
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

        return {
            moneyPerMin,
            profitPerMin,
            dividendsPerMin,
            researchPerMin
        };
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
                                                <div className="company-name-cell">
                                                    <img src={`/media/${companyTypes[company.type].icon}`} alt="" className="table-icon" />
                                                    <span>{company.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {company.type} {company.tier === 0 ? `(Niv ${company.upgradeLevel || 0})` : `(Tier ${company.tier})`}
                                            </td>
                                            <td className="money-plus">+ ${stats.moneyPerMin.toFixed(2)}</td>
                                            <td className="research-plus">+ {stats.researchPerMin.toFixed(2)} pts</td>
                                            <td className="money-minus">- ${stats.dividendsPerMin.toFixed(2)} ({company.dividendRate}%)</td>
                                            <td className="money-profit">${stats.profitPerMin.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                                {companies.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="no-data">No hay compañías activas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Statistics;

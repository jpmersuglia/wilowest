import React from 'react';
import { companyTypes } from '../data/gameData';
import '../styles/Modal.css';

function CompanyDetailsModal({ company, stats, onClose }) {
    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    const roles = ["CEO", "CFO", "COO", "CTO", "CMO", "CHRO", "CLO", "CRO"];

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content company-details-modal">
                <button className="close-btn top-right" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <div className="modal-preview-header">
                        <img
                            src={`/media/${companyTypes[company.type].icon}`}
                            className="companyImage"
                            alt={company.type}
                        />
                        <h2 className="companyName">{company.name}</h2>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="company-basic-info">
                        <p className="detail-row"><strong>Tipo:</strong> {company.type} {company.tier === 0 ? `(Nivel ${company.upgradeLevel})` : `(Tier ${company.tier})`}</p>
                        <p className="detail-row"><strong>Valor:</strong> ${company.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>

                    <div className="income-breakdown">
                        <h3>Desglose de Ingresos (Tick)</h3>
                        <ul className="breakdown-list">
                            <li className="breakdown-item positive">
                                <span className="label">+ Ingreso Base</span>
                                <span className="amount">${stats.breakdown.baseIncome.toFixed(2)}</span>
                            </li>

                            {stats.breakdown.synergy.map(s => (
                                <li key={s.name} className="breakdown-item positive">
                                    <span className="label">+ {s.name[0].toUpperCase() + s.name.slice(1)} (Sinergia)</span>
                                    <span className="amount">${s.perTick.toFixed(2)}</span>
                                </li>
                            ))}

                            {stats.breakdown.investigations.map((inv, idx) => (
                                <li key={idx} className="breakdown-item positive">
                                    <span className="label">+ {inv.name} (Inv.)</span>
                                    <span className="amount">${inv.bonus.toFixed(2)}</span>
                                </li>
                            ))}

                            <li className={`breakdown-item ${company.dividendRate > 0 ? '' : 'total'}`}>
                                <span className="label">{company.dividendRate > 0 ? "Sub Total" : "Ganancias Totales"}</span>
                                <span className="amount">${stats.breakdown.totalPerTick.toFixed(2)}</span>
                            </li>

                            {company.dividendRate > 0 && (
                                <>
                                    <li className="breakdown-item negative">
                                        <span className="label">- Dividendos ({company.dividendRate}%)</span>
                                        <span className="amount">-${(stats.breakdown.totalPerTick * (company.dividendRate / 100)).toFixed(2)}</span>
                                    </li>
                                    <li className="breakdown-item total">
                                        <span className="label">Ganancias Totales</span>
                                        <span className="amount">${(stats.breakdown.totalPerTick * (1 - company.dividendRate / 100)).toFixed(2)}</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="executive-structure">
                        <h3>Estructura Ejecutiva</h3>
                        <div className="roles-grid">
                            {roles.map(role => (
                                <div key={role} className="role-tag">[{role}]</div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export default CompanyDetailsModal;

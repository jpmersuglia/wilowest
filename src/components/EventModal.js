import React, { useState } from 'react';
import '../styles/EventModal.css';

const EventModal = ({ event, onOptionClick }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [result, setResult] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [hoveredOption, setHoveredOption] = useState(null);

    // Default to first option if none hovered, or keep null until hover?
    // User image shows red box (options) and blue box (outcome).
    // Let's default to the first option so the right side isn't empty initially.
    const activeOptionIndex = hoveredOption !== null ? hoveredOption : 0;
    const activeOption = event.options[activeOptionIndex];

    const handleOptionSelect = (option, index) => {
        if (selectedOption !== null) return;

        setSelectedOption(index);

        const outcome = onOptionClick(event, option, index);
        setResult(outcome);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            // Logic handled by parent callback 'onClose' usually
        }, 500);
    };

    // Calculate success bar color roughly
    const getSuccessColor = (rate) => {
        if (rate >= 0.7) return '#4caf50'; // Green/Blue-ish success
        if (rate >= 0.4) return '#ff9800'; // Orange/Warning
        return '#f44336'; // Red/Danger
    };

    return (
        <div className={`modal-overlay ${isClosing ? 'fade-out' : ''}`}>
            <div className="modal-content event-modal">
                <div className="event-header">
                    <h2>{event.eventName} <span style={{ color: '#aaa', fontSize: '0.8em' }}>afecta a</span> {event.targetCompany ? event.targetCompany.name : 'Unknown'}</h2>
                </div>

                <div className="event-body">
                    <p className="event-description">{event.eventDescription}</p>

                    {result ? (
                        <div className={`event-result ${result.success ? 'success' : 'failure'}`}>
                            <h3>{result.success ? '¡Éxito!' : 'Fallo'}</h3>
                            <p>{result.message}</p>
                            <button className="continue-btn" onClick={result.onClose}>Continuar</button>
                        </div>
                    ) : (
                        <div className="event-interaction-container">
                            <div className="event-options-column">
                                {event.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`event-option-btn ${activeOptionIndex === index ? 'active' : ''}`}
                                        onClick={() => handleOptionSelect(option, index)}
                                        onMouseEnter={() => setHoveredOption(index)}
                                    >
                                        <span className="option-desc">{option.description}</span>
                                        {/* Success rate removed from here as requested */}
                                    </button>
                                ))}
                            </div>

                            <div className="event-outcome-column">
                                <h3>Resultados Esperados</h3>
                                <p className="outcome-description">
                                    {activeOption ? activeOption.outcomeDescription : "Selecciona una opción para ver detalles."}
                                </p>

                                {activeOption && (
                                    <div className="success-rate-container">
                                        <div className="success-rate-label">
                                            <span>Probabilidad de Éxito</span>
                                            <span>{Math.round(activeOption.successRate * 100)}%</span>
                                        </div>
                                        <div className="success-bar-bg">
                                            <div
                                                className="success-bar-fill"
                                                style={{
                                                    width: `${activeOption.successRate * 100}%`,
                                                    backgroundColor: getSuccessColor(activeOption.successRate)
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventModal;

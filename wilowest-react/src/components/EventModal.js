import React, { useState } from 'react';
import '../styles/EventModal.css';

const EventModal = ({ event, onOptionClick }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [result, setResult] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    if (!event) return null;

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

    return (
        <div className={`modal-overlay ${isClosing ? 'fade-out' : ''}`}>
            <div className="modal-content event-modal">
                <div className="event-header">
                    <h2>{event.eventName} | EVENTO</h2>
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
                        <div className="event-options">
                            {event.options.map((option, index) => (
                                <button
                                    key={index}
                                    className="event-option-btn"
                                    onClick={() => handleOptionSelect(option, index)}
                                >
                                    <span className="option-desc">{option.description}</span>
                                    <span className="option-rate">Éxito: {Math.round(option.successRate * 100)}%</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventModal;

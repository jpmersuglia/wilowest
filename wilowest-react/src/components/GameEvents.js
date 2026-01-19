import React from 'react';
import { useGame } from '../contexts/GameContext';
import EventModal from './EventModal';

const GameEvents = () => {
    const { activeEvent, resolveEventOption } = useGame();

    if (!activeEvent) return null;

    return (
        <EventModal
            event={activeEvent}
            onOptionClick={resolveEventOption}
        />
    );
};

export default GameEvents;

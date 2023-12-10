import React from 'react';
import './css/styles.css';

// Univerzalni komponenta, která otevře modální okno s chybovou hláškou 
const MessageOverlay = ({ message, visible, onClose }) => {
    if (!visible) return null;

    return (
        <div className="message-overlay">
            <div className="message-content">
                {message}
                <button onClick={onClose}>Zavřít</button>
            </div>
        </div>
    );
};

export default MessageOverlay;
import React from 'react';
import './css/styles.css';

// Univerzalni komponenta, která otevře modální okno s chybovou hláškou 
const MessageOverlay = ({ message, visible, onClose, t }) => {
    if (!visible) return null;

    return (
        <div className="messageOverlay">
            <div className="messageContent">
                {message}
                <button onClick={onClose}>{t("MessageOverlay.close")}</button>
            </div>
        </div>
    );
};

export default MessageOverlay;
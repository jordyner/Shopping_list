import React from 'react';
import './css/styles.css';

// Slouzi jen ktomu aby vykreslil kolecko kdyz se nacitaji polozky
const Spinner = () => {
    return (
        <div className="spinner-container">
            <div className="spinner"></div>
        </div>
    );
};

export default Spinner;
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import { I18nextProvider } from 'react-i18next';

import global_en from "./translation/en/global.json"
import global_cs from "./translation/cs/global.json"
import i18next from "i18next"

i18next.init({
    interpolation: {escapeValue: false},
    lng: "en",
    resources: {
        en: {
            global: global_en,
        },
        cs: {
            global: global_cs,
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <I18nextProvider i18n={i18next}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/app/:listId" element={<App />} />
                </Routes>
            </BrowserRouter>
        </I18nextProvider>
    </React.StrictMode>
);


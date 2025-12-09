import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { auroraTheme } from './styles/theme';
import './styles/globals.css';
import './i18n';
import { useSettingsStore } from './stores/settingsStore';

// Apply saved language settings on initial load
const initializeLanguage = () => {
  const savedSettings = localStorage.getItem('ultimate-downloader-settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      const lang = parsed.state?.language || 'en';
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    } catch (e) {
      console.error('Failed to parse saved settings:', e);
    }
  }
};

initializeLanguage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={auroraTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FluentProvider>
  </React.StrictMode>
);

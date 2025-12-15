import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FluentProvider } from '@fluentui/react-components';
import Layout from './components/Layout/Layout';
import HomePage from './pages/Home/HomePage';
import DownloadsPage from './pages/Downloads/DownloadsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import LibraryPage from './pages/Library/LibraryPage';
import DonatePage from './pages/Donate/DonatePage';
import { useSettingsStore } from './stores/settingsStore';
import { auroraTheme, auroraLightTheme } from './styles/theme';
import { useEffect, useState } from 'react';

function App() {
  const { theme } = useSettingsStore();
  const [currentTheme, setCurrentTheme] = useState(auroraTheme);

  useEffect(() => {
    // Handle theme changes
    if (theme === 'light') {
      setCurrentTheme(auroraLightTheme);
      document.body.style.background = '#F5F5F5';
    } else if (theme === 'dark') {
      setCurrentTheme(auroraTheme);
      document.body.style.background = '#0A0B14';
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentTheme(prefersDark ? auroraTheme : auroraLightTheme);
      document.body.style.background = prefersDark ? '#0A0B14' : '#F5F5F5';
    }
  }, [theme]);

  return (
    <FluentProvider theme={currentTheme}>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/donate" element={<DonatePage />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </FluentProvider>
  );
}

export default App;

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalStyles } from './styles/GlobalStyles';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfileViewPage } from './pages/ProfileViewPage';
import { SettingsPage } from './pages/SettingsPage';
import { MetricsPage } from './pages/MetricsPage';
import { ApiKeyGuard } from './components/ApiKeyGuard';
import { useApiKeyStore } from './store/apiKeyStore';
import styled from 'styled-components';
import { theme } from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const Nav = styled.nav`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
  margin-bottom: ${theme.spacing.xl};
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: ${theme.spacing.lg};
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  text-decoration: none;
  color: ${(props) => (props.$active ? theme.colors.primary : theme.colors.text)};
  font-weight: 500;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.background};
  }
`;

function Navigation() {
  const location = useLocation();
  return (
    <Nav>
      <NavContent>
        <NavLink to="/" $active={location.pathname === '/'}>
          Генератор
        </NavLink>
        <NavLink to="/history" $active={location.pathname === '/history'}>
          История
        </NavLink>
        <NavLink to="/metrics" $active={location.pathname === '/metrics'}>
          Метрики
        </NavLink>
        <NavLink to="/settings" $active={location.pathname === '/settings'}>
          Настройки
        </NavLink>
      </NavContent>
    </Nav>
  );
}

function App() {
  const loadFromStorage = useApiKeyStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <BrowserRouter>
        <AppContainer>
          <Navigation />
          <Routes>
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/"
              element={
                <ApiKeyGuard>
                  <HomePage />
                </ApiKeyGuard>
              }
            />
            <Route
              path="/history"
              element={
                <ApiKeyGuard>
                  <HistoryPage />
                </ApiKeyGuard>
              }
            />
            <Route
              path="/metrics"
              element={
                <ApiKeyGuard>
                  <MetricsPage />
                </ApiKeyGuard>
              }
            />
            <Route
              path="/profiles/:id"
              element={
                <ApiKeyGuard>
                  <ProfileViewPage />
                </ApiKeyGuard>
              }
            />
          </Routes>
        </AppContainer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


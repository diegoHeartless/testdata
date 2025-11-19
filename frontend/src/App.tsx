import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalStyles } from './styles/GlobalStyles';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfileViewPage } from './pages/ProfileViewPage';
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

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${theme.colors.text};
  font-weight: 500;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.background};
  }
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <BrowserRouter>
        <AppContainer>
          <Nav>
            <NavContent>
              <NavLink to="/">Генератор</NavLink>
              <NavLink to="/history">История</NavLink>
            </NavContent>
          </Nav>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profiles/:id" element={<ProfileViewPage />} />
          </Routes>
        </AppContainer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


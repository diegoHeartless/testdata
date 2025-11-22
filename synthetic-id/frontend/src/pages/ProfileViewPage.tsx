import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useProfile } from '../hooks/useProfile';
import { ProfilePreview } from '../components/ProfilePreview';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export function ProfileViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, error } = useProfile(id || null);

  if (isLoading) {
    return (
      <Container>
        <div>Загрузка профиля...</div>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container>
        <div>Профиль не найден</div>
        <StyledLink to="/">
          <Button>Вернуться на главную</Button>
        </StyledLink>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <StyledLink to="/history">
          <Button variant="secondary">← Назад</Button>
        </StyledLink>
        <h1>Профиль #{profile.id.slice(0, 8)}</h1>
      </Header>
      <ProfilePreview profile={profile} />
    </Container>
  );
}








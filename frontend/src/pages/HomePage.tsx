import styled from 'styled-components';
import { ProfileGeneratorForm } from '../components/ProfileGeneratorForm';
import { ProfilePreview } from '../components/ProfilePreview';
import { useProfileStore } from '../store/profileStore';
import { theme } from '../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.text};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${theme.spacing.xl};

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textSecondary};
`;

export function HomePage() {
  const { currentProfile } = useProfileStore();

  return (
    <Container>
      <Title>Synthetic ID Generator</Title>
      <Grid>
        <div>
          <ProfileGeneratorForm />
        </div>
        <div>
          {currentProfile ? (
            <ProfilePreview profile={currentProfile} />
          ) : (
            <EmptyState>
              <p>Сгенерируйте профиль, используя форму слева</p>
            </EmptyState>
          )}
        </div>
      </Grid>
    </Container>
  );
}






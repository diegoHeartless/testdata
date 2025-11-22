import styled from 'styled-components';
import { useProfilesList, useDeleteProfile } from '../hooks/useProfile';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { Link } from 'react-router-dom';

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

const ProfileItem = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const ProfileMeta = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

export function HistoryPage() {
  const { data, isLoading, error } = useProfilesList(1, 20);
  const deleteMutation = useDeleteProfile();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этот профиль?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Title>История генераций</Title>
        <div>Загрузка...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>История генераций</Title>
        <div>Ошибка загрузки профилей</div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>История генераций</Title>
      {data?.profiles.length === 0 ? (
        <Card>
          <div>Нет сгенерированных профилей</div>
        </Card>
      ) : (
        <>
          {data?.profiles.map((profile) => (
            <StyledLink key={profile.id} to={`/profiles/${profile.id}`}>
              <ProfileItem>
                <ProfileInfo>
                  <ProfileName>
                    {profile.personal.last_name} {profile.personal.first_name}{' '}
                    {profile.personal.middle_name}
                  </ProfileName>
                  <ProfileMeta>
                    {new Date(profile.created_at).toLocaleString('ru-RU')}
                  </ProfileMeta>
                </ProfileInfo>
                <Actions>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => handleDelete(profile.id, e)}
                    disabled={deleteMutation.isPending}
                  >
                    Удалить
                  </Button>
                </Actions>
              </ProfileItem>
            </StyledLink>
          ))}
        </>
      )}
    </Container>
  );
}


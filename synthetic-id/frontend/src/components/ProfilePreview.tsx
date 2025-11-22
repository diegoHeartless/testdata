import styled from 'styled-components';
import { Profile } from '../types';
import { Card, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { theme } from '../styles/theme';
import { useExportProfile } from '../hooks/useProfile';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const ProfileName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const InfoValue = styled.span`
  color: ${theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

interface ProfilePreviewProps {
  profile: Profile;
}

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  const exportMutation = useExportProfile();

  const handleExport = async (format: 'json' | 'pdf') => {
    try {
      const blob = await exportMutation.mutateAsync({ id: profile.id, format });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-${profile.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Ошибка при экспорте профиля');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Container>
      <Card>
        <Header>
          <ProfileName>
            {profile.personal.last_name} {profile.personal.first_name}{' '}
            {profile.personal.middle_name}
          </ProfileName>
        </Header>

        <CardTitle>Личная информация</CardTitle>
        <CardContent>
          <InfoRow>
            <InfoLabel>Пол:</InfoLabel>
            <InfoValue>{profile.personal.gender === 'male' ? 'Мужской' : 'Женский'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Дата рождения:</InfoLabel>
            <InfoValue>{formatDate(profile.personal.birth_date)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Возраст:</InfoLabel>
            <InfoValue>{profile.personal.age} лет</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Место рождения:</InfoLabel>
            <InfoValue>{profile.personal.birth_place}</InfoValue>
          </InfoRow>
        </CardContent>
      </Card>

      <Card>
        <CardTitle>Адрес</CardTitle>
        <CardContent>
          <InfoRow>
            <InfoLabel>Регион:</InfoLabel>
            <InfoValue>{profile.address.region_name}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Город:</InfoLabel>
            <InfoValue>{profile.address.city}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Адрес:</InfoLabel>
            <InfoValue>
              {profile.address.street}, д. {profile.address.house}
              {profile.address.apartment && `, кв. ${profile.address.apartment}`}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Почтовый индекс:</InfoLabel>
            <InfoValue>{profile.address.postal_code}</InfoValue>
          </InfoRow>
        </CardContent>
      </Card>

      {profile.passport && (
        <Card>
          <CardTitle>Паспорт</CardTitle>
          <CardContent>
            <InfoRow>
              <InfoLabel>Серия и номер:</InfoLabel>
              <InfoValue>
                {profile.passport.series} {profile.passport.number}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Выдан:</InfoLabel>
              <InfoValue>{profile.passport.issued_by}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Код подразделения:</InfoLabel>
              <InfoValue>{profile.passport.division_code}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Дата выдачи:</InfoLabel>
              <InfoValue>{formatDate(profile.passport.issue_date)}</InfoValue>
            </InfoRow>
          </CardContent>
        </Card>
      )}

      {profile.inn && (
        <Card>
          <CardTitle>ИНН</CardTitle>
          <CardContent>
            <InfoValue>{profile.inn}</InfoValue>
          </CardContent>
        </Card>
      )}

      {profile.snils && (
        <Card>
          <CardTitle>СНИЛС</CardTitle>
          <CardContent>
            <InfoValue>{profile.snils}</InfoValue>
          </CardContent>
        </Card>
      )}

      <ButtonGroup>
        <Button
          onClick={() => handleExport('json')}
          disabled={exportMutation.isPending}
        >
          Скачать JSON
        </Button>
        <Button
          onClick={() => handleExport('pdf')}
          disabled={exportMutation.isPending}
          variant="secondary"
        >
          Скачать PDF
        </Button>
      </ButtonGroup>
    </Container>
  );
}








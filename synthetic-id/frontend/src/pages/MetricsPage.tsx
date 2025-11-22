import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Card, CardTitle } from '../components/Card';
import { theme } from '../styles/theme';
import { UserUsageMetrics, UserProfileMetrics } from '../types/metrics';

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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const MetricCard = styled(Card)`
  padding: ${theme.spacing.lg};
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin: ${theme.spacing.md} 0;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.textSecondary};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;

  &:last-child {
    border-bottom: none;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textSecondary};
`;

const Error = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.error}20;
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error};
`;

export function MetricsPage() {
  const {
    data: usageMetrics,
    isLoading: isLoadingUsage,
    error: usageError,
  } = useQuery<UserUsageMetrics>({
    queryKey: ['metrics', 'usage'],
    queryFn: () => apiClient.getUserUsageMetrics(),
    retry: 1,
  });

  const {
    data: profileMetrics,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery<UserProfileMetrics>({
    queryKey: ['metrics', 'profiles'],
    queryFn: () => apiClient.getUserProfileMetrics(),
    retry: 1,
  });

  if (isLoadingUsage || isLoadingProfile) {
    return (
      <Container>
        <Title>Метрики</Title>
        <Loading>Загрузка метрик...</Loading>
      </Container>
    );
  }

  if (usageError || profileError) {
    return (
      <Container>
        <Title>Метрики</Title>
        <Error>
          Ошибка загрузки метрик:{' '}
          {usageError instanceof Error ? usageError.message : 'Неизвестная ошибка'}
        </Error>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Метрики использования</Title>

      <Section>
        <Grid>
          <MetricCard>
            <CardTitle>Всего запросов</CardTitle>
            <MetricValue>{usageMetrics?.totalRequests || 0}</MetricValue>
            <MetricLabel>За всё время</MetricLabel>
          </MetricCard>

          <MetricCard>
            <CardTitle>Запросы за 24 часа</CardTitle>
            <MetricValue>{usageMetrics?.requestsLast24h || 0}</MetricValue>
            <MetricLabel>Последние сутки</MetricLabel>
          </MetricCard>

          <MetricCard>
            <CardTitle>Профилей сгенерировано</CardTitle>
            <MetricValue>{usageMetrics?.profilesGenerated || 0}</MetricValue>
            <MetricLabel>Всего</MetricLabel>
          </MetricCard>

          <MetricCard>
            <CardTitle>Rate Limit</CardTitle>
            <MetricValue>
              {usageMetrics?.rateLimit.remaining || 0} / {usageMetrics?.rateLimit.limit || 100}
            </MetricValue>
            <MetricLabel>Осталось запросов в минуту</MetricLabel>
          </MetricCard>
        </Grid>
      </Section>

      {profileMetrics && (
        <Section>
          <Card>
            <CardTitle>Статистика по профилям</CardTitle>
            <Grid>
              <MetricCard>
                <CardTitle>Всего профилей</CardTitle>
                <MetricValue>{profileMetrics.total}</MetricValue>
              </MetricCard>

              <MetricCard>
                <CardTitle>По регионам</CardTitle>
                <List>
                  {Object.entries(profileMetrics.byRegion)
                    .slice(0, 5)
                    .map(([region, count]) => (
                      <ListItem key={region}>
                        <span>{region}</span>
                        <strong>{count}</strong>
                      </ListItem>
                    ))}
                </List>
              </MetricCard>

              <MetricCard>
                <CardTitle>По документам</CardTitle>
                <List>
                  <ListItem>
                    <span>Паспорт</span>
                    <strong>{profileMetrics.byDocumentType.passport || 0}</strong>
                  </ListItem>
                  <ListItem>
                    <span>ИНН</span>
                    <strong>{profileMetrics.byDocumentType.inn || 0}</strong>
                  </ListItem>
                  <ListItem>
                    <span>СНИЛС</span>
                    <strong>{profileMetrics.byDocumentType.snils || 0}</strong>
                  </ListItem>
                </List>
              </MetricCard>
            </Grid>
          </Card>
        </Section>
      )}
    </Container>
  );
}


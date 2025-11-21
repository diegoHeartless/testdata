import { useState } from 'react';
import styled from 'styled-components';
import { Card, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { useApiKeyStore } from '../store/apiKeyStore';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  font-family: monospace;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`;

const SuccessMessage = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.success}20;
  border: 1px solid ${theme.colors.success};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.success};
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.error}20;
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error};
`;

export function SettingsPage() {
  const { apiKey, setApiKey, clearApiKey, isConfigured } = useApiKeyStore();
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [baseUrlInput, setBaseUrlInput] = useState(
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  );
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!keyInput.trim()) {
        throw new Error('API key is required');
      }
      setApiKey(keyInput.trim());
      setMessage({ type: 'success', text: 'API key saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save API key',
      });
    }
  };

  const handleClear = () => {
    clearApiKey();
    setKeyInput('');
    setMessage({ type: 'success', text: 'API key cleared' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <Container>
      <Title>Настройки</Title>
      <Card>
        <CardTitle>API конфигурация</CardTitle>
        <Form onSubmit={handleSubmit}>
          {message && (
            <>
              {message.type === 'success' ? (
                <SuccessMessage>{message.text}</SuccessMessage>
              ) : (
                <ErrorMessage>{message.text}</ErrorMessage>
              )}
            </>
          )}

          <FormGroup>
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk_live_..."
            />
            <HelpText>
              Введите ваш API ключ. Получить ключ можно через команду:{' '}
              <code>npm run key:create</code> на бекенде.
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="api-url">API Base URL</Label>
            <Input
              id="api-url"
              type="text"
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              placeholder="http://localhost:3000/api/v1"
            />
            <HelpText>Базовый URL API сервера.</HelpText>
          </FormGroup>

          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            <Button type="submit">Сохранить</Button>
            {isConfigured() && (
              <Button type="button" onClick={handleClear} variant="secondary">
                Очистить
              </Button>
            )}
          </div>

          {isConfigured() && (
            <HelpText style={{ color: theme.colors.success }}>
              ✓ API ключ настроен
            </HelpText>
          )}
        </Form>
      </Card>
    </Container>
  );
}


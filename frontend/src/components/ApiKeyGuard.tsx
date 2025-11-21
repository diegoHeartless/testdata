import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKeyStore } from '../store/apiKeyStore';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

export function ApiKeyGuard({ children }: ApiKeyGuardProps) {
  const navigate = useNavigate();
  const isConfigured = useApiKeyStore((state) => state.isConfigured());

  useEffect(() => {
    if (!isConfigured()) {
      navigate('/settings', { replace: true });
    }
  }, [isConfigured, navigate]);

  if (!isConfigured()) {
    return null;
  }

  return <>{children}</>;
}


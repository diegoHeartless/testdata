import styled from 'styled-components';
import { theme } from '../styles/theme';

export const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  margin-bottom: ${theme.spacing.md};
`;

export const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
`;

export const CardContent = styled.div`
  color: ${theme.colors.textSecondary};
`;








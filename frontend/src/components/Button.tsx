import styled from 'styled-components';
import { theme } from '../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Button = styled.button<ButtonProps>`
  padding: ${(props) => {
    switch (props.size) {
      case 'sm':
        return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg':
        return `${theme.spacing.md} ${theme.spacing.xl}`;
      default:
        return `${theme.spacing.sm} ${theme.spacing.lg}`;
    }
  }};
  font-size: ${(props) => {
    switch (props.size) {
      case 'sm':
        return '0.875rem';
      case 'lg':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};
  font-weight: 500;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  background-color: ${(props) => {
    if (props.disabled) return theme.colors.border;
    switch (props.variant) {
      case 'secondary':
        return theme.colors.secondary;
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  color: white;

  &:hover {
    background-color: ${(props) => {
      if (props.disabled) return theme.colors.border;
      switch (props.variant) {
        case 'secondary':
          return '#475569';
        case 'danger':
          return '#dc2626';
        default:
          return theme.colors.primaryDark;
      }
    }};
    transform: ${(props) => (props.disabled ? 'none' : 'translateY(-1px)')};
    box-shadow: ${(props) => (props.disabled ? 'none' : theme.shadows.md)};
  }

  &:active {
    transform: ${(props) => (props.disabled ? 'none' : 'translateY(0)')};
  }
`;







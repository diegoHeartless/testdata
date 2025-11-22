import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { GenerationForm } from '../types';
import { Button } from './Button';
import { Card, CardTitle } from './Card';
import { theme } from '../styles/theme';
import { useGenerateProfile } from '../hooks/useProfile';
import { useProfileStore } from '../store/profileStore';

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

const RadioGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
`;

const RangeInput = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  width: 100px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: 0.875rem;
  margin-top: ${theme.spacing.xs};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export function ProfileGeneratorForm() {
  const { register, handleSubmit, watch } = useForm<GenerationForm>({
    defaultValues: {
      gender: 'random',
      age_range: [25, 35],
      include_documents: {
        passport: true,
        inn: true,
        snils: true,
        driver_license: false,
        oms: false,
      },
    },
  });

  const generateMutation = useGenerateProfile();
  const { setCurrentProfile } = useProfileStore();

  const ageMin = watch('age_range.0');
  const ageMax = watch('age_range.1');

  const onSubmit = async (data: GenerationForm) => {
    try {
      const includeDocuments = Object.entries(data.include_documents)
        .filter(([_, checked]) => checked)
        .map(([key]) => key);

      const params = {
        gender: data.gender,
        age_range: data.age_range,
        region: data.region || undefined,
        include_documents: includeDocuments,
      };

      const profile = await generateMutation.mutateAsync(params);
      setCurrentProfile(profile);
    } catch (error) {
      console.error('Failed to generate profile:', error);
    }
  };

  return (
    <Card>
      <CardTitle>Настройки генерации</CardTitle>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Пол</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                value="male"
                {...register('gender')}
              />
              Мужской
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                value="female"
                {...register('gender')}
              />
              Женский
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                value="random"
                {...register('gender')}
              />
              Случайный
            </RadioLabel>
          </RadioGroup>
        </FormGroup>

        <FormGroup>
          <Label>Возраст</Label>
          <RangeInput>
            <Input
              type="number"
              min="18"
              max="100"
              {...register('age_range.0', {
                valueAsNumber: true,
                min: 18,
                max: 100,
              })}
            />
            <span>—</span>
            <Input
              type="number"
              min="18"
              max="100"
              {...register('age_range.1', {
                valueAsNumber: true,
                min: 18,
                max: 100,
              })}
            />
          </RangeInput>
          {ageMin && ageMax && ageMin > ageMax && (
            <ErrorMessage>Минимальный возраст должен быть меньше максимального</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="region">Регион (опционально)</Label>
          <Select id="region" {...register('region')}>
            <option value="">Любой регион</option>
            <option value="77">Москва</option>
            <option value="78">Санкт-Петербург</option>
            <option value="50">Московская область</option>
            <option value="47">Ленинградская область</option>
            <option value="66">Свердловская область</option>
            <option value="54">Новосибирская область</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Документы</Label>
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                {...register('include_documents.passport')}
              />
              Паспорт
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                {...register('include_documents.inn')}
              />
              ИНН
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                {...register('include_documents.snils')}
              />
              СНИЛС
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                {...register('include_documents.driver_license')}
              />
              Водительские права
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                {...register('include_documents.oms')}
              />
              Полис ОМС
            </CheckboxLabel>
          </CheckboxGroup>
        </FormGroup>

        <Button
          type="submit"
          disabled={generateMutation.isPending || !!(ageMin && ageMax && ageMin > ageMax)}
        >
          {generateMutation.isPending ? (
            <>
              <LoadingSpinner /> Генерация...
            </>
          ) : (
            'Сгенерировать профиль'
          )}
        </Button>

        {generateMutation.isError && (
          <ErrorMessage>
            Ошибка: {generateMutation.error instanceof Error ? generateMutation.error.message : 'Неизвестная ошибка'}
          </ErrorMessage>
        )}
      </Form>
    </Card>
  );
}


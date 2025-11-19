import { CurrencyCode, FinanceProfile } from '../../../types';
import { PersonProfilePayload } from '../person/person.types';

/**
 * Диапазон значений (минимум, максимум включительно).
 */
export type RangeTuple = [number, number];

/**
 * Параметры генерации финансовых данных для человека.
 */
export interface FinanceGeneratorParams {
  /**
   * Идентификатор человека (используется для связей).
   */
  person_id: string;
  /**
   * Базовые данные человека (для деривации имён, сценариев).
   */
  person: PersonProfilePayload;
  /**
   * Предпочтительная валюта.
   */
  currency?: CurrencyCode;
  /**
   * Диапазон количества карт.
   */
  cards_range?: RangeTuple;
  /**
   * Диапазон количества транзакций.
   */
  transactions_range?: RangeTuple;
}

/**
 * Payload FinanceModule.
 */
export type FinanceProfilePayload = FinanceProfile;



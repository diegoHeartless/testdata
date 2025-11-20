import { Address, GenerationParams, PersonalInfo, Passport } from '../../../types';

/**
 * Контактная информация, генерируемая PersonModule.
 */
export interface PersonContacts {
  /**
   * Основной телефон в формате E.164 и человекочитаемом виде.
   */
  phone: {
    e164: string;
    formatted: string;
  };
  /**
   * Email, привязанный к профилю.
   */
  email: string;
}

/**
 * Сгенерированные документы человека.
 */
export interface PersonDocuments {
  passport?: Passport;
  inn?: string;
  snils?: string;
}

/**
 * Payload, который возвращает PersonModule.
 */
export interface PersonProfilePayload {
  personal: PersonalInfo;
  address: Address;
  contacts: PersonContacts;
  documents: PersonDocuments;
}

/**
 * Входные параметры генерации для PersonModule.
 */
export interface PersonGeneratorParams extends GenerationParams {
  /**
   * Требуемый формат вывода телефона.
   */
  phone_format?: 'international' | 'national';
}



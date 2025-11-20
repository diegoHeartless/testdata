export interface Profile {
  id: string;
  personal: PersonalInfo;
  address: Address;
  passport?: Passport;
  inn?: string;
  snils?: string;
  driver_license?: DriverLicense;
  oms?: OMS;
  created_at: string;
  expires_at?: string;
}

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: 'male' | 'female';
  birth_date: string; // YYYY-MM-DD
  age: number;
  birth_place: string;
}

export interface Address {
  region: string;
  region_name: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postal_code: string;
}

export interface Passport {
  series: string; // Format: "45 01"
  number: string; // 6 digits
  issued_by: string;
  division_code: string; // Format: "770-001"
  issue_date: string; // YYYY-MM-DD
}

export interface DriverLicense {
  series: string; // Format: "77АВ"
  number: string; // 6 digits
  categories: string[]; // ["B", "C"]
  issue_date: string;
  expiry_date: string;
}

export interface OMS {
  number: string; // 16 digits
  issue_date: string;
}

/**
 * Код валюты ISO 4217, используемый в финансовых данных.
 */
export type CurrencyCode = 'RUB' | 'USD' | 'EUR';

/**
 * Банковская карта, привязанная к профилю.
 */
export interface PaymentCard {
  /**
   * Уникальный идентификатор карты.
   */
  id: string;
  /**
   * Идентификатор владельца (ссылочный ключ).
   */
  person_id: string;
  /**
   * Платёжная система (VISA, MIR и т.д.).
   */
  brand: string;
  /**
   * Тип продукта (debit, credit).
   */
  type: string;
  /**
   * Банк-эмитент.
   */
  issuer: string;
  /**
   * Полный PAN (для синтетических сценариев).
   */
  pan: string;
  /**
   * Маскированный PAN вида 427655******1234.
   */
  pan_masked: string;
  /**
   * Месяц окончания действия (MM).
   */
  exp_month: string;
  /**
   * Год окончания действия (YY).
   */
  exp_year: string;
  /**
   * Последние 4 цифры карты.
   */
  last4: string;
  /**
   * CVV/CVC код (для тестовых окружений).
   */
  cvv: string;
  /**
   * Дата выпуска карты.
   */
  issued_at: string;
}

/**
 * Транзакция по карте.
 */
export interface CardTransaction {
  /**
   * Уникальный идентификатор транзакции.
   */
  id: string;
  /**
   * Владелец транзакции.
   */
  person_id: string;
  /**
   * Карта, по которой прошла операция.
   */
  card_id: string;
  /**
   * Тип транзакции (debit — списание, credit — поступление).
   */
  type: 'debit' | 'credit';
  /**
   * Статус обработки.
   */
  status: 'pending' | 'posted' | 'reversed';
  /**
   * Сумма операции в minor units.
   */
  amount: number;
  /**
   * Валюта операции.
   */
  currency: CurrencyCode;
  /**
   * Код категории торговца (MCC).
   */
  mcc: string;
  /**
   * Название торговца или источника средств.
   */
  merchant: string;
  /**
   * Описание операции.
   */
  description: string;
  /**
   * Время авторизации/проводки.
   */
  occurred_at: string;
}

/**
 * Позиция в кассовом чеке.
 */
export interface ReceiptLineItem {
  /**
   * Наименование товара или услуги.
   */
  name: string;
  /**
   * Количество.
   */
  quantity: number;
  /**
   * Цена за единицу (в minor units).
   */
  price: number;
}

/**
 * Кассовый чек, связанный с транзакцией.
 */
export interface Receipt {
  /**
   * Уникальный идентификатор чека.
   */
  id: string;
  /**
   * Связанная транзакция.
   */
  transaction_id: string;
  /**
   * Тип чека: покупка или возврат.
   */
  type: 'purchase' | 'refund';
  /**
   * Состав чека.
   */
  items: ReceiptLineItem[];
  /**
   * Общая сумма (в minor units).
   */
  total: number;
  /**
   * НДС (в minor units).
   */
  vat: number;
  /**
   * Дата/время выдачи чека.
   */
  issued_at: string;
}

/**
 * Набор финансовых данных, связанных с профилем.
 */
export interface FinanceProfile {
  cards: PaymentCard[];
  transactions: CardTransaction[];
  receipts: Receipt[];
}

export interface GenerationParams {
  gender?: 'male' | 'female' | 'random';
  age_range?: [number, number];
  region?: string;
  include_documents?: string[];
}

export interface ApiResponseDto<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

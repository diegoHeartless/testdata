import { DictionaryRegistry } from '../registry/dictionary-registry';
import { RandomSource } from '../random/random-source';

/**
 * Дополнительная информация, которую модуль генерации может вернуть вместе с сущностью.
 */
export interface GeneratorMeta {
  /**
   * Произвольные статистики или диагностические данные, например время генерации.
   */
  stats?: Record<string, number>;
  /**
   * Теги сценария или флаги включённых подмодулей.
   */
  tags?: string[];
}

/**
 * Результат генерации сущности.
 */
export interface GeneratorResult<TPayload> {
  /**
   * Сгенерированная сущность.
   */
  payload: TPayload;
  /**
   * Дополнительные метаданные.
   */
  meta?: GeneratorMeta;
}

/**
 * Ошибка валидации, возвращаемая модулем генерации.
 */
export interface GeneratorValidationIssue {
  /**
   * Путь к полю (dot-notation), где обнаружена проблема.
   */
  path: string;
  /**
   * Человекочитаемое описание ошибки.
   */
  message: string;
  /**
   * Необязательный код ошибки для категоризации.
   */
  code?: string;
}

/**
 * Результат валидации сущности.
 */
export interface GeneratorValidationResult {
  /**
   * Признак успешной проверки.
   */
  isValid: boolean;
  /**
   * Список найденных ошибок, если есть.
   */
  issues?: GeneratorValidationIssue[];
}

/**
 * Контекст, который передаётся каждому модулю генерации.
 */
export interface GeneratorContext {
  /**
   * Источник детерминированной случайности.
   */
  random: RandomSource;
  /**
   * Реестр справочников, доступных модулю.
   */
  dictionaries: DictionaryRegistry;
  /**
   * Текущее время (может быть переопределено в тестах).
   */
  now: () => Date;
}

/**
 * Базовый интерфейс модулей генерации.
 */
export interface GeneratorModule<
  TPayload,
  TParams extends Record<string, any> = Record<string, unknown>,
> {
  /**
   * Уникальное имя модуля.
   */
  readonly name: string;

  /**
   * Предварительная инициализация словарей/кэшей.
   */
  seed?(registry: DictionaryRegistry): Promise<void> | void;

  /**
   * Генерация сущности.
   */
  generate(params: TParams, context: GeneratorContext): GeneratorResult<TPayload>;

  /**
   * Валидация результата генерации.
   */
  validate?(payload: TPayload): GeneratorValidationResult;
}



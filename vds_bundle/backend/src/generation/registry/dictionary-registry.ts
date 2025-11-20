import * as fs from 'fs';
import * as path from 'path';

/**
 * Настройки реестра словарей.
 */
export interface DictionaryRegistryOptions {
  /**
   * Базовая директория, где лежат JSON-файлы словарей.
   */
  basePath?: string;
  /**
   * Кодировка файлов.
   */
  encoding?: BufferEncoding;
}

/**
 * Провайдер словаря, который может вернуть данные синхронно или асинхронно.
 */
export type DictionaryProvider<TValue> = () => TValue | Promise<TValue>;

/**
 * Реестр словарей: лениво загружает JSON-файлы и кэширует их в памяти.
 */
export class DictionaryRegistry {
  private readonly basePath: string;
  private readonly encoding: BufferEncoding;
  private readonly cache = new Map<string, unknown>();
  private readonly providers = new Map<string, DictionaryProvider<unknown>>();

  constructor(options: DictionaryRegistryOptions = {}) {
    this.basePath = options.basePath ?? path.join(__dirname, '../../../data-dictionaries');
    this.encoding = options.encoding ?? 'utf-8';
  }

  /**
   * Устанавливает кастомный провайдер для словаря.
   */
  register<TValue>(name: string, provider: DictionaryProvider<TValue>): void {
    this.providers.set(name, provider);
  }

  /**
   * Удаляет кэшированное значение конкретного словаря.
   */
  invalidate(name: string): void {
    this.cache.delete(name);
  }

  /**
   * Полностью очищает кэш словарей (используется в тестах).
   */
  reset(): void {
    this.cache.clear();
  }

  /**
   * Синхронно возвращает словарь. Если провайдер асинхронный, будет выброшено исключение.
   */
  get<TValue>(name: string, fallback?: DictionaryProvider<TValue>): TValue {
    if (this.cache.has(name)) {
      return this.cache.get(name) as TValue;
    }

    const provider = (fallback ?? this.providers.get(name)) as DictionaryProvider<TValue> | undefined;
    const value = provider ? provider() : this.loadFromFile<TValue>(name);

    if (value instanceof Promise) {
      throw new Error(
        `Dictionary "${name}" registered с асинхронным провайдером. Используйте getAsync().`,
      );
    }

    this.cache.set(name, value);
    return value;
  }

  /**
   * Асинхронно возвращает словарь, поддерживая как sync, так и async провайдеры.
   */
  async getAsync<TValue>(name: string, fallback?: DictionaryProvider<TValue>): Promise<TValue> {
    if (this.cache.has(name)) {
      return this.cache.get(name) as TValue;
    }

    const provider = (fallback ?? this.providers.get(name)) as DictionaryProvider<TValue> | undefined;
    const value = provider ? await provider() : await this.loadFromFileAsync<TValue>(name);

    this.cache.set(name, value);
    return value;
  }

  /**
   * Предварительно загружает набор словарей синхронно.
   */
  preload(names: string[]): void {
    names.forEach((name) => this.get(name));
  }

  private loadFromFile<TValue>(name: string): TValue {
    const filePath = this.resolvePath(name);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Dictionary file not found: ${filePath}`);
    }
    const raw = fs.readFileSync(filePath, this.encoding);
    return JSON.parse(raw) as TValue;
  }

  private async loadFromFileAsync<TValue>(name: string): Promise<TValue> {
    const filePath = this.resolvePath(name);
    const raw = await fs.promises.readFile(filePath, this.encoding);
    return JSON.parse(raw) as TValue;
  }

  private resolvePath(name: string): string {
    const normalized = name.endsWith('.json') ? name : `${name}.json`;
    return path.join(this.basePath, normalized);
  }
}



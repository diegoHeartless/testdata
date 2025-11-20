/**
 * Опции для источника случайных чисел.
 */
export interface RandomSourceOptions {
  /**
   * Начальное значение seed. При одинаковых seed выдаёт идентичные последовательности.
   */
  seed?: number | string;
}

/**
 * Простая детерминированная PRNG (mulberry32) с удобными хелперами.
 */
export class RandomSource {
  private state: number;

  constructor(options: RandomSourceOptions = {}) {
    const normalizedSeed = this.normalizeSeed(options.seed ?? Date.now());
    this.state = normalizedSeed;
  }

  /**
   * Возвращает псевдослучайное число в диапазоне [0, 1).
   */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Возвращает целое число в диапазоне [min, max).
   */
  nextInt(min: number, max: number): number {
    if (max <= min) {
      throw new Error('`max` должен быть больше `min`');
    }
    const span = max - min;
    return min + Math.floor(this.next() * span);
  }

  /**
   * Возвращает число с плавающей точкой в диапазоне [min, max).
   */
  nextFloat(min: number, max: number): number {
    if (max <= min) {
      throw new Error('`max` должен быть больше `min`');
    }
    return min + this.next() * (max - min);
  }

  /**
   * Выбирает случайный элемент из массива.
   */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Нельзя выбрать элемент из пустого массива');
    }
    const index = this.nextInt(0, items.length);
    return items[index];
  }

  /**
   * Выбирает элемент с учётом веса.
   */
  weighted<T extends { weight: number }>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Нельзя выбрать элемент из пустого массива');
    }
    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
    if (totalWeight <= 0) {
      throw new Error('Суммарный вес должен быть положительным');
    }
    const target = this.nextFloat(0, totalWeight);
    let cumulative = 0;
    for (const item of items) {
      cumulative += item.weight;
      if (target < cumulative) {
        return item;
      }
    }
    return items[items.length - 1];
  }

  /**
   * Создаёт "дочерний" источник с новым seed, основанным на текущем состоянии.
   */
  fork(): RandomSource {
    return new RandomSource({ seed: this.next() * Number.MAX_SAFE_INTEGER });
  }

  private normalizeSeed(seed: number | string): number {
    if (typeof seed === 'number') {
      return seed >>> 0;
    }
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return hash >>> 0;
  }
}



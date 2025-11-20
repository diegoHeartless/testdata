import * as fs from 'fs';
import * as path from 'path';

export interface WeightedItem {
  value: string;
  weight: number;
}

export interface PatronymicItem extends WeightedItem {
  gender: 'male' | 'female';
}

export interface NamesDictionary {
  male: WeightedItem[];
  female: WeightedItem[];
  surnames: WeightedItem[];
  patronymics: PatronymicItem[];
}

// Базовый интерфейс для всех взвешенных элементов
interface HasWeight {
  weight: number;
}

export class DictionaryLoader {
  private dictionaries: Map<string, any> = new Map();
  private basePath: string;

  constructor(basePath: string = path.join(__dirname, '../../data-dictionaries')) {
    this.basePath = basePath;
  }

  load<T = any>(name: string): T {
    if (this.dictionaries.has(name)) {
      return this.dictionaries.get(name);
    }

    const filePath = path.join(this.basePath, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Dictionary file not found: ${filePath}`);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    this.dictionaries.set(name, data);
    return data;
  }

  getWeightedRandom<T extends HasWeight>(items: T[]): T {
    if (items.length === 0) {
      throw new Error('Items array is empty');
    }

    const random = Math.random();
    let cumulative = 0;

    for (const item of items) {
      cumulative += item.weight;
      if (random <= cumulative) {
        return item;
      }
    }

    // Fallback to last item
    return items[items.length - 1];
  }

  precomputeCumulativeWeights<T extends HasWeight>(
    items: T[],
  ): Array<T & { cumulative: number }> {
    let cumulative = 0;
    return items.map((item) => {
      cumulative += item.weight;
      return { ...item, cumulative };
    });
  }
}


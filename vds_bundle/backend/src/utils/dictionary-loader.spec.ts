import { DictionaryLoader } from './dictionary-loader';
import * as path from 'path';
import * as fs from 'fs';

describe('DictionaryLoader', () => {
  let loader: DictionaryLoader;
  const testDictPath = path.join(__dirname, '../../data-dictionaries');

  beforeEach(() => {
    loader = new DictionaryLoader(testDictPath);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
  });

  describe('load', () => {
    it('should load names dictionary', () => {
      const names = loader.load('names');
      expect(names).toBeDefined();
      expect(names).toHaveProperty('male');
      expect(names).toHaveProperty('female');
      expect(names).toHaveProperty('surnames');
      expect(names).toHaveProperty('patronymics');
    });

    it('should cache loaded dictionaries', () => {
      const names1 = loader.load('names');
      const names2 = loader.load('names');
      expect(names1).toBe(names2); // Same reference due to caching
    });

    it('should throw error for non-existent dictionary', () => {
      expect(() => loader.load('non-existent')).toThrow();
    });
  });

  describe('getWeightedRandom', () => {
    it('should return item from array', () => {
      const items = [
        { value: 'item1', weight: 0.5 },
        { value: 'item2', weight: 0.3 },
        { value: 'item3', weight: 0.2 },
      ];

      const result = loader.getWeightedRandom(items);
      expect(items).toContain(result);
    });

    it('should throw error for empty array', () => {
      expect(() => loader.getWeightedRandom([])).toThrow();
    });

    it('should return different items on multiple calls', () => {
      const items = [
        { value: 'item1', weight: 0.33 },
        { value: 'item2', weight: 0.33 },
        { value: 'item3', weight: 0.34 },
      ];

      const results = Array.from({ length: 20 }, () =>
        loader.getWeightedRandom(items),
      );
      const uniqueValues = new Set(results.map((r) => r.value));
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    it('should work with items that have different weight property names', () => {
      const items = [
        { name: 'region1', code: '77', weight: 0.5 },
        { name: 'region2', code: '78', weight: 0.5 },
      ];

      const result = loader.getWeightedRandom(items);
      expect(items).toContain(result);
    });
  });

  describe('precomputeCumulativeWeights', () => {
    it('should compute cumulative weights', () => {
      const items = [
        { value: 'item1', weight: 0.3 },
        { value: 'item2', weight: 0.3 },
        { value: 'item3', weight: 0.4 },
      ];

      const result = loader.precomputeCumulativeWeights(items);
      expect(result).toHaveLength(3);
      expect(result[0].cumulative).toBe(0.3);
      expect(result[1].cumulative).toBe(0.6);
      expect(result[2].cumulative).toBe(1.0);
    });
  });
});


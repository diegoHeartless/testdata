import { RandomSource } from './random-source';

describe('RandomSource', () => {
  it('produces deterministic sequences for the same seed', () => {
    const first = new RandomSource({ seed: 42 });
    const second = new RandomSource({ seed: 42 });

    const seq1 = Array.from({ length: 5 }, () => first.next());
    const seq2 = Array.from({ length: 5 }, () => second.next());

    expect(seq1).toEqual(seq2);
  });

  it('generates integers within the requested range', () => {
    const random = new RandomSource({ seed: 1337 });
    const values = Array.from({ length: 100 }, () => random.nextInt(10, 20));

    values.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThan(20);
    });
  });

  it('respects weights when picking weighted items', () => {
    const random = new RandomSource({ seed: 'weights' });
    const items = [
      { label: 'low', weight: 1 },
      { label: 'high', weight: 9 },
    ];

    const picks = Array.from({ length: 100 }, () => random.weighted(items).label);
    const lowCount = picks.filter((label) => label === 'low').length;
    const highCount = picks.filter((label) => label === 'high').length;

    expect(highCount).toBeGreaterThan(lowCount);
  });
});



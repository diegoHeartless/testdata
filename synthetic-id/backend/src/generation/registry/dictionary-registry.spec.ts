import * as path from 'path';
import { DictionaryRegistry } from './dictionary-registry';

const fixturesPath = path.join(__dirname, '../__fixtures__');

describe('DictionaryRegistry', () => {
  it('loads JSON dictionaries from disk', () => {
    const registry = new DictionaryRegistry({ basePath: fixturesPath });
    const dictionary = registry.get<{ items: Array<{ value: string }> }>('sample');

    expect(dictionary.items).toHaveLength(2);
    expect(dictionary.items[0].value).toBe('alpha');
  });

  it('caches loaded dictionaries', () => {
    const registry = new DictionaryRegistry({ basePath: fixturesPath });
    const provider = jest.fn(() => ({ foo: 'bar' }));

    registry.register('custom', provider);

    const first = registry.get<{ foo: string }>('custom');
    const second = registry.get<{ foo: string }>('custom');

    expect(first).toBe(second);
    expect(provider).toHaveBeenCalledTimes(1);
  });

  it('supports async providers via getAsync', async () => {
    const registry = new DictionaryRegistry({ basePath: fixturesPath });
    const asyncProvider = jest.fn(async () => ({ foo: 'async' }));

    const value = await registry.getAsync('asyncDictionary', asyncProvider);
    expect(value.foo).toBe('async');
    expect(asyncProvider).toHaveBeenCalledTimes(1);
  });
});



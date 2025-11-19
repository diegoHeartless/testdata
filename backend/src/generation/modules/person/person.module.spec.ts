import * as path from 'path';
import { PersonModule } from './person.module';
import { DictionaryRegistry } from '../../registry/dictionary-registry';
import { RandomSource } from '../../random/random-source';

const basePath = path.join(__dirname, '../../../../data-dictionaries');

const createContext = () => ({
  random: new RandomSource({ seed: 42 }),
  dictionaries: new DictionaryRegistry({ basePath }),
  now: () => new Date('2024-01-01T00:00:00.000Z'),
});

describe('PersonModule', () => {
  it('генерирует персональный профиль с контактами и документами', () => {
    const module = new PersonModule();
    const context = createContext();
    module.seed(context.dictionaries);

    const { payload } = module.generate({}, context);

    expect(payload.personal.first_name).toBeTruthy();
    expect(payload.personal.birth_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.address.region).toHaveLength(2);
    expect(payload.contacts.phone.e164).toMatch(/^\+7\d{10}$/);
    expect(payload.documents.passport?.number).toHaveLength(6);
    expect(payload.documents.snils).toMatch(/^\d{3}-\d{3}-\d{3} \d{2}$/);
  });

  it('учитывает заданный пол и регион', () => {
    const module = new PersonModule();
    const context = createContext();
    module.seed(context.dictionaries);

    const { payload } = module.generate(
      {
        gender: 'female',
        region: '78',
        include_documents: ['inn'],
      },
      context,
    );

    expect(payload.personal.gender).toBe('female');
    expect(payload.address.region).toBe('78');
    expect(payload.documents.inn).toMatch(/^\d{12}$/);
    expect(payload.documents.passport).toBeUndefined();
  });

  it('поддерживает выключение документов', () => {
    const module = new PersonModule();
    const context = createContext();
    module.seed(context.dictionaries);

    const { payload } = module.generate(
      {
        include_documents: [],
      },
      context,
    );

    expect(payload.documents.passport).toBeUndefined();
    expect(payload.documents.inn).toBeUndefined();
    expect(payload.documents.snils).toBeUndefined();
  });
});



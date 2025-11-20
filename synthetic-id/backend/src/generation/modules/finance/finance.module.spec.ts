import * as path from 'path';
import { FinanceModule } from './finance.module';
import { DictionaryRegistry } from '../../registry/dictionary-registry';
import { RandomSource } from '../../random/random-source';
import { PersonProfilePayload } from '../person/person.types';

const dictionariesPath = path.join(__dirname, '../../../../data-dictionaries');

const basePerson: PersonProfilePayload = {
  personal: {
    first_name: 'Иван',
    last_name: 'Иванов',
    middle_name: 'Иванович',
    gender: 'male',
    birth_date: '1990-01-01',
    age: 34,
    birth_place: 'Москва',
  },
  address: {
    region: '77',
    region_name: 'Москва',
    city: 'Москва',
    street: 'ул. Ленина',
    house: '10',
    postal_code: '101000',
  },
  contacts: {
    phone: {
      e164: '+79001234567',
      formatted: '+7 (900) 123-45-67',
    },
    email: 'ivan@example.com',
  },
  documents: {},
};

const createContext = () => ({
  random: new RandomSource({ seed: 2024 }),
  now: () => new Date('2024-05-01T12:00:00.000Z'),
  dictionaries: new DictionaryRegistry({ basePath: dictionariesPath }),
});

const validateLuhn = (pan: string): boolean => {
  const digits = pan
    .split('')
    .map((d) => parseInt(d, 10))
    .reverse();
  const sum = digits.reduce((acc, digit, idx) => {
    if (idx % 2 === 1) {
      let doubled = digit * 2;
      if (doubled > 9) {
        doubled -= 9;
      }
      return acc + doubled;
    }
    return acc + digit;
  }, 0);
  return sum % 10 === 0;
};

describe('FinanceModule', () => {
  it('генерирует карты и транзакции, связанные с человеком', () => {
    const module = new FinanceModule();
    const context = createContext();
    module.seed(context.dictionaries);

    const { payload } = module.generate(
      {
        person_id: 'person-1',
        person: basePerson,
      },
      context,
    );

    expect(payload.cards.length).toBeGreaterThan(0);
    payload.cards.forEach((card) => {
      expect(validateLuhn(card.pan)).toBe(true);
      expect(card.person_id).toBe('person-1');
    });

    expect(payload.transactions.length).toBeGreaterThan(0);
    payload.transactions.forEach((tx) => {
      expect(payload.cards.map((card) => card.id)).toContain(tx.card_id);
    });

    payload.receipts.forEach((receipt) => {
      expect(payload.transactions.map((tx) => tx.id)).toContain(receipt.transaction_id);
    });
  });

  it('учитывает диапазон карт и транзакций', () => {
    const module = new FinanceModule();
    const context = createContext();
    module.seed(context.dictionaries);

    const { payload } = module.generate(
      {
        person_id: 'person-2',
        person: basePerson,
        cards_range: [2, 2],
        transactions_range: [5, 5],
      },
      context,
    );

    expect(payload.cards).toHaveLength(2);
    expect(payload.transactions.length).toBeGreaterThanOrEqual(5);
  });
});



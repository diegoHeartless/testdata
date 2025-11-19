import { v4 as uuid } from 'uuid';
import {
  GeneratorContext,
  GeneratorModule,
  GeneratorResult,
} from '../../interfaces/generator-module.interface';
import { RandomSource } from '../../random/random-source';
import { DictionaryRegistry } from '../../registry/dictionary-registry';
import {
  CardTransaction,
  FinanceProfile,
  PaymentCard,
  Receipt,
  ReceiptLineItem,
} from '../../../types';
import {
  FinanceGeneratorParams,
  FinanceProfilePayload,
  RangeTuple,
} from './finance.types';
import { PersonProfilePayload } from '../person/person.types';

interface CardBinDictionaryEntry {
  bin: string;
  brand: string;
  issuer: string;
  product: string;
  type: string;
  weight: number;
}

interface MccDictionaryEntry {
  code: string;
  description: string;
  category: string;
  avg_ticket_min: number;
  avg_ticket_max: number;
  merchant_names: string[];
  weight: number;
}

const REQUIRED_DICTIONARIES = ['card_bins', 'mcc_codes'];
const DEFAULT_CARD_RANGE: RangeTuple = [1, 2];
const DEFAULT_TRANSACTION_RANGE: RangeTuple = [8, 16];
const VAT_RATE = 0.2;

export class FinanceModule
  implements GeneratorModule<FinanceProfilePayload, FinanceGeneratorParams>
{
  readonly name = 'finance';

  seed(registry: DictionaryRegistry): void {
    registry.preload(REQUIRED_DICTIONARIES);
  }

  generate(
    params: FinanceGeneratorParams,
    context: GeneratorContext,
  ): GeneratorResult<FinanceProfile> {
    if (!params?.person_id || !params?.person) {
      throw new Error('FinanceModule requires person_id and person payload');
    }

    const random = context.random;
    const now = context.now();
    const dictionaries = context.dictionaries;
    const currency = params.currency ?? 'RUB';

    const cardBins = dictionaries.get<CardBinDictionaryEntry[]>('card_bins');
    const mccCodes = dictionaries.get<MccDictionaryEntry[]>('mcc_codes');

    const cardCount = this.randomInRange(params.cards_range ?? DEFAULT_CARD_RANGE, random);
    const cards = Array.from({ length: cardCount }, () =>
      this.generateCard({
        random,
        now,
        cardBins,
        personId: params.person_id,
      }),
    );

    const transactionsCount = this.randomInRange(
      params.transactions_range ?? DEFAULT_TRANSACTION_RANGE,
      random,
    );

    const transactions: CardTransaction[] = [];
    const receipts: Receipt[] = [];

    for (let i = 0; i < transactionsCount; i++) {
      const card = random.pick(cards);
      const mcc = this.pickWeighted(mccCodes, random);
      const type = random.next() < 0.75 ? 'debit' : 'credit';

      const amount = this.generateAmount(mcc, type, random);
      const occurredAt = this.randomPastDate(now, 90, random);
      const status: CardTransaction['status'] = random.next() < 0.1 ? 'pending' : 'posted';
      const transaction: CardTransaction = {
        id: uuid(),
        person_id: params.person_id,
        card_id: card.id,
        type,
        status,
        amount,
        currency,
        mcc: mcc.code,
        merchant: this.pickMerchantName(mcc, random),
        description: this.describeTransaction(mcc, params.person),
        occurred_at: occurredAt.toISOString(),
      };

      transactions.push(transaction);

      if (type === 'debit') {
        const receipt = this.generateReceipt(transaction, mcc.category, random);
        receipts.push(receipt);

        // С вероятностью 10% создаём возврат
        if (random.next() < 0.1) {
          const refundTransaction = this.createRefundTransaction(transaction, random, now);
          transactions.push(refundTransaction);
          receipts.push(
            this.generateReceipt(refundTransaction, mcc.category, random, {
              template: 'refund',
              referenceTotal: receipt.total,
            }),
          );
        }
      }
    }

    return {
      payload: {
        cards,
        transactions,
        receipts,
      },
      meta: {
        stats: {
          cards: cards.length,
          transactions: transactions.length,
        },
        tags: ['finance'],
      },
    };
  }

  private generateCard(args: {
    random: RandomSource;
    now: Date;
    cardBins: CardBinDictionaryEntry[];
    personId: string;
  }): PaymentCard {
    const bin = this.pickWeighted(args.cardBins, args.random);
    const pan = this.generatePan(bin.bin, args.random);
    const expiry = this.generateExpiry(args.now, args.random);

    const issuedAt = new Date(args.now);
    issuedAt.setMonth(issuedAt.getMonth() - args.random.nextInt(1, 24));

    return {
      id: uuid(),
      person_id: args.personId,
      brand: bin.brand,
      type: bin.type,
      issuer: bin.issuer,
      pan,
      pan_masked: this.maskPan(pan),
      last4: pan.slice(-4),
      exp_month: expiry.month,
      exp_year: expiry.year,
      cvv: String(args.random.nextInt(100, 1000)),
      issued_at: issuedAt.toISOString(),
    };
  }

  private generatePan(bin: string, random: RandomSource): string {
    const length = 16;
    const digitsNeeded = length - bin.length - 1;
    const body = Array.from({ length: digitsNeeded }, () => random.nextInt(0, 10)).join('');
    const partial = `${bin}${body}`;
    const checkDigit = this.calculateLuhn(partial);
    return `${partial}${checkDigit}`;
  }

  private calculateLuhn(partial: string): number {
    const digits = partial.split('').map((d) => parseInt(d, 10));
    for (let i = digits.length - 1; i >= 0; i -= 2) {
      digits[i] *= 2;
      if (digits[i] > 9) {
        digits[i] -= 9;
      }
    }
    const sum = digits.reduce((acc, digit) => acc + digit, 0);
    return (10 - (sum % 10)) % 10;
  }

  private maskPan(pan: string): string {
    return `${pan.slice(0, 6)}******${pan.slice(-4)}`;
  }

  private generateExpiry(now: Date, random: RandomSource): { month: string; year: string } {
    const copy = new Date(now);
    copy.setMonth(copy.getMonth() + random.nextInt(24, 61));
    const month = String(copy.getMonth() + 1).padStart(2, '0');
    const year = String(copy.getFullYear()).slice(-2);
    return { month, year };
  }

  private generateAmount(mcc: MccDictionaryEntry, type: 'debit' | 'credit', random: RandomSource): number {
    const min = type === 'credit' ? mcc.avg_ticket_min * 2 : mcc.avg_ticket_min;
    const max = type === 'credit' ? mcc.avg_ticket_max * 2 : mcc.avg_ticket_max;
    const amount = random.nextFloat(min, max);
    return Math.round(amount / 10) * 10 * 100; // minor units
  }

  private pickMerchantName(mcc: MccDictionaryEntry, random: RandomSource): string {
    if (mcc.merchant_names?.length) {
      return random.pick(mcc.merchant_names);
    }
    return mcc.description;
  }

  private describeTransaction(mcc: MccDictionaryEntry, person: PersonProfilePayload): string {
    return `${mcc.description} для ${person.personal.first_name} ${person.personal.last_name}`;
  }

  private generateReceipt(
    transaction: CardTransaction,
    category: string,
    random: RandomSource,
    options?: { template?: 'refund'; referenceTotal?: number },
  ): Receipt {
    const itemCount = random.nextInt(1, 4);
    const items: ReceiptLineItem[] = [];
    for (let i = 0; i < itemCount; i++) {
      const quantity = random.nextInt(1, 4);
      const price = Math.round(transaction.amount / itemCount / quantity);
      items.push({
        name: this.generateItemName(category, random),
        quantity,
        price,
      });
    }

    const total =
      options?.template === 'refund' && options.referenceTotal
        ? -options.referenceTotal
        : items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const vat = Math.round(total * VAT_RATE);

    return {
      id: uuid(),
      transaction_id: transaction.id,
      type: options?.template === 'refund' ? 'refund' : 'purchase',
      items,
      total,
      vat,
      issued_at: transaction.occurred_at,
    };
  }

  private createRefundTransaction(
    transaction: CardTransaction,
    random: RandomSource,
    now: Date,
  ): CardTransaction {
    return {
      ...transaction,
      id: uuid(),
      type: 'credit',
      status: 'posted',
      amount: transaction.amount,
      merchant: `${transaction.merchant} (refund)`,
      description: `Возврат по операции ${transaction.id}`,
      occurred_at: this.randomPastDate(now, 5, random).toISOString(),
    };
  }

  private generateItemName(category: string, random: RandomSource): string {
    const catalog: Record<string, string[]> = {
      groceries: ['Хлеб', 'Молоко', 'Сыр', 'Овощи'],
      restaurants: ['Комбо-ланч', 'Кофе', 'Десерт'],
      electronics: ['Наушники', 'Кабель USB-C', 'Пауэрбанк'],
      transport: ['Проездной', 'Билет'],
      retail: ['Товар', 'Подарок', 'Аксессуар'],
      finance: ['Услуга банка', 'Комиссия'],
    };
    const fallback = ['Товар'];
    const items = catalog[category] ?? fallback;
    return random.pick(items);
  }

  private randomPastDate(now: Date, maxDays: number, random: RandomSource): Date {
    const copy = new Date(now);
    const offset = random.nextInt(1, maxDays + 1);
    copy.setDate(copy.getDate() - offset);
    copy.setHours(random.nextInt(0, 24), random.nextInt(0, 60), random.nextInt(0, 60), 0);
    return copy;
  }

  private randomInRange(range: RangeTuple, random: RandomSource): number {
    const [min, max] = range;
    if (max < min) {
      throw new Error('Range max must be >= min');
    }
    return random.nextInt(min, max + 1);
  }

  private pickWeighted<T extends { weight: number }>(items: readonly T[], random: RandomSource): T {
    return random.weighted(items);
  }
}



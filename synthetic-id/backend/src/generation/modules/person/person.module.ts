import {
  GeneratorContext,
  GeneratorModule,
  GeneratorResult,
} from '../../interfaces/generator-module.interface';
import { DictionaryRegistry } from '../../registry/dictionary-registry';
import { RandomSource } from '../../random/random-source';
import { Address, PersonalInfo, Passport } from '../../../types';
import {
  PersonContacts,
  PersonDocuments,
  PersonGeneratorParams,
  PersonProfilePayload,
} from './person.types';

type Gender = 'male' | 'female';

interface WeightedValue<T extends string = string> {
  value: T;
  weight: number;
}

interface NamesDictionary {
  male: WeightedValue[];
  female: WeightedValue[];
  surnames: WeightedValue[];
}

interface RegionDictionaryEntry {
  code: string;
  name: string;
  type: string;
  weight: number;
}

interface CityDictionaryEntry {
  name: string;
  region: string;
  type: string;
  weight: number;
}

interface StreetDictionaryEntry {
  name: string;
  type: string;
  weight: number;
}

interface DivisionCodeEntry {
  code: string;
  region: string;
  name: string;
  weight: number;
}

const DEFAULT_AGE_RANGE: [number, number] = [18, 65];
const REQUIRED_DICTIONARIES = ['names', 'regions', 'cities', 'streets', 'division_codes'];
const DEFAULT_DOCUMENTS = ['passport', 'inn', 'snils'];
const EMAIL_DOMAINS = ['mail.ru', 'yandex.ru', 'gmail.com', 'outlook.com'];
const PHONE_PREFIXES = ['900', '901', '902', '903', '904', '905', '906', '909'];

const TRANSLIT_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export class PersonModule
  implements GeneratorModule<PersonProfilePayload, PersonGeneratorParams | undefined>
{
  readonly name = 'person';

  private readonly usedPassportNumbers = new Set<string>();
  private readonly usedInnNumbers = new Set<string>();
  private readonly usedSnilsNumbers = new Set<string>();

  seed(registry: DictionaryRegistry): void {
    registry.preload(REQUIRED_DICTIONARIES);
  }

  generate(
    params: PersonGeneratorParams = {},
    context: GeneratorContext,
  ): GeneratorResult<PersonProfilePayload> {
    const dictionaries = context.dictionaries;
    const random = context.random;
    const now = context.now();

    const gender = this.resolveGender(params.gender, random);
    const names = dictionaries.get<NamesDictionary>('names');
    const fullName = this.generateFullName(names, gender, random);
    const { age, birthDate } = this.generateBirthData(params.age_range ?? DEFAULT_AGE_RANGE, random, now);

    const regions = dictionaries.get<RegionDictionaryEntry[]>('regions');
    const cities = dictionaries.get<CityDictionaryEntry[]>('cities');
    const streets = dictionaries.get<StreetDictionaryEntry[]>('streets');
    const region = this.resolveRegion(regions, params.region, random);
    const city = this.resolveCity(cities, region.code, random);
    const street = this.pickWeighted(streets, random);
    const address = this.buildAddress(region, city, street, random);

    const contacts = this.generateContacts(fullName.first_name, fullName.last_name, {
      format: params.phone_format ?? 'international',
      random,
    });

    const includeDocuments = new Set(params.include_documents ?? DEFAULT_DOCUMENTS);
    const documents = this.generateDocuments({
      include: includeDocuments,
      regionCode: region.code,
      birthDate,
      divisionCodes: dictionaries.get<DivisionCodeEntry[]>('division_codes'),
      random,
      now,
    });

    const personal: PersonalInfo = {
      first_name: fullName.first_name,
      last_name: fullName.last_name,
      middle_name: fullName.middle_name,
      gender,
      birth_date: birthDate,
      age,
      birth_place: city.name,
    };

    return {
      payload: {
        personal,
        address,
        contacts,
        documents,
      },
      meta: {
        tags: ['person', gender],
        stats: {
          age,
        },
      },
    };
  }

  private resolveGender(
    requested: PersonGeneratorParams['gender'],
    random: RandomSource,
  ): Gender {
    if (requested === 'male' || requested === 'female') {
      return requested;
    }
    return random.next() < 0.5 ? 'male' : 'female';
  }

  private generateFullName(
    dictionaries: NamesDictionary,
    gender: Gender,
    random: RandomSource,
  ): { first_name: string; last_name: string; middle_name: string } {
    const first =
      gender === 'male'
        ? this.pickWeighted(dictionaries.male, random)
        : this.pickWeighted(dictionaries.female, random);
    const last = this.pickWeighted(dictionaries.surnames, random);
    const father = this.pickWeighted(dictionaries.male, random);
    const middle = this.generatePatronymic(father.value, gender);

    return {
      first_name: first.value,
      last_name: last.value,
      middle_name: middle,
    };
  }

  private generatePatronymic(fatherName: string, gender: Gender): string {
    const lower = fatherName.toLowerCase();
    let stem = fatherName;
    if (/[йьая]$/.test(lower)) {
      stem = fatherName.slice(0, -1);
    }
    const suffix = /[йьёеию]$/.test(lower)
      ? gender === 'male'
        ? 'евич'
        : 'евна'
      : gender === 'male'
        ? 'ович'
        : 'овна';
    return `${stem}${suffix}`;
  }

  private generateBirthData(
    ageRange: [number, number],
    random: RandomSource,
    now: Date,
  ): { age: number; birthDate: string } {
    const [minAge, maxAge] = ageRange;
    const age = random.nextInt(minAge, maxAge + 1);
    const birthYear = now.getFullYear() - age;
    const month = random.nextInt(1, 13);
    const daysInMonth = new Date(birthYear, month, 0).getDate();
    const day = random.nextInt(1, daysInMonth + 1);
    const birthDate = `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { age, birthDate };
  }

  private resolveRegion(
    regions: RegionDictionaryEntry[],
    requestedRegion: string | undefined,
    random: RandomSource,
  ): RegionDictionaryEntry {
    if (requestedRegion) {
      const region = regions.find((entry) => entry.code === requestedRegion);
      if (region) {
        return region;
      }
    }
    return this.pickWeighted(regions, random);
  }

  private resolveCity(
    cities: CityDictionaryEntry[],
    regionCode: string,
    random: RandomSource,
  ): CityDictionaryEntry {
    const regionCities = cities.filter((city) => city.region === regionCode);
    if (regionCities.length === 0) {
      return this.pickWeighted(cities, random);
    }
    return this.pickWeighted(regionCities, random);
  }

  private buildAddress(
    region: RegionDictionaryEntry,
    city: CityDictionaryEntry,
    street: StreetDictionaryEntry,
    random: RandomSource,
  ): Address {
    const house = this.generateHouseNumber(random);
    const apartment = this.generateApartmentNumber(random);
    const postalCode = this.generatePostalCode(region.code, random);

    return {
      region: region.code,
      region_name: region.name,
      city: city.name,
      street: street.name,
      house,
      apartment,
      postal_code: postalCode,
    };
  }

  private generateContacts(
    firstName: string,
    lastName: string,
    options: { format: 'international' | 'national'; random: RandomSource },
  ): PersonContacts {
    const digits = [
      ...PHONE_PREFIXES[options.random.nextInt(0, PHONE_PREFIXES.length)].split(''),
      ...Array.from({ length: 7 }, () => String(options.random.nextInt(0, 10))),
    ];

    const e164 = `+7${digits.join('')}`;
    const formatted =
      options.format === 'national'
        ? `8 (${digits.slice(0, 3).join('')}) ${digits.slice(3, 6).join('')}-${digits
            .slice(6, 8)
            .join('')}-${digits.slice(8, 10).join('')}`
        : e164;

    const localPart = `${this.transliterate(firstName[0])}.${this.transliterate(lastName)}`
      .replace(/[^a-z0-9.]/g, '')
      .toLowerCase();
    const domain = this.pick(EMAIL_DOMAINS, options.random);
    const email = `${localPart}@${domain}`;

    return {
      phone: {
        e164,
        formatted,
      },
      email,
    };
  }

  private generateDocuments(args: {
    include: Set<string>;
    regionCode: string;
    birthDate: string;
    divisionCodes: DivisionCodeEntry[];
    random: RandomSource;
    now: Date;
  }): PersonDocuments {
    const documents: PersonDocuments = {};

    if (args.include.has('passport')) {
      documents.passport = this.generatePassport(args.regionCode, args.birthDate, args.divisionCodes, args.random);
    }

    if (args.include.has('inn')) {
      documents.inn = this.generateInn(args.regionCode, args.random);
    }

    if (args.include.has('snils')) {
      documents.snils = this.generateSnils(args.random);
    }

    return documents;
  }

  private generatePassport(
    regionCode: string,
    birthDate: string,
    divisionCodes: DivisionCodeEntry[],
    random: RandomSource,
  ): Passport {
    const seriesRegion = regionCode.slice(-2).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const issueYear = currentYear - random.nextInt(0, 20);
    const series = `${seriesRegion} ${String(issueYear).slice(-2)}`;
    const number = this.generateUniqueNumber(this.usedPassportNumbers, () =>
      String(random.nextInt(100000, 1000000)),
    );
    const division = this.pickDivisionCode(divisionCodes, regionCode, random);
    const issueDate = this.generateIssueDate(birthDate, random);

    return {
      series,
      number,
      issued_by: division.name,
      division_code: division.code,
      issue_date: issueDate,
    };
  }

  private pickDivisionCode(
    entries: DivisionCodeEntry[],
    regionCode: string,
    random: RandomSource,
  ): DivisionCodeEntry {
    const regionEntries = entries.filter((entry) => entry.region === regionCode);
    if (regionEntries.length > 0) {
      return this.pickWeighted(regionEntries, random);
    }
    const part1 = String(random.nextInt(100, 1000));
    const part2 = String(random.nextInt(100, 1000));
    return {
      code: `${part1}-${part2}`,
      region: regionCode,
      name: 'ОУФМС России',
      weight: 0,
    };
  }

  private generateIssueDate(birthDate: string, random: RandomSource): string {
    const birth = new Date(birthDate);
    const earliest = new Date(birth);
    earliest.setFullYear(birth.getFullYear() + 14);
    const now = new Date();
    const maxDate = now < earliest ? earliest : now;
    const diff = maxDate.getTime() - earliest.getTime();
    const randomTime = earliest.getTime() + Math.floor(random.next() * diff);
    const issue = new Date(randomTime);
    const year = issue.getFullYear();
    const month = String(issue.getMonth() + 1).padStart(2, '0');
    const day = String(issue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generateInn(regionCode: string, random: RandomSource): string {
    return this.generateUniqueNumber(this.usedInnNumbers, () => {
      const regionPart = regionCode.padStart(2, '0').slice(-2);
      const randomPart = this.generateDigits(random, 8);
      const base = `${regionPart}${randomPart}`;
      const checkSum1 = this.calculateInnChecksum(base, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
      const checkSum2 = this.calculateInnChecksum(`${base}${checkSum1}`, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
      return `${base}${checkSum1}${checkSum2}`;
    });
  }

  private calculateInnChecksum(digits: string, weights: number[]): number {
    const sum = digits.split('').reduce((acc, digit, index) => acc + parseInt(digit, 10) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 10 ? remainder : 0;
  }

  private generateSnils(random: RandomSource): string {
    let base: string;
    do {
      base = this.generateDigits(random, 9);
    } while (['000', '001', '002'].includes(base.slice(0, 3)) || this.usedSnilsNumbers.has(base));

    this.usedSnilsNumbers.add(base);

    let checksum = 0;
    for (let i = 0; i < 9; i++) {
      checksum += parseInt(base[i], 10) * (9 - i);
    }

    if (checksum > 101) {
      checksum %= 101;
    }
    if (checksum === 100 || checksum === 101) {
      checksum = 0;
    }

    const formatted = `${base.slice(0, 3)}-${base.slice(3, 6)}-${base.slice(6, 9)} ${String(checksum).padStart(2, '0')}`;
    return formatted;
  }

  private generateHouseNumber(random: RandomSource): string {
    if (random.next() < 0.8) {
      return String(random.nextInt(1, 201));
    }
    const number = random.nextInt(1, 51);
    const letter = String.fromCharCode(65 + random.nextInt(0, 26));
    return `${number}${letter}`;
  }

  private generateApartmentNumber(random: RandomSource): string | undefined {
    if (random.next() < 0.7) {
      return String(random.nextInt(1, 201));
    }
    return undefined;
  }

  private generatePostalCode(regionCode: string, random: RandomSource): string {
    const regionBase = parseInt(regionCode, 10) * 1000;
    const suffix = random.nextInt(0, 1000);
    return String(regionBase + suffix).padStart(6, '0');
  }

  private pick<T>(items: readonly T[], random: RandomSource): T {
    if (items.length === 0) {
      throw new Error('Нельзя выбрать элемент из пустого массива');
    }
    return items[random.nextInt(0, items.length)];
  }

  private pickWeighted<T extends { weight: number }>(items: readonly T[], random: RandomSource): T {
    return random.weighted(items);
  }

  private transliterate(input: string): string {
    return input
      .split('')
      .map((char) => {
        const lower = char.toLowerCase();
        const mapped = TRANSLIT_MAP[lower];
        return char === lower ? mapped ?? lower.replace(/[^a-z0-9]/g, '') : (mapped ?? '').toUpperCase();
      })
      .join('');
  }

  private generateDigits(random: RandomSource, length: number): string {
    return Array.from({ length }, () => String(random.nextInt(0, 10))).join('');
  }

  private generateUniqueNumber(store: Set<string>, generator: () => string): string {
    let value: string;
    do {
      value = generator();
    } while (store.has(value));
    store.add(value);
    return value;
  }

}



import { Injectable } from '@nestjs/common';
import { DictionaryLoader } from '../utils/dictionary-loader';

interface DivisionCode {
  code: string;
  region: string;
  name: string;
  weight: number;
}

@Injectable()
export class PassportGenerator {
  private loader: DictionaryLoader;
  private usedNumbers: Set<string> = new Set();

  constructor() {
    this.loader = new DictionaryLoader();
  }

  generate(region: string, birthDate: string): {
    series: string;
    number: string;
    issued_by: string;
    division_code: string;
    issue_date: string;
  } {
    // Серия паспорта
    const series = this.generateSeries(region);

    // Номер паспорта
    const number = this.generateNumber();

    // Код подразделения
    const divisionCode = this.generateDivisionCode(region);

    // Дата выдачи (минимум 14 лет с даты рождения)
    const issueDate = this.generateIssueDate(birthDate);

    return {
      series,
      number,
      issued_by: divisionCode.name,
      division_code: divisionCode.code,
      issue_date: issueDate,
    };
  }

  private generateSeries(region: string): string {
    // Первые 2 цифры — код региона (последние 2 цифры)
    const regionCode = region.slice(-2);

    // Вторые 2 цифры — год выдачи (последние 2 цифры года)
    // Для реалистичности: случайный год в диапазоне последних 20 лет
    const currentYear = new Date().getFullYear();
    const issueYear = currentYear - Math.floor(Math.random() * 20);
    const yearCode = String(issueYear).slice(-2);

    return `${regionCode} ${yearCode}`;
  }

  private generateNumber(): string {
    // Генерация уникального номера в рамках сессии
    let number: string;
    do {
      number = String(Math.floor(100000 + Math.random() * 900000));
    } while (this.usedNumbers.has(number));

    this.usedNumbers.add(number);
    return number;
  }

  private generateDivisionCode(region: string): DivisionCode {
    try {
      const codes = this.loader.load<DivisionCode[]>('division_codes');
      const regionCodes = codes.filter((code) => code.region === region);

      if (regionCodes.length > 0) {
        return this.loader.getWeightedRandom(regionCodes);
      }
    } catch (error) {
      // Fallback если справочник не найден
    }

    // Fallback: генерация случайного кода
    const part1 = String(Math.floor(100 + Math.random() * 900));
    const part2 = String(Math.floor(100 + Math.random() * 900));
    return {
      code: `${part1}-${part2}`,
      region,
      name: `ОУФМС России`,
      weight: 0,
    };
  }

  private generateIssueDate(birthDate: string): string {
    const birth = new Date(birthDate);
    const age14 = new Date(birth);
    age14.setFullYear(birth.getFullYear() + 14);

    const currentDate = new Date();
    const maxDate = currentDate < age14 ? age14 : currentDate;

    const timeDiff = maxDate.getTime() - age14.getTime();
    const randomTime = age14.getTime() + Math.random() * timeDiff;
    const issueDate = new Date(randomTime);

    return this.formatDate(issueDate);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}


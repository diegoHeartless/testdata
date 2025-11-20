import { Injectable } from '@nestjs/common';

@Injectable()
export class INNGenerator {
  generate(region: string): string {
    // 1. Первые 2 цифры — код региона
    const regionCode = region.slice(-2);

    // 2. Следующие 8 цифр — случайные
    const randomPart = String(Math.floor(10000000 + Math.random() * 90000000));

    // 3. Вычисление контрольных сумм
    const base = regionCode + randomPart;
    const checkSum1 = this.calculateCheckSum(base, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
    const checkSum2 = this.calculateCheckSum(
      base + checkSum1,
      [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8],
    );

    return base + checkSum1 + checkSum2;
  }

  private calculateCheckSum(digits: string, weights: number[]): string {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }
    const remainder = sum % 11;
    return String(remainder < 10 ? remainder : 0);
  }

  validate(inn: string): boolean {
    if (!/^\d{12}$/.test(inn)) {
      return false;
    }

    const base = inn.slice(0, 10);
    const checkSum1 = this.calculateCheckSum(base, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
    const checkSum2 = this.calculateCheckSum(
      base + checkSum1,
      [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8],
    );

    return inn.slice(10, 11) === checkSum1 && inn.slice(11, 12) === checkSum2;
  }
}


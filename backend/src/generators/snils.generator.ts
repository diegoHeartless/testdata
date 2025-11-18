import { Injectable } from '@nestjs/common';

@Injectable()
export class SNILSGenerator {
  generate(): string {
    // 1. Генерация первых 9 цифр (не должно быть 000, 001, 002)
    let base: string;
    do {
      base = String(Math.floor(100000000 + Math.random() * 900000000));
    } while (['000', '001', '002'].includes(base.slice(0, 3)));

    // 2. Вычисление контрольного числа
    let checkSum = 0;
    for (let i = 0; i < 9; i++) {
      checkSum += parseInt(base[i]) * (9 - i);
    }

    if (checkSum < 100) {
      // checkSum остается как есть
    } else if (checkSum === 100 || checkSum === 101) {
      checkSum = 0;
    } else {
      checkSum = checkSum % 101;
      if (checkSum === 100 || checkSum === 101) {
        checkSum = 0;
      }
    }

    const checkSumStr = String(checkSum).padStart(2, '0');

    // 3. Форматирование: XXX-XXX-XXX XX
    return `${base.slice(0, 3)}-${base.slice(3, 6)}-${base.slice(6, 9)} ${checkSumStr}`;
  }

  validate(snils: string): boolean {
    // Удаление форматирования
    const digits = snils.replace(/[-\s]/g, '');
    if (!/^\d{11}$/.test(digits)) {
      return false;
    }

    const base = digits.slice(0, 9);
    const checkSum = parseInt(digits.slice(9, 11));

    // Проверка запрещенных комбинаций
    if (['000', '001', '002'].includes(base.slice(0, 3))) {
      return false;
    }

    // Вычисление контрольного числа
    let calculatedSum = 0;
    for (let i = 0; i < 9; i++) {
      calculatedSum += parseInt(base[i]) * (9 - i);
    }

    if (calculatedSum < 100) {
      return calculatedSum === checkSum;
    } else if (calculatedSum === 100 || calculatedSum === 101) {
      return checkSum === 0;
    } else {
      const remainder = calculatedSum % 101;
      if (remainder === 100 || remainder === 101) {
        return checkSum === 0;
      }
      return remainder === checkSum;
    }
  }
}


import { Injectable } from '@nestjs/common';

@Injectable()
export class DateGenerator {
  generateBirthDate(ageRange: [number, number]): { birth_date: string; age: number } {
    const [minAge, maxAge] = ageRange;
    const currentDate = new Date();

    // Выбор случайного возраста в диапазоне
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

    // Вычисление года рождения
    const birthYear = currentDate.getFullYear() - age;

    // Случайный месяц и день
    const month = Math.floor(Math.random() * 12) + 1;
    const daysInMonth = new Date(birthYear, month, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;

    // Форматирование YYYY-MM-DD
    const birthDate = `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      birth_date: birthDate,
      age,
    };
  }

  generateIssueDate(birthDate: string, minAge: number = 14): string {
    const birth = new Date(birthDate);
    const age14 = new Date(birth);
    age14.setFullYear(birth.getFullYear() + minAge);

    const currentDate = new Date();
    const maxDate = currentDate < age14 ? age14 : currentDate;

    // Случайная дата между minAge-летием и текущей датой
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


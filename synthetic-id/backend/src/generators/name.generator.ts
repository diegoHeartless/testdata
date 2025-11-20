import { Injectable } from '@nestjs/common';
import { DictionaryLoader, NamesDictionary } from '../utils/dictionary-loader';

@Injectable()
export class NameGenerator {
  private dictionaries: NamesDictionary;
  private loader: DictionaryLoader;

  constructor() {
    this.loader = new DictionaryLoader();
    this.dictionaries = this.loader.load<NamesDictionary>('names');
  }

  generateFullName(gender: 'male' | 'female'): {
    first_name: string;
    last_name: string;
    middle_name: string;
  } {
    // Выбор имени по полу
    const nameList = gender === 'male' ? this.dictionaries.male : this.dictionaries.female;
    const firstName = this.loader.getWeightedRandom(nameList).value;

    // Выбор фамилии
    const lastName = this.loader.getWeightedRandom(this.dictionaries.surnames).value;

    // Генерация отчества на основе имени отца
    const fatherName = this.loader.getWeightedRandom(this.dictionaries.male).value;
    const middleName = this.generatePatronymic(fatherName, gender);

    return {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
    };
  }

  private generatePatronymic(fatherName: string, gender: 'male' | 'female'): string {
    const lower = fatherName.toLowerCase();
    let stem = fatherName;

    // Удаление окончаний
    if (/[йь]$/.test(lower) || /[ая]$/.test(lower)) {
      stem = fatherName.slice(0, -1);
    }

    // Определение суффикса
    let suffix: string;
    if (/[йь]$/.test(lower) || /[еёию]$/.test(lower)) {
      suffix = gender === 'male' ? 'евич' : 'евна';
    } else {
      suffix = gender === 'male' ? 'ович' : 'овна';
    }

    return stem + suffix;
  }
}


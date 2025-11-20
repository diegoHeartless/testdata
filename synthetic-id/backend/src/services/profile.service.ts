import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Profile, GenerationParams, PersonalInfo } from '../types';
import { NameGenerator } from '../generators/name.generator';
import { DateGenerator } from '../generators/date.generator';
import { AddressGenerator } from '../generators/address.generator';
import { PassportGenerator } from '../generators/passport.generator';
import { INNGenerator } from '../generators/inn.generator';
import { SNILSGenerator } from '../generators/snils.generator';

@Injectable()
export class ProfileService {
  constructor(
    private nameGenerator: NameGenerator,
    private dateGenerator: DateGenerator,
    private addressGenerator: AddressGenerator,
    private passportGenerator: PassportGenerator,
    private innGenerator: INNGenerator,
    private snilsGenerator: SNILSGenerator,
  ) {}

  generate(params: GenerationParams): Profile {
    // Определение пола
    const gender =
      params.gender === 'random'
        ? Math.random() < 0.5
          ? 'male'
          : 'female'
        : params.gender || (Math.random() < 0.5 ? 'male' : 'female');

    // Генерация ФИО
    const name = this.nameGenerator.generateFullName(gender);

    // Генерация даты рождения
    const ageRange = params.age_range || [18, 65];
    const { birth_date, age } = this.dateGenerator.generateBirthDate(ageRange);

    // Генерация адреса
    const address = this.addressGenerator.generate(params.region);

    // Личная информация
    const personal: PersonalInfo = {
      ...name,
      gender,
      birth_date,
      age,
      birth_place: `${address.city}`,
    };

    // Генерация документов
    const includeDocuments = params.include_documents || [
      'passport',
      'inn',
      'snils',
    ];

    const profile: Profile = {
      id: uuidv4(),
      personal,
      address,
      created_at: new Date().toISOString(),
    };

    // Паспорт
    if (includeDocuments.includes('passport')) {
      profile.passport = this.passportGenerator.generate(
        address.region,
        birth_date,
      );
    }

    // ИНН
    if (includeDocuments.includes('inn')) {
      profile.inn = this.innGenerator.generate(address.region);
    }

    // СНИЛС
    if (includeDocuments.includes('snils')) {
      profile.snils = this.snilsGenerator.generate();
    }

    // Водительские права (TODO)
    if (includeDocuments.includes('driver_license')) {
      // Будет реализовано позже
    }

    // Полис ОМС (TODO)
    if (includeDocuments.includes('oms')) {
      // Будет реализовано позже
    }

    return profile;
  }
}


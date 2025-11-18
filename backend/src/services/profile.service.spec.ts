import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { NameGenerator } from '../generators/name.generator';
import { DateGenerator } from '../generators/date.generator';
import { AddressGenerator } from '../generators/address.generator';
import { PassportGenerator } from '../generators/passport.generator';
import { INNGenerator } from '../generators/inn.generator';
import { SNILSGenerator } from '../generators/snils.generator';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        NameGenerator,
        DateGenerator,
        AddressGenerator,
        PassportGenerator,
        INNGenerator,
        SNILSGenerator,
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should generate complete profile', () => {
      const params = {
        gender: 'male' as const,
        age_range: [25, 35] as [number, number],
        include_documents: ['passport', 'inn', 'snils'],
      };

      const profile = service.generate(params);

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('personal');
      expect(profile).toHaveProperty('address');
      expect(profile).toHaveProperty('created_at');
    });

    it('should generate profile with specified gender', () => {
      const maleProfile = service.generate({ gender: 'male' });
      const femaleProfile = service.generate({ gender: 'female' });

      expect(maleProfile.personal.gender).toBe('male');
      expect(femaleProfile.personal.gender).toBe('female');
    });

    it('should generate profile with random gender when not specified', () => {
      const profile = service.generate({});
      expect(['male', 'female']).toContain(profile.personal.gender);
    });

    it('should generate profile with age in specified range', () => {
      const ageRange: [number, number] = [30, 40];
      const profile = service.generate({ age_range: ageRange });

      expect(profile.personal.age).toBeGreaterThanOrEqual(ageRange[0]);
      expect(profile.personal.age).toBeLessThanOrEqual(ageRange[1]);
    });

    it('should generate passport when requested', () => {
      const profile = service.generate({
        include_documents: ['passport'],
      });

      expect(profile.passport).toBeDefined();
      expect(profile.passport?.series).toBeTruthy();
      expect(profile.passport?.number).toBeTruthy();
    });

    it('should generate INN when requested', () => {
      const profile = service.generate({
        include_documents: ['inn'],
      });

      expect(profile.inn).toBeDefined();
      expect(profile.inn).toMatch(/^\d{12}$/);
    });

    it('should generate SNILS when requested', () => {
      const profile = service.generate({
        include_documents: ['snils'],
      });

      expect(profile.snils).toBeDefined();
      expect(profile.snils).toMatch(/^\d{3}-\d{3}-\d{3} \d{2}$/);
    });

    it('should generate all documents when all requested', () => {
      const profile = service.generate({
        include_documents: ['passport', 'inn', 'snils'],
      });

      expect(profile.passport).toBeDefined();
      expect(profile.inn).toBeDefined();
      expect(profile.snils).toBeDefined();
    });

    it('should generate profile for specified region', () => {
      const profile = service.generate({ region: '77' });
      expect(profile.address.region).toBe('77');
    });

    it('should generate unique IDs', () => {
      const profiles = Array.from({ length: 10 }, () =>
        service.generate({}),
      );
      const ids = profiles.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('should generate valid personal info', () => {
      const profile = service.generate({});

      expect(profile.personal.first_name).toBeTruthy();
      expect(profile.personal.last_name).toBeTruthy();
      expect(profile.personal.middle_name).toBeTruthy();
      expect(profile.personal.birth_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(profile.personal.birth_place).toBeTruthy();
    });
  });
});


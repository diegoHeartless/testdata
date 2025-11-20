import { Test, TestingModule } from '@nestjs/testing';
import { NameGenerator } from './name.generator';
import * as path from 'path';
import * as fs from 'fs';

describe('NameGenerator', () => {
  let generator: NameGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NameGenerator],
    }).compile();

    generator = module.get<NameGenerator>(NameGenerator);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('generateFullName', () => {
    it('should generate male full name', () => {
      const result = generator.generateFullName('male');

      expect(result).toHaveProperty('first_name');
      expect(result).toHaveProperty('last_name');
      expect(result).toHaveProperty('middle_name');
      expect(result.first_name).toBeTruthy();
      expect(result.last_name).toBeTruthy();
      expect(result.middle_name).toBeTruthy();
      expect(result.middle_name).toMatch(/ович$/);
    });

    it('should generate female full name', () => {
      const result = generator.generateFullName('female');

      expect(result).toHaveProperty('first_name');
      expect(result).toHaveProperty('last_name');
      expect(result).toHaveProperty('middle_name');
      expect(result.first_name).toBeTruthy();
      expect(result.last_name).toBeTruthy();
      expect(result.middle_name).toBeTruthy();
      expect(result.middle_name).toMatch(/овна$|евна$/);
    });

    it('should generate different names on multiple calls', () => {
      const results = Array.from({ length: 10 }, () =>
        generator.generateFullName('male'),
      );
      const uniqueNames = new Set(results.map((r) => r.first_name));
      // С высокой вероятностью должны быть разные имена
      expect(uniqueNames.size).toBeGreaterThan(1);
    });

    it('should generate valid patronymic endings', () => {
      const maleResult = generator.generateFullName('male');
      const femaleResult = generator.generateFullName('female');

      expect(maleResult.middle_name).toMatch(/ович$|евич$/);
      expect(femaleResult.middle_name).toMatch(/овна$|евна$/);
    });
  });
});


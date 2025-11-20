import { Test, TestingModule } from '@nestjs/testing';
import { INNGenerator } from './inn.generator';

describe('INNGenerator', () => {
  let generator: INNGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [INNGenerator],
    }).compile();

    generator = module.get<INNGenerator>(INNGenerator);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('generate', () => {
    it('should generate 12-digit INN', () => {
      const inn = generator.generate('77');
      expect(inn).toHaveLength(12);
      expect(inn).toMatch(/^\d{12}$/);
    });

    it('should start with region code', () => {
      const inn = generator.generate('77');
      expect(inn.startsWith('77')).toBe(true);
    });

    it('should generate different INNs', () => {
      const inns = Array.from({ length: 10 }, () => generator.generate('77'));
      const unique = new Set(inns);
      expect(unique.size).toBeGreaterThan(1);
    });

    it('should generate valid INN (pass validation)', () => {
      const inn = generator.generate('77');
      expect(generator.validate(inn)).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate correctly generated INN', () => {
      const inn = generator.generate('50');
      expect(generator.validate(inn)).toBe(true);
    });

    it('should reject invalid length', () => {
      expect(generator.validate('12345678901')).toBe(false);
      expect(generator.validate('1234567890123')).toBe(false);
    });

    it('should reject non-numeric INN', () => {
      expect(generator.validate('12345678901a')).toBe(false);
    });

    it('should reject INN with invalid checksum', () => {
      // Генерируем валидный ИНН и меняем последнюю цифру
      const validInn = generator.generate('77');
      const lastDigit = parseInt(validInn[11]);
      const newLastDigit = (lastDigit + 1) % 10;
      const invalidInn = validInn.slice(0, 11) + newLastDigit.toString();
      expect(generator.validate(invalidInn)).toBe(false);
    });
  });
});


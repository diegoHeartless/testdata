import { Test, TestingModule } from '@nestjs/testing';
import { SNILSGenerator } from './snils.generator';

describe('SNILSGenerator', () => {
  let generator: SNILSGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SNILSGenerator],
    }).compile();

    generator = module.get<SNILSGenerator>(SNILSGenerator);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('generate', () => {
    it('should generate SNILS in correct format', () => {
      const snils = generator.generate();
      expect(snils).toMatch(/^\d{3}-\d{3}-\d{3} \d{2}$/);
    });

    it('should generate different SNILS', () => {
      const snilses = Array.from({ length: 10 }, () => generator.generate());
      const unique = new Set(snilses);
      expect(unique.size).toBeGreaterThan(1);
    });

    it('should generate valid SNILS (pass validation)', () => {
      const snils = generator.generate();
      expect(generator.validate(snils)).toBe(true);
    });

    it('should not start with forbidden combinations', () => {
      for (let i = 0; i < 20; i++) {
        const snils = generator.generate();
        const firstThree = snils.slice(0, 3);
        expect(['000', '001', '002']).not.toContain(firstThree);
      }
    });
  });

  describe('validate', () => {
    it('should validate correctly generated SNILS', () => {
      const snils = generator.generate();
      expect(generator.validate(snils)).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(generator.validate('123-456-789 12')).toBe(false);
      expect(generator.validate('123456789012')).toBe(false);
    });

    it('should reject SNILS with forbidden first digits', () => {
      // Генерируем SNILS с запрещенными первыми цифрами
      const invalidSnils = '000-123-456 00';
      expect(generator.validate(invalidSnils)).toBe(false);
    });

    it('should reject SNILS with invalid checksum', () => {
      const validSnils = generator.generate();
      const digits = validSnils.replace(/[-\s]/g, '');
      const invalidChecksum = digits.slice(0, 9) + '00';
      const invalidSnils = `${invalidChecksum.slice(0, 3)}-${invalidChecksum.slice(3, 6)}-${invalidChecksum.slice(6, 9)} ${invalidChecksum.slice(9)}`;
      expect(generator.validate(invalidSnils)).toBe(false);
    });
  });
});


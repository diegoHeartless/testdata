import { Test, TestingModule } from '@nestjs/testing';
import { PassportGenerator } from './passport.generator';

describe('PassportGenerator', () => {
  let generator: PassportGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassportGenerator],
    }).compile();

    generator = module.get<PassportGenerator>(PassportGenerator);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('generate', () => {
    it('should generate passport with all required fields', () => {
      const result = generator.generate('77', '1990-01-01');

      expect(result).toHaveProperty('series');
      expect(result).toHaveProperty('number');
      expect(result).toHaveProperty('issued_by');
      expect(result).toHaveProperty('division_code');
      expect(result).toHaveProperty('issue_date');
    });

    it('should generate series in correct format', () => {
      const result = generator.generate('77', '1990-01-01');
      expect(result.series).toMatch(/^\d{2} \d{2}$/);
    });

    it('should generate 6-digit number', () => {
      const result = generator.generate('77', '1990-01-01');
      expect(result.number).toHaveLength(6);
      expect(result.number).toMatch(/^\d{6}$/);
    });

    it('should generate issue date after 14 years from birth', () => {
      const birthDate = '2000-01-01';
      const result = generator.generate('77', birthDate);

      const birth = new Date(birthDate);
      const issue = new Date(result.issue_date);
      const age14 = new Date(birth);
      age14.setFullYear(birth.getFullYear() + 14);

      expect(issue.getTime()).toBeGreaterThanOrEqual(age14.getTime());
    });

    it('should generate different numbers', () => {
      const results = Array.from({ length: 10 }, () =>
        generator.generate('77', '1990-01-01'),
      );
      const uniqueNumbers = new Set(results.map((r) => r.number));
      expect(uniqueNumbers.size).toBeGreaterThan(1);
    });

    it('should include division code', () => {
      const result = generator.generate('77', '1990-01-01');
      expect(result.division_code).toBeTruthy();
      expect(result.division_code).toMatch(/^\d{3}-\d{3}$/);
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { DateGenerator } from './date.generator';

describe('DateGenerator', () => {
  let generator: DateGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateGenerator],
    }).compile();

    generator = module.get<DateGenerator>(DateGenerator);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('generateBirthDate', () => {
    it('should generate birth date within age range', () => {
      const ageRange: [number, number] = [25, 35];
      const result = generator.generateBirthDate(ageRange);

      expect(result).toHaveProperty('birth_date');
      expect(result).toHaveProperty('age');
      expect(result.age).toBeGreaterThanOrEqual(ageRange[0]);
      expect(result.age).toBeLessThanOrEqual(ageRange[1]);
      expect(result.birth_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should generate valid date format', () => {
      const ageRange: [number, number] = [30, 30];
      const result = generator.generateBirthDate(ageRange);

      const date = new Date(result.birth_date);
      expect(date.getTime()).not.toBeNaN();
    });

    it('should calculate age correctly', () => {
      const ageRange: [number, number] = [40, 40];
      const result = generator.generateBirthDate(ageRange);

      const birthDate = new Date(result.birth_date);
      const currentDate = new Date();
      const calculatedAge = currentDate.getFullYear() - birthDate.getFullYear();

      expect(Math.abs(calculatedAge - result.age)).toBeLessThanOrEqual(1);
    });

    it('should handle different age ranges', () => {
      const ranges: Array<[number, number]> = [
        [18, 25],
        [30, 50],
        [60, 80],
      ];

      ranges.forEach((range) => {
        const result = generator.generateBirthDate(range);
        expect(result.age).toBeGreaterThanOrEqual(range[0]);
        expect(result.age).toBeLessThanOrEqual(range[1]);
      });
    });
  });

  describe('generateIssueDate', () => {
    it('should generate issue date after 14 years from birth', () => {
      const birthDate = '2000-01-01';
      const issueDate = generator.generateIssueDate(birthDate);

      const birth = new Date(birthDate);
      const issue = new Date(issueDate);
      const age14 = new Date(birth);
      age14.setFullYear(birth.getFullYear() + 14);

      expect(issue.getTime()).toBeGreaterThanOrEqual(age14.getTime());
      expect(issue.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should generate valid date format', () => {
      const birthDate = '1990-06-15';
      const issueDate = generator.generateIssueDate(birthDate);

      expect(issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(issueDate);
      expect(date.getTime()).not.toBeNaN();
    });
  });
});


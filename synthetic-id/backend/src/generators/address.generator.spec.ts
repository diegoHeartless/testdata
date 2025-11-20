import { Test, TestingModule } from '@nestjs/testing';
import { AddressGenerator } from './address.generator';

describe('AddressGenerator', () => {
  let generator: AddressGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressGenerator],
    }).compile();

    generator = module.get<AddressGenerator>(AddressGenerator);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('generate', () => {
    it('should generate address with all required fields', () => {
      const result = generator.generate();

      expect(result).toHaveProperty('region');
      expect(result).toHaveProperty('region_name');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('street');
      expect(result).toHaveProperty('house');
      expect(result).toHaveProperty('postal_code');
    });

    it('should generate address for specified region', () => {
      const result = generator.generate('77');
      expect(result.region).toBe('77');
    });

    it('should generate random region when not specified', () => {
      const result = generator.generate();
      expect(result.region).toBeTruthy();
      expect(result.region_name).toBeTruthy();
    });

    it('should generate valid postal code', () => {
      const result = generator.generate();
      expect(result.postal_code).toMatch(/^\d{6}$/);
    });

    it('should generate house number', () => {
      const result = generator.generate();
      expect(result.house).toBeTruthy();
      expect(result.house.length).toBeGreaterThan(0);
    });

    it('should sometimes include apartment', () => {
      let hasApartment = false;
      for (let i = 0; i < 20; i++) {
        const result = generator.generate();
        if (result.apartment) {
          hasApartment = true;
          break;
        }
      }
      // С высокой вероятностью хотя бы один адрес будет с квартирой
      expect(hasApartment).toBe(true);
    });

    it('should throw error for invalid region code', () => {
      expect(() => generator.generate('999')).toThrow();
    });
  });
});


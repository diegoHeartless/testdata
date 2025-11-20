import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { ProfileService } from '../../services/profile.service';
import { NameGenerator } from '../../generators/name.generator';
import { DateGenerator } from '../../generators/date.generator';
import { AddressGenerator } from '../../generators/address.generator';
import { PassportGenerator } from '../../generators/passport.generator';
import { INNGenerator } from '../../generators/inn.generator';
import { SNILSGenerator } from '../../generators/snils.generator';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let coreService: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        ProfileService,
        NameGenerator,
        DateGenerator,
        AddressGenerator,
        PassportGenerator,
        INNGenerator,
        SNILSGenerator,
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    coreService = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should generate and store profile', async () => {
      const params = { gender: 'male' as const };
      const profile = await service.generate(params);

      expect(profile).toBeDefined();
      expect(profile.id).toBeTruthy();
    });

    it('should store generated profile', async () => {
      const params = { gender: 'male' as const };
      const profile = await service.generate(params);

      const found = await service.findById(profile.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(profile.id);
    });
  });

  describe('findById', () => {
    it('should return profile if exists', async () => {
      const profile = await service.generate({});
      const found = await service.findById(profile.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(profile.id);
    });

    it('should return null if profile not found', async () => {
      const found = await service.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('list', () => {
    it('should return empty list when no profiles', async () => {
      const result = await service.list(1, 20);
      expect(result.profiles).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should return paginated profiles', async () => {
      // Генерируем несколько профилей
      for (let i = 0; i < 5; i++) {
        await service.generate({});
      }

      const result = await service.list(1, 2);
      expect(result.profiles.length).toBeLessThanOrEqual(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
    });

    it('should calculate pagination correctly', async () => {
      for (let i = 0; i < 10; i++) {
        await service.generate({});
      }

      const result = await service.list(1, 3);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.total_pages).toBe(Math.ceil(10 / 3));
    });
  });

  describe('delete', () => {
    it('should delete profile', async () => {
      const profile = await service.generate({});
      await service.delete(profile.id);

      const found = await service.findById(profile.id);
      expect(found).toBeNull();
    });

    it('should not throw error when deleting non-existent profile', async () => {
      await expect(service.delete('non-existent-id')).resolves.not.toThrow();
    });
  });
});


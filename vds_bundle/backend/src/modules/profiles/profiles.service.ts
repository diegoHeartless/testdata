import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Profile, GenerationParams } from '../../types';
import { ProfileService as CoreProfileService } from '../../services/profile.service';
import { ProfileEntity } from '../../database/entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    private coreProfileService: CoreProfileService,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
  ) {}

  async generate(
    params: GenerationParams,
    options?: { sourceKeyId?: string },
  ): Promise<Profile> {
    const profile = this.coreProfileService.generate(params);

    const entity = this.profileRepository.create({
      id: profile.id,
      payload: profile as Record<string, unknown>,
      sourceKeyId: options?.sourceKeyId,
      expiresAt: profile.expires_at ? new Date(profile.expires_at) : null,
    });

    const saved = await this.profileRepository.save(entity);

    profile.created_at = saved.createdAt.toISOString();
    if (saved.expiresAt) {
      profile.expires_at = saved.expiresAt.toISOString();
    }

    return profile;
  }

  async findById(id: string): Promise<Profile | null> {
    const entity = await this.profileRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!entity) {
      return null;
    }

    return this.mapEntityToProfile(entity);
  }

  async list(page: number = 1, limit: number = 20): Promise<{
    profiles: Array<{ id: string; personal: any; created_at: string }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const normalizedPage = page < 1 ? 1 : page;
    const normalizedLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const [items, total] = await this.profileRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: normalizedLimit,
    });

    return {
      profiles: items.map((entity) => {
        const profile = this.mapEntityToProfile(entity);
        return {
          id: profile.id,
          personal: profile.personal,
          created_at: profile.created_at,
        };
      }),
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        total_pages: Math.ceil(total / normalizedLimit),
      },
    };
  }

  async delete(id: string): Promise<void> {
    await this.profileRepository.update(
      { id },
      {
        deletedAt: new Date(),
      },
    );
  }

  private mapEntityToProfile(entity: ProfileEntity): Profile {
    const payload = entity.payload as Profile;
    return {
      ...payload,
      id: entity.id,
      created_at: entity.createdAt.toISOString(),
      expires_at: entity.expiresAt
        ? entity.expiresAt.toISOString()
        : payload.expires_at,
    };
  }
}


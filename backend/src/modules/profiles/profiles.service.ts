import { Injectable } from '@nestjs/common';
import { Profile, GenerationParams } from '../../types';
import { ProfileService as CoreProfileService } from '../../services/profile.service';

@Injectable()
export class ProfilesService {
  private profiles: Map<string, Profile> = new Map();

  constructor(private coreProfileService: CoreProfileService) {}

  async generate(params: GenerationParams): Promise<Profile> {
    const profile = this.coreProfileService.generate(params);
    
    // Сохранение в памяти (для MVP)
    this.profiles.set(profile.id, profile);
    
    return profile;
  }

  async findById(id: string): Promise<Profile | null> {
    return this.profiles.get(id) || null;
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
    const allProfiles = Array.from(this.profiles.values());
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = allProfiles.slice(start, end);

    return {
      profiles: paginated.map((p) => ({
        id: p.id,
        personal: p.personal,
        created_at: p.created_at,
      })),
      pagination: {
        page,
        limit,
        total: allProfiles.length,
        total_pages: Math.ceil(allProfiles.length / limit),
      },
    };
  }

  async delete(id: string): Promise<void> {
    this.profiles.delete(id);
  }
}


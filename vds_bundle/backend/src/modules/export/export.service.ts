import { Injectable } from '@nestjs/common';
import { Profile } from '../../types';

@Injectable()
export class ExportService {
  toJSON(profile: Profile): Profile {
    return profile;
  }

  // TODO: Реализовать экспорт в PDF
  async toPDF(profile: Profile): Promise<Buffer> {
    throw new Error('PDF export not yet implemented');
  }
}


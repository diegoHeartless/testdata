import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfileService } from '../../services/profile.service';
import { NameGenerator } from '../../generators/name.generator';
import { DateGenerator } from '../../generators/date.generator';
import { AddressGenerator } from '../../generators/address.generator';
import { PassportGenerator } from '../../generators/passport.generator';
import { INNGenerator } from '../../generators/inn.generator';
import { SNILSGenerator } from '../../generators/snils.generator';

@Module({
  controllers: [ProfilesController],
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
  exports: [ProfilesService],
})
export class ProfilesModule {}


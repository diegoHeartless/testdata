import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ExportModule } from './modules/export/export.module';
import { RedisThrottleStorage } from './modules/auth/storage/redis-throttle.storage';
import { ApiKeyThrottlerGuard } from './modules/auth/guards/api-key-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const storage = new RedisThrottleStorage();
        return {
          throttlers: [
            {
              name: 'default',
              limit: config.get<number>('THROTTLE_LIMIT', 100),
              ttl: 60000, // 1 минута
            },
          ],
          storage,
        };
      },
    }),
    AuthModule,
    ProfilesModule,
    ExportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyThrottlerGuard,
    },
  ],
})
export class AppModule {}


import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ExportModule } from './modules/export/export.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { RedisThrottleStorage } from './modules/auth/storage/redis-throttle.storage';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { AuditLogMiddleware } from './middleware/audit-log.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('LOG_LEVEL', 'info'),
          transport:
            config.get<string>('NODE_ENV') === 'development'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                  },
                }
              : undefined,
          serializers: {
            req: (req) => ({
              id: req.id,
              method: req.method,
              url: req.url,
            }),
            res: (res) => ({
              statusCode: res.statusCode,
            }),
          },
        },
      }),
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
    MetricsModule,
  ],
  providers: [RequestIdMiddleware, AuditLogMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, AuditLogMiddleware).forRoutes('*');
  }
}


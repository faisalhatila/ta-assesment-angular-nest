import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CurrencyModule } from './currency/currency.module';
import { ConversionsModule } from './conversions/conversions.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuthModule,
    UsersModule,
    RolesModule,
    CurrencyModule,
    ConversionsModule,
    RedisModule,
    HealthModule,
    CommonModule,
  ],
})
export class AppModule {}

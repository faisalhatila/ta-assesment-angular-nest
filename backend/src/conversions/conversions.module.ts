import { Module } from '@nestjs/common';
import { ConversionsService } from './conversions.service';
import { ConversionsController } from './conversions.controller';
import { CurrencyModule } from '../currency/currency.module';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';
import { FingerprintGuard } from '../common/guards/fingerprint.guard';

@Module({
  imports: [CurrencyModule, UsersModule, RedisModule],
  controllers: [ConversionsController],
  providers: [ConversionsService, FingerprintGuard],
})
export class ConversionsModule {}

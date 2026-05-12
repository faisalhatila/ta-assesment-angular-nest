import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import { ConversionsService } from './conversions.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { ConversionHistoryQueryDto } from './dto/conversion-history-query.dto';
import { FingerprintGuard } from '../common/guards/fingerprint.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('conversions')
@Controller('conversions')
export class ConversionsController {
  constructor(private readonly conversionsService: ConversionsService) {}

  @Post('convert')
  @Roles('user', 'admin')
  @UseGuards(FingerprintGuard)
  convert(
    @Body() dto: ConvertCurrencyDto,
    @CurrentUser() user: AuthUser,
    @Req() req: { fingerprint: string },
  ) {
    return this.conversionsService.convert(dto, user, req.fingerprint);
  }

  @Get('history')
  @Roles('user', 'admin')
  history(
    @CurrentUser() user: AuthUser,
    @Query() query: ConversionHistoryQueryDto,
  ) {
    return this.conversionsService.history(user.id, query);
  }
}

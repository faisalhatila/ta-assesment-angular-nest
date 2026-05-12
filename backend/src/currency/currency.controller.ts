import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { GetRatesDto } from './dto/get-rates.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly usersService: UsersService,
  ) {}

  @Get('supported')
  @ApiOperation({ summary: 'List supported currencies from Supabase (auth required)' })
  async getSupportedCurrencies() {
    const currencies = await this.usersService.getSupportedCurrencies();
    return { data: currencies };
  }

  @Get('symbols')
  @Public()
  getSymbols() {
    return this.currencyService.getSymbols();
  }

  @Get('latest')
  @Public()
  getLatest(@Query() query: GetRatesDto) {
    return this.currencyService.getLatest(query.base);
  }

  @Get('historical')
  @Public()
  getHistorical(@Query() query: GetRatesDto) {
    if (!query.date) {
      throw new BadRequestException('date is required');
    }
    return this.currencyService.getHistorical(query.base, query.date);
  }
}

import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class ConvertCurrencyDto {
  @IsString()
  @Length(3, 3)
  from!: string;

  @IsString()
  @Length(3, 3)
  to!: string;

  @IsNumber()
  @Min(0.000001)
  amount!: number;

  @IsOptional()
  @IsISO8601({ strict: true })
  date?: string;
}

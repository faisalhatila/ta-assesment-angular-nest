import { IsISO8601, IsOptional, IsString, Length } from 'class-validator';

export class GetRatesDto {
  @IsString()
  @Length(3, 3)
  base!: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  date?: string;
}

import { IsOptional, IsString } from 'class-validator';

export class GetHistoriesByFilterDTO {
    @IsString()
    @IsOptional()
    date?: string;
    @IsString()
    @IsOptional()
    theme?: string;
    @IsString()
    @IsOptional()
    character?: string;
}

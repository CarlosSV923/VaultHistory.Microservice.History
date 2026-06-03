import { IsOptional, IsString } from 'class-validator';

export class GenerateHistoryDTO {
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

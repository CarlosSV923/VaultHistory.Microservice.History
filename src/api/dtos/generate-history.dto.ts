import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateHistoryRequestDTO {
    @ApiPropertyOptional({
        example: '1999-12-31',
        description: 'Date used to generate the history',
    })
    @IsString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({
        example: 'medieval fantasy',
        description: 'Theme for the generated history',
    })
    @IsString()
    @IsOptional()
    theme?: string;

    @ApiPropertyOptional({
        example: 'Arthur',
        description: 'Character for the generated history',
    })
    @IsString()
    @IsOptional()
    character?: string;
}

export class GenerateHistoryResponseDTO {
    @ApiPropertyOptional({
        example: 'Once upon a time...',
        description: 'The generated history content',
    })
    history!: string;
}

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateQueryHistoryRequestDTO {
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

export class GenerateSubHistoryRequestDTO {
    @ApiPropertyOptional({
        example: 'user-123',
        description: 'User ID for whom the history is generated',
    })
    @IsString()
    userId!: string;

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

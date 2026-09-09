import { IsIP, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

    @IsString()
    @IsOptional()
    idempotencyKey?: string;
}

export class GenerateHistoryResponseDTO {
    @ApiPropertyOptional({
        example: 'Once upon a time...',
        description: 'The generated history content',
    })
    history!: string;
}

export class GenerateAnonymousHistoryRequestDTO {
    @ApiProperty({ example: '203.0.113.5', description: 'Single IPv4 or IPv6 address used only for the daily quota' })
    @IsString()
    @IsNotEmpty()
    @IsIP()
    ip!: string;

    @ApiPropertyOptional({ maxLength: 50 })
    @IsString()
    @MaxLength(50)
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({ maxLength: 120 })
    @IsString()
    @MaxLength(120)
    @IsOptional()
    theme?: string;

    @ApiPropertyOptional({ maxLength: 120 })
    @IsString()
    @MaxLength(120)
    @IsOptional()
    character?: string;
}

export class AnonymousUsageResponseDTO {
    @ApiProperty({ example: 3 })
    limit!: number;

    @ApiProperty({ example: 2 })
    remaining!: number;

    @ApiProperty({ example: '2026-09-09T00:00:00.000Z' })
    resetAt!: string;
}

export class GenerateAnonymousHistoryResponseDTO extends GenerateHistoryResponseDTO {
    @ApiProperty({ type: AnonymousUsageResponseDTO })
    usage!: AnonymousUsageResponseDTO;
}

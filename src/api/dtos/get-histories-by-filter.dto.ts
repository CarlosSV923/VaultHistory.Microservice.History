import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HistoryResponseDTO } from './history-response.dto';
import {
    HistoryType,
    type HistoryType as HistoryTypeValue,
} from '@domain/histories/history.type.enum';
export class GetHistoriesByFilterRequestDTO {
    @ApiPropertyOptional({
        enum: Object.values(HistoryType),
        example: HistoryType.QUERY,
        description: 'Type used to filter the histories',
    })
    @IsIn(Object.values(HistoryType))
    @IsOptional()
    type?: HistoryTypeValue;

    @ApiPropertyOptional({
        example: '1999-12-31',
        description: 'Date used to filter the histories',
    })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({
        example: 'medieval fantasy',
        description: 'Theme used to filter the histories',
    })
    @IsString()
    @IsOptional()
    theme?: string;

    @ApiPropertyOptional({
        example: 'Arthur',
        description: 'Character used to filter the histories',
    })
    @IsString()
    @IsOptional()
    character?: string;

    @ApiPropertyOptional({
        minimum: 1,
        default: 1,
        example: 1,
        description: 'One-based page number',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 100,
        default: 20,
        example: 20,
        description: 'Maximum number of histories returned per page',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    pageSize?: number;
}

export class GetAnonymousHistoriesRequestDTO {
    @ApiPropertyOptional({
        minimum: 1,
        default: 1,
        example: 1,
        description: 'One-based page number',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 100,
        default: 20,
        example: 20,
        description: 'Maximum number of anonymous histories returned per page',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    pageSize?: number;
}

export class HistoryPaginationMetaDTO {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 20 })
    pageSize!: number;

    @ApiProperty({ example: 37 })
    total!: number;

    @ApiProperty({ example: 2 })
    totalPages!: number;
}

export class GetHistoriesByFilterResponseDTO {
    @ApiProperty({
        type: [HistoryResponseDTO],
        example: [
            {
                id: '665f1b2c9a7e4a001234abcd',
                content: 'Once upon a time...',
                type: 'query',
                date: '1999-12-31',
                theme: 'medieval fantasy',
                character: 'a retired knight',
                generateAt: '2026-06-03T16:00:00.000Z',
            },
        ],
    })
    histories!: HistoryResponseDTO[];

    @ApiProperty({ type: HistoryPaginationMetaDTO })
    meta!: HistoryPaginationMetaDTO;
}

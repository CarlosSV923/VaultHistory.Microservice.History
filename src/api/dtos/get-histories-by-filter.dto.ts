import { IsIn, IsOptional, IsString } from 'class-validator';
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
    @IsString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({
        example: 'medieval fantasy',
        description: 'Theme used to filter the histories',
    })
    @IsOptional()
    theme?: string;

    @ApiPropertyOptional({
        example: 'Arthur',
        description: 'Character used to filter the histories',
    })
    @IsString()
    @IsOptional()
    character?: string;
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
}

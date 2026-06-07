import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HistoryResponseDTO } from './history-response.dto';
export class GetHistoriesByFilterRequestDTO {
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
                date: '1999-12-31',
                theme: 'medieval fantasy',
                character: 'a retired knight',
                generateAt: '2026-06-03T16:00:00.000Z',
            },
        ],
    })
    histories!: HistoryResponseDTO[];
}

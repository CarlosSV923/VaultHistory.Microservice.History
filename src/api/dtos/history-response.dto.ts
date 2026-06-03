import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HistoryResponseDTO {
    @ApiProperty({ example: '665f1b2c9a7e4a001234abcd' })
    id!: string | null;

    @ApiProperty({ example: 'Once upon a time...' })
    content!: string;

    @ApiPropertyOptional({ example: '1999-12-31' })
    date?: string;

    @ApiPropertyOptional({ example: 'medieval fantasy' })
    theme?: string;

    @ApiPropertyOptional({ example: 'a retired knight' })
    character?: string;

    @ApiProperty({ example: '2026-06-03T16:00:00.000Z' })
    generateAt!: Date;
}

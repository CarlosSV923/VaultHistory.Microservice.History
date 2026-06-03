import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeactivateHistoryByIdRequestDTO {
    @ApiProperty({ example: '665f1b2c9a7e4a001234abcd' })
    @IsString()
    @IsNotEmpty()
    id!: string;
}

export class DeactivateHistoryByIdResponseDTO {
    @ApiProperty({ example: 'History deactivated successfully' })
    message!: string;
}

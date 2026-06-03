import { ApiProperty } from '@nestjs/swagger';

export class DeactivateHistoriesByUserIdResponseDTO {
    @ApiProperty({ example: 'Histories deactivated successfully' })
    message!: string;
}

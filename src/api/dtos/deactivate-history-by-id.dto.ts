import { IsNotEmpty, IsString } from 'class-validator';

export class DeactivateHistoryByIdDTO {
    @IsString()
    @IsNotEmpty()
    id!: string;
}

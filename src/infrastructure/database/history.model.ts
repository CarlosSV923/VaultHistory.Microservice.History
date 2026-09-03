import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
    HistoryType,
    type HistoryType as HistoryTypeValue,
} from '@domain/histories/history.type.enum';

@Schema()
export class History {
    @Prop({ required: true })
    userId!: string;

    @Prop({ type: String, required: true, enum: Object.values(HistoryType) })
    type!: HistoryTypeValue;

    @Prop({ required: false })
    date?: string;

    @Prop({ required: false })
    theme?: string;

    @Prop({ required: true })
    content!: string;

    @Prop({ required: false })
    character?: string;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ default: Date.now })
    generateAt!: Date;
}

export type HistoryDocument = HydratedDocument<History>;

export const HistorySchema = SchemaFactory.createForClass(History);

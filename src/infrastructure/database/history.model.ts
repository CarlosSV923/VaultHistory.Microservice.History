import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class History {
    @Prop({ required: true })
    userId!: string;

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

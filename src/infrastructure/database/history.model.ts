import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
    HistoryType,
    type HistoryType as HistoryTypeValue,
} from '@domain/histories/history.type.enum';

@Schema()
export class History {
    @Prop({ required: function (this: History) { return this.type !== HistoryType.ANONYMOUS; } })
    userId?: string;

    @Prop({ required: false, select: false })
    anonymousVisitorKey?: string;

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

    @Prop({ required: false, unique: true, sparse: true })
    idempotencyKey?: string;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ default: Date.now })
    generateAt!: Date;
}

export type HistoryDocument = HydratedDocument<History>;

export const HistorySchema = SchemaFactory.createForClass(History);

HistorySchema.index({ userId: 1, isActive: 1, generateAt: -1, _id: -1 });
HistorySchema.index({ type: 1, anonymousVisitorKey: 1, isActive: 1, generateAt: -1, _id: -1 });

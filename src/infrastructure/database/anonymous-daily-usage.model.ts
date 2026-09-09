import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'anonymous_daily_usage' })
export class AnonymousDailyUsage {
    @Prop({ type: String, required: true })
    ip!: string;

    @Prop({ type: String, required: true })
    day!: string;

    @Prop({ type: Number, required: true, default: 0, min: 0 })
    used!: number;
}

export type AnonymousDailyUsageDocument = HydratedDocument<AnonymousDailyUsage>;

export const AnonymousDailyUsageSchema = SchemaFactory.createForClass(AnonymousDailyUsage);
AnonymousDailyUsageSchema.index({ ip: 1, day: 1 }, { unique: true });

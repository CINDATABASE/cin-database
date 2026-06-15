import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Discipline', required: true })
  disciplineId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Material', required: false })
  materialId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  difficulty: number;

  @Prop({ required: true, min: 1, max: 5 })
  didactics: number;

  @Prop({ required: false, default: '' })
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

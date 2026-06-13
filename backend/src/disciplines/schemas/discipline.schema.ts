import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DisciplineDocument = Discipline & Document;

@Schema({ timestamps: true })
export class Discipline {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  period: number;

  @Prop({ required: true })
  professor: string;

  @Prop({ required: true })
  description: string;
}

export const DisciplineSchema = SchemaFactory.createForClass(Discipline);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DisciplineDocument = Discipline & Document;

@Schema({ timestamps: true })
@Schema({ collection: 'disciplines' })
export class Discipline {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  professor: string;
}

export const DisciplineSchema = SchemaFactory.createForClass(Discipline);

DisciplineSchema.index({ name: 1, professor: 1 }, { unique: true });

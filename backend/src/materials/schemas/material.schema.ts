import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MaterialDocument = Material & Document;

@Schema({ timestamps: true })
export class Material {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  disciplineId: string;

  @Prop({ required: true })
  disciplineName: string;

  @Prop({ required: true })
  professor: string;

  @Prop({ required: true, enum: ['VIDEO', 'PROVA', 'LISTA'] })
  type: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop({ default: false })
  isApproved: boolean;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

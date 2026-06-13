import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisciplinesService } from './disciplines.service';
import { DisciplinesController } from './disciplines.controller';
import { Discipline, DisciplineSchema } from './schemas/discipline.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Discipline.name, schema: DisciplineSchema },
    ]),
  ],
  controllers: [DisciplinesController],
  providers: [DisciplinesService],
  exports: [DisciplinesService],
})
export class DisciplinesModule {}

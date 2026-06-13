import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discipline, DisciplineDocument } from './schemas/discipline.schema';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Injectable()
export class DisciplinesService {
  constructor(
    @InjectModel(Discipline.name)
    private disciplineModel: Model<DisciplineDocument>,
  ) {}

  async create(createDisciplineDto: CreateDisciplineDto): Promise<Discipline> {
    const { code } = createDisciplineDto;

    const codeExists = await this.disciplineModel.findOne({ code }).exec();
    if (codeExists) {
      throw new BadRequestException(
        'Já existe uma disciplina cadastrada com este código.',
      );
    }

    const newDiscipline = new this.disciplineModel(createDisciplineDto);
    return newDiscipline.save();
  }

  async findAll(): Promise<Discipline[]> {
    return this.disciplineModel.find().exec();
  }

  async findOne(id: string): Promise<Discipline> {
    const discipline = await this.disciplineModel.findById(id).exec();
    if (!discipline) {
      throw new NotFoundException('Disciplina não encontrada.');
    }
    return discipline;
  }

  async update(
    id: string,
    updateDisciplineDto: UpdateDisciplineDto,
  ): Promise<Discipline | null> {
    const updatedDiscipline = await this.disciplineModel
      .findByIdAndUpdate(id, { $set: updateDisciplineDto }, { new: true })
      .exec();

    if (!updatedDiscipline) {
      throw new NotFoundException(
        'Disciplina não encontrada para atualização.',
      );
    }

    return updatedDiscipline;
  }

  async remove(id: string): Promise<any> {
    const result = await this.disciplineModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Disciplina não encontrada para remoção.');
    }
    return { message: 'Disciplina removida com sucesso!' };
  }
}

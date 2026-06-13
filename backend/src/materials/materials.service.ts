import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  async create(
    file: Express.Multer.File,
    createMaterialDto: CreateMaterialDto,
  ): Promise<Material> {
    const { disciplineId, type } = createMaterialDto;

    const normalizedType = type.toUpperCase();
    if (!['VIDEO', 'PROVA', 'LISTA'].includes(normalizedType)) {
      throw new BadRequestException('Tipo de material inválido.');
    }

    const newMaterial = new this.materialModel({
      disciplineId,
      type: normalizedType,
      filename: file.filename,
      path: file.path,
      isApproved: false,
    });

    return newMaterial.save();
  }

  async findAll(disciplineId?: string): Promise<Material[]> {
    if (disciplineId) {
      return this.materialModel.find({ disciplineId, isApproved: true }).exec();
    }
    return this.materialModel.find({ isApproved: true }).exec();
  }

  async approve(id: string): Promise<Material> {
    const updatedMaterial = await this.materialModel
      .findByIdAndUpdate(id, { isApproved: true }, { new: true })
      .exec();

    if (!updatedMaterial) {
      throw new Error('Material acadêmico não encontrado.');
    }

    return updatedMaterial;
  }
}

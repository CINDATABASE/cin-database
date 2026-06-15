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
    const {
      title,
      description,
      disciplineId,
      disciplineName,
      professor,
      type,
    } = createMaterialDto;

    const normalizedType = type.toUpperCase();
    if (!['VIDEO', 'PROVA', 'LISTA'].includes(normalizedType)) {
      throw new BadRequestException('Tipo de material inválido.');
    }

    const newMaterial = new this.materialModel({
      title,
      description,
      disciplineId,
      disciplineName,
      professor,
      type: normalizedType,
      filename: file.filename,
      path: file.path,
      isApproved: false,
    });

    return await newMaterial.save();
  }

  async findPending(): Promise<Material[]> {
    return this.materialModel.find({ isApproved: false }).exec();
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

  async findById(id: string): Promise<Material> {
    const material = await this.materialModel.findById(id).exec();

    if (!material) {
      throw new BadRequestException(
        'O arquivo solicitado não foi encontrado no servidor.',
      );
    }

    return material;
  }
}

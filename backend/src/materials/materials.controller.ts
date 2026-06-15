import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Patch,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Material } from './schemas/material.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Response } from 'express';
import * as path from 'path';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype === 'application/pdf' ||
          file.mimetype === 'video/mp4'
        ) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Formato inválido. Apenas PDFs e vídeos MP4.',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMaterialDto: CreateMaterialDto,
  ): Promise<Material> {
    if (!file) throw new BadRequestException('Nenhum arquivo foi enviado.');
    if (file.mimetype === 'application/pdf' && file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Arquivos PDF não podem ultrapassar 10MB.');
    }
    return await this.materialsService.create(file, createMaterialDto);
  }

  @Get()
  async findAll(
    @Query('disciplineId') disciplineId?: string,
  ): Promise<Material[]> {
    return await this.materialsService.findAll(disciplineId);
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async findPending(): Promise<Material[]> {
    return await this.materialsService.findPending();
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async approveMaterial(@Param('id') id: string): Promise<Material> {
    return await this.materialsService.approve(id);
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const material = await this.materialsService.findById(id);

    return res.download(material.path, material.filename);
  }

  @Get('view/:id')
  async viewFile(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const material = await this.materialsService.findById(id);
    const absolutePath = path.resolve(material.path);
    return res.sendFile(absolutePath);
  }
}

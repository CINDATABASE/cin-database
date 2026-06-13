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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else if (file.mimetype === 'video/mp4') {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Formato inválido. Apenas PDFs e vídeos MP4 são permitidos.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMaterialDto: CreateMaterialDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }

    const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.mimetype === 'application/pdf' && file.size > MAX_PDF_SIZE) {
      throw new BadRequestException(
        'Arquivos PDF não podem ultrapassar o limite de 10MB.',
      );
    }

    return this.materialsService.create(file, createMaterialDto);
  }

  @Get()
  async findAll(@Query('disciplineId') disciplineId?: string) {
    return this.materialsService.findAll(disciplineId);
  }

  @Patch(':id/approve')
  async approveMaterial(@Param('id') id: string) {
    return this.materialsService.approve(id);
  }
}

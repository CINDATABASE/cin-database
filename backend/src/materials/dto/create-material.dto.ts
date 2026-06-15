import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty({ message: 'O título do material é obrigatório.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição ou conteúdo do material é obrigatória.' })
  description: string;

  @IsMongoId({
    message: 'O ID da disciplina deve ser um ID válido do MongoDB.',
  })
  @IsNotEmpty({
    message: 'O material precisa estar atrelado a uma disciplina.',
  })
  disciplineId: string;
  @IsString()
  @IsOptional()
  disciplineName?: string;

  @IsString()
  @IsOptional()
  professor?: string;

  @IsString()
  @IsNotEmpty({ message: 'O tipo do material é obrigatório.' })
  @IsIn(['VIDEO', 'PROVA', 'LISTA', 'video', 'prova', 'lista'], {
    message: 'O tipo deve ser VIDEO, PROVA ou LISTA.',
  })
  type: string;
}

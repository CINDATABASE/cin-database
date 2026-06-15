import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsMongoId({ message: 'O ID do material deve ser um ID válido do MongoDB.' })
  @IsOptional()
  materialId?: string;

  @IsMongoId({
    message: 'O ID da disciplina deve ser um ID válido do MongoDB.',
  })
  @IsNotEmpty({ message: 'A avaliação deve estar atrelada a uma disciplina.' })
  disciplineId: string;

  @IsNumber()
  @Min(1, { message: 'A nota mínima de dificuldade é 1.' })
  @Max(5, { message: 'A nota máxima de dificuldade é 5.' })
  @IsNotEmpty({ message: 'A nota de dificuldade é obrigatória.' })
  difficulty: number;

  @IsNumber()
  @Min(1, { message: 'A nota mínima de didática é 1.' })
  @Max(5, { message: 'A nota máxima de didática é 5.' })
  @IsNotEmpty({ message: 'A nota de didática é obrigatória.' })
  didactics: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

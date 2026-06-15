import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsMongoId({ message: 'O ID do material deve ser um ID válido do MongoDB.' })
  @IsNotEmpty({ message: 'A avaliação deve estar atrelada a um material.' })
  materialId: string;

  @IsMongoId({
    message: 'O ID da disciplina deve ser um ID válido do MongoDB.',
  })
  @IsNotEmpty({ message: 'A avaliação deve estar atrelada a uma disciplina.' })
  disciplineId: string;

  @IsNumber()
  @Min(1, { message: 'A nota mínima é 1.' })
  @Max(5, { message: 'A nota máxima permitida é 5.' })
  @IsNotEmpty({ message: 'A nota da avaliação é obrigatória.' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'O comentário da avaliação é obrigatório.' })
  comment: string;
}

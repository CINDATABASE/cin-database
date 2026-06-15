import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateDisciplineDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da disciplina é obrigatório.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'O código da disciplina é obrigatório.' })
  code: string;

  @IsNumber()
  @Min(1, { message: 'O período mínimo é 1.' })
  @Max(10, { message: 'O período máximo é 10.' })
  @IsNotEmpty({ message: 'O período letivo é obrigatório.' })
  period: number;

  @IsString()
  @IsNotEmpty({ message: 'O nome do professor é obrigatório.' })
  professor: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição da disciplina é obrigatória.' })
  description: string;
}

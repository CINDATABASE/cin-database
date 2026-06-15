import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDisciplineDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da disciplina é obrigatório.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'O código da disciplina é obrigatório.' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do professor é obrigatório.' })
  professor: string;
}

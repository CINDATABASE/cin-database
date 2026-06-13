export class CreateReviewDto {
  materialId: string; // Obrigatório saber qual material está sendo avaliado
  disciplineId: string; // Útil para buscas diretas por disciplina
  rating: number; // Nota dada pelo aluno (1 a 5)
  comment: string; // O texto do relato
}

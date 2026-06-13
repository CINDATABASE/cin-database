export interface User {
  id: string;
  email: `${string}@cin.ufpe.br`;
  role: 'ALUNO' | 'ADMIN';
}

export interface AcademicMaterial {
  id: string;
  disciplineId: string;
  type: 'video' | 'prova' | 'lista';
  filename: string;
  path: string;
  uploadDate: string;
  averageRating?: number;
}

export interface Review {
  id: string;
  materialId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

describe('CIn DataBase - MVP Integration Tests (e2e)', () => {
  let app: INestApplication<App>;
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let createdDisciplineId: string;
  let mockMaterialId: string;

  jest.setTimeout(30000);

  const uniqueSuffix = Date.now();
  const mockUser = {
    name: 'Aluno Teste Integrado',
    email: `teste.${uniqueSuffix}@cin.ufpe.br`,
    matricula: `mat-${uniqueSuffix}`,
    password: 'SenhaSegura123',
  };

  const mockDiscipline = {
    name: 'Infraestrutura de Redes',
    code: `IF${uniqueSuffix.toString().slice(-3)}`,
    period: 5,
    professor: 'Professor do CIn',
    description:
      'Cadeira obrigatória sobre redes de computadores e roteamento.',
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MongooseModule)
      .useValue(MongooseModule.forRoot(mongoUri))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mockMaterialId = '6669c1c1c9c1c1c9c1c1c9c1';
  });

  afterAll(async () => {
    // Fecha a conexão com o mongoose para não reter processos abertos no Jest
    try {
      const connection = app.get<Connection>(getConnectionToken());
      await connection.close();
    } catch (err) {
      console.log('Erro ao fechar conexão com o banco:', err);
    }
    await app.close();
    await mongoServer.stop();
  });

  // -------------------------------------------------------------------------
  // 1. TESTES DO MÓDULO DE USUÁRIOS & VALIDAÇÃO INSTITUCIONAL
  // -------------------------------------------------------------------------
  describe('/users (Registration)', () => {
    it('Deve rejeitar o cadastro se o e-mail não terminar com @cin.ufpe.br', async () => {
      const invalidUser = { ...mockUser, email: 'aluno@gmail.com' };

      const response = await request(app.getHttpServer())
        .post('/users/register') // 💡 Corrigido com /register
        .send(invalidUser)
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as Record<string, any>;
      expect(body.message).toContain(
        'Apenas e-mails terminados em @cin.ufpe.br são permitidos.',
      );
    });

    it('Deve cadastrar com sucesso um usuário institucional válido e criptografar a senha', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register') // 💡 Corrigido com /register
        .send(mockUser)
        .expect(HttpStatus.CREATED);

      const body = response.body as Record<string, any>;
      expect(body).toHaveProperty('_id');
      expect(body.email).toBe(mockUser.email.toLowerCase());
      expect(body.passwordHash).not.toBe(mockUser.password);
    });

    it('Deve barrar tentativa de cadastro com e-mail duplicado', async () => {
      await request(app.getHttpServer())
        .post('/users/register') // 💡 Corrigido com /register
        .send(mockUser)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // -------------------------------------------------------------------------
  // 2. TESTES DO MÓDULO DE AUTENTICAÇÃO (AUTH & JWT)
  // -------------------------------------------------------------------------
  describe('/auth (Authentication)', () => {
    it('Deve rejeitar o login com credenciais incorretas', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email, password: 'SenhaErrada' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Deve autenticar o usuário e retornar o token JWT assinado', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockUser.email, password: mockUser.password })
        .expect(HttpStatus.OK);

      interface LoginResponse {
        access_token: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
      }

      const body = response.body as LoginResponse;

      expect(body).toHaveProperty('access_token');
      expect(body.user.email).toBe(mockUser.email);

      authToken = body.access_token;
    });
  });

  // -------------------------------------------------------------------------
  // 3. TESTES DO MÓDULO DE DISCIPLINAS
  // -------------------------------------------------------------------------
  describe('/disciplines (Academic Context)', () => {
    it('Deve criar uma nova disciplina no MongoDB', async () => {
      const response = await request(app.getHttpServer())
        .post('/disciplines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockDiscipline)
        .expect(HttpStatus.CREATED);

      const body = response.body as Record<string, any>;
      expect(body).toHaveProperty('_id');
      expect(body.code).toBe(mockDiscipline.code);
      createdDisciplineId = body._id as string;
    });

    it('Deve listar todas as disciplinas cadastradas', async () => {
      const response = await request(app.getHttpServer())
        .get('/disciplines')
        .expect(HttpStatus.OK);

      const body = response.body as any[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('Deve buscar uma disciplina específica pelo ID do MongoDB', async () => {
      const response = await request(app.getHttpServer())
        .get(`/disciplines/${createdDisciplineId}`)
        .expect(HttpStatus.OK);

      const body = response.body as Record<string, any>;
      expect(body.code).toBe(mockDiscipline.code);
    });
  });

  // -------------------------------------------------------------------------
  // 4. TESTES DO MÓDULO DE AVALIAÇÕES (REVIEWS)
  // -------------------------------------------------------------------------
  describe('/reviews (Feedback)', () => {
    it('Deve rejeitar uma avaliação se a nota for maior que 5 ou menor que 1', async () => {
      const invalidReview = {
        materialId: mockMaterialId,
        disciplineId: createdDisciplineId,
        rating: 10,
        comment: 'Arquivo excelente!',
      };

      await request(app.getHttpServer())
        .post('/reviews')
        .send(invalidReview)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('Deve postar uma avaliação válida atrelada ao ID de um material', async () => {
      const validReview = {
        materialId: mockMaterialId,
        disciplineId: createdDisciplineId,
        rating: 5,
        comment:
          'A prova do período passado ajudou muito a estudar para a EE1!',
      };

      const response = await request(app.getHttpServer())
        .post('/reviews')
        .send(validReview)
        .expect(HttpStatus.CREATED);

      const body = response.body as Record<string, any>;
      expect(body).toHaveProperty('_id');
      expect(body.rating).toBe(5);
      expect(body.materialId).toBe(mockMaterialId);
    });
  });
});

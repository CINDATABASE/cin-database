import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { Material, MaterialSchema } from './schemas/material.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }), // 👈 Força o Passport a iniciar aqui
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService, JwtStrategy], // 👈 Injeta a estratégia direto na raiz do módulo
})
export class MaterialsModule {}

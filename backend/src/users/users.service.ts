import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, matricula, password } = createUserDto;

    if (!password) {
      throw new BadRequestException('A senha é obrigatória para o cadastro.');
    }

    if (!email.toLowerCase().endsWith('@cin.ufpe.br')) {
      throw new BadRequestException(
        'Apenas e-mails terminados em @cin.ufpe.br são permitidos.',
      );
    }

    const emailExists = await this.userModel.findOne({ email }).exec();
    if (emailExists) {
      throw new BadRequestException('Este e-mail já está cadastrado.');
    }

    const matriculaExists = await this.userModel.findOne({ matricula }).exec();
    if (matriculaExists) {
      throw new BadRequestException('Esta matrícula já está cadastrada.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new this.userModel({
      name,
      email,
      matricula,
      passwordHash,
    });

    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async comparePasswords(
    passwordPlain: string,
    storedHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(passwordPlain, storedHash);
  }
}

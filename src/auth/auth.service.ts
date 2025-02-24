import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {

  constructor(private readonly prisma: PrismaService) { }

  async Wath() {
    return await this.prisma.users.findMany()
  }

  Login(data: LoginDto) {
    return data;
  }

  async Register(data: RegisterDto) {
    try {
      const response = await this.prisma.users.create({
        data
      });
      return response
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

}

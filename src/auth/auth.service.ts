import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService

  ) { }

  async Wath() {
    return await this.prisma.users.findMany()
  }

  async Login(data: LoginDto) {

    const user = await this.prisma.users.findUnique({
      where: { email: data.email }
    });

    if (!user) throw new NotFoundException('Email not found');

    const isValid = await compare(data.password, user.password);

    if (!isValid) throw new UnauthorizedException('Incorrect credentials');

    const { password, ...payload } = user;

    const accToken = await this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.sign(payload, { expiresIn: '7d', secret: process.env.JWT_SECRET_REFRESH });
    return { accToken, refreshToken };
  }

  async Register(data: RegisterDto) {

    data.password = await hash(data.password, 10);
    const { password, ...new_user } = await this.prisma.users.create({
      data
    });
    return new_user;

  }

  /**
   * More services...
   */
}

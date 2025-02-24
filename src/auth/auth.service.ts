import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  Login(data: LoginDto) {
    return data;
  }

  Register(data: RegisterDto) {
    return data;
  }

}

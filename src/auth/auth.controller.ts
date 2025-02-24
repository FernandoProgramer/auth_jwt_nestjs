import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/login')
  Login(loginDto: LoginDto) {
    return this.authService.Login(loginDto)
  }
  @Post('/register')
  Register(registerDto: RegisterDto) {
    return this.authService.Register(registerDto)
  }

}

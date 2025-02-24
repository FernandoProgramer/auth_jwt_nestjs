import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('watch')
  Wath() {
    return this.authService.Wath()
  }

  @Post('/login')
  Login(loginDto: LoginDto) {
    return this.authService.Login(loginDto)
  }
  @Post('/register')
  Register(@Body() registerDto: RegisterDto) {
    return this.authService.Register(registerDto)
  }

}

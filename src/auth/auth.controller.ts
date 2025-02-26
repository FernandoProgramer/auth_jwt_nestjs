import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { AccTokenGuard } from './guards/accToken.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('watch')
  @HttpCode(200)
  @UseGuards(AccTokenGuard)
  Wath() {
    return this.authService.Wath()
  }

  @Post('/login')
  @HttpCode(200)
  async Login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const { accToken, refreshToken } = await this.authService.Login(loginDto);
    return response
      .cookie('accToken', accToken, { // Saved in Cookie Access token
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 9 * 60 * 1000 // 9 minuts
      })
      .cookie('refreshToken', refreshToken, { // Saved in Cookie Refresh token
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }).
      json({
        successful: true,
        message: "Successful autentication, cookies saved",
        statusCode: 200
      });
  }
  @Post('/register')
  Register(@Body() registerDto: RegisterDto) {
    return this.authService.Register(registerDto)
  }

  @Get('/cookies')
  GetCookies(@Req() request: Request) {
    const cookies = request.headers.cookie;
    return { cookies };
  }

}

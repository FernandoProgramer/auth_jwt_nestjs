import { Body, Controller, Get, HttpCode, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request, response, Response } from 'express';
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

    const maxAgeAccessToken: number = 9 * 60 * 1000; // 9 minuts
    const maxAgeRefreshToken: number = 6 * 24 * 60 * 60 * 1000; // 6 days

    return response
      .cookie('accToken', accToken, { // Saved in Cookie Access token
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: maxAgeAccessToken
      })
      .cookie('refreshToken', refreshToken, { // Saved in Cookie Refresh token
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: maxAgeRefreshToken
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


  @Post('/logout')
  Logout(@Req() request: Request, @Res() response: Response) {
    const { accToken, refreshToken } = request.cookies;

    if (!accToken && !refreshToken) {
      throw new NotFoundException('Not found tokens');
    }

    return response.clearCookie('refreshToken').clearCookie('accToken').json({
      successful: true,
      message: 'Successfully logout, removed tokens',
      statusCode: 200
    })

  }

}

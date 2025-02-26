import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, response, Response } from 'express'

/**
 * Middleware responsible for handling access token renewal.
 * It verifies the validity of the access token and, if expired, 
 * attempts to generate a new one using the refresh token.
 */
@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {

  /**
    * Injects the JwtService to handle token verification and signing.
    * 
    * @param jwtService - Service for managing JWT operations.
    */
  constructor(private readonly jwtService: JwtService) { }

  /**
    * Middleware function that checks the validity of tokens and refreshes 
    * the access token if needed.
    * 
    * @param req - Incoming request object.
    * @param res - Response object used to set the new token.
    * @param next - Function to proceed to the next middleware.
    */
  async use(req: Request, res: Response, next: NextFunction) {

    // Extract tokens from cookies
    const { refreshToken, accToken } = req.cookies;

    // If no tokens are present, proceed with the request
    if (!refreshToken && !accToken) return next();

    // Validate the access token
    const is_valid_acc_token = await this.jwtService.verify(accToken, { secret: process.env.JWT_SECRET_ACC });

    // If the access token is valid, allow the request to continue
    if (is_valid_acc_token) return next();

    // Validate the refresh token
    const is_valid_refresh_token = await this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET_REFRESH });

    // If the refresh token is invalid, reject the request
    if (!is_valid_refresh_token) throw new UnauthorizedException('Refresh token has expired or is invalid refresh token');

    // Decode the refresh token payload
    const payload = await this.jwtService.decode(refreshToken)

    // Generate a new access token using the refresh token's payload
    const newAccesToken = await this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_ACC
    });

    // Store the new access token in cookies
    res
      .cookie('accToken', newAccesToken, { // Saved in Cookie Access token
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 9 * 60 * 1000 // 9 minuts
      })

    // Continue processing the request
    next();
  }
}

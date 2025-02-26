import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Guard to protect routes by validating the access token.
 * Ensures that requests include a valid access token before granting access.
 */
@Injectable()
export class AccTokenGuard implements CanActivate {

  constructor(private readonly jwtService: JwtService) { }

  /**
    * Checks whether the request has a valid access token.
    *
    * @param context - Execution context providing request details.
    * @returns A boolean indicating whether access is granted.
    * @throws UnauthorizedException if the access token is missing, expired, or invalid.
    */
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {


    const request = context.switchToHttp().getRequest();
    const accToken = this.extractBearerToken(request);

    if (!accToken) throw new UnauthorizedException('Access token is missing');

    try {

      // Validate the access token
      const payload = await this.jwtService.verify(accToken, { secret: process.env.JWT_SECRET_ACC });
      if (!payload) {
        throw new UnauthorizedException('access token has expired');
      }

      // Attach the payload to the request for further processing
      request['user_payload'] = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
  * Extracts the access token from request cookies.
  *
  * @param request - Express request object.
  * @returns The extracted token or null if not found.
  */
  extractBearerToken(request: Request) {
    const token = request.cookies['accToken'];
    return token && typeof token === 'string' ? token : null;
  }

}

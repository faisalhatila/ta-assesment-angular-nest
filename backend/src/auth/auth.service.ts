import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwksClient: ReturnType<typeof jwksClient>;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const issuer = this.configService.getOrThrow<string>('supabase.jwtIssuer');
    this.jwksClient = jwksClient({
      jwksUri: `${issuer}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
  }

  async validateAccessToken(token: string): Promise<AuthUser> {
    const payload = await this.verifyToken(token);
    const subject = payload.sub;
    const email = payload.email;
    if (!subject || typeof email !== 'string') {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      await this.usersService.upsertProfile({ id: subject, email });
      const profile = await this.usersService.findProfileById(subject);
      if (!profile) {
        throw new InternalServerErrorException('User profile was not found');
      }

      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        token,
      };
    } catch (error) {
      this.logger.error(
        'Profile sync failed after successful token verify',
        error,
      );
      throw new InternalServerErrorException(
        'Token verified but user profile sync failed. Check Supabase tables/keys.',
      );
    }
  }

  private async verifyToken(token: string): Promise<jwt.JwtPayload> {
    try {
      return await new Promise<jwt.JwtPayload>((resolve, reject) => {
        jwt.verify(
          token,
          (header: JwtHeader, callback: SigningKeyCallback) => {
            if (!header.kid) {
              callback(new Error('Missing key id'));
              return;
            }
            this.jwksClient.getSigningKey(header.kid, (error, key) => {
              if (error) {
                callback(error);
                return;
              }
              callback(null, key?.getPublicKey());
            });
          },
          {
            issuer: this.configService.getOrThrow<string>('supabase.jwtIssuer'),
            audience: this.configService.getOrThrow<string>(
              'supabase.jwtAudience',
            ),
            algorithms: ['RS256', 'ES256'],
          },
          (error, decoded) => {
            if (error || !decoded || typeof decoded === 'string') {
              reject(error ?? new Error('Token verification failed'));
              return;
            }
            resolve(decoded);
          },
        );
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

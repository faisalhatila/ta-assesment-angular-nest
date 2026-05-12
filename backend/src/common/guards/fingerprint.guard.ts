import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

const FINGERPRINT_HEADER = 'x-device-fingerprint';
const FINGERPRINT_PATTERN = /^[a-f0-9]{32,128}$/i;

@Injectable()
export class FingerprintGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      fingerprint?: string;
    }>();
    const fingerprint = request.headers[FINGERPRINT_HEADER];

    if (!fingerprint || !FINGERPRINT_PATTERN.test(fingerprint)) {
      throw new UnauthorizedException(
        `Missing or invalid ${FINGERPRINT_HEADER} header`,
      );
    }

    request.fingerprint = fingerprint;
    return true;
  }
}

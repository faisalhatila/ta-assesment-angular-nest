import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: any): Promise<string> {
    const fingerprint =
      req.headers?.['x-device-fingerprint'] ?? 'no-fingerprint';
    const ip = req.ip ?? req.ips?.[0] ?? 'unknown-ip';
    return `${ip}:${fingerprint}`;
  }

  protected generateKey(
    context: ExecutionContext,
    tracker: string,
    name: string,
  ): string {
    const route = `${context.getClass().name}:${context.getHandler().name}`;
    return `${name}:${route}:${tracker}`;
  }
}

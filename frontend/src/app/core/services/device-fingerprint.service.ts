import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

const STORAGE_KEY = 'cc_device_fingerprint_v1';
const HEX_PATTERN = /^[a-f0-9]{32,128}$/i;

@Injectable({ providedIn: 'root' })
export class DeviceFingerprintService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Stable hex fingerprint required by Nest `FingerprintGuard` and throttler tracker. */
  getFingerprint(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '0'.repeat(32);
    }
    let value = localStorage.getItem(STORAGE_KEY);
    if (!value || !HEX_PATTERN.test(value)) {
      value = this.generateHex32();
      localStorage.setItem(STORAGE_KEY, value);
    }
    return value;
  }

  private generateHex32(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
}

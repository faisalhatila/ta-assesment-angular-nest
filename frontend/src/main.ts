import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { loadNetlifyRuntimePublicEnv } from './app/core/config/runtime-netlify-env';

async function main(): Promise<void> {
  await loadNetlifyRuntimePublicEnv();
  await bootstrapApplication(AppComponent, appConfig);
}

void main().catch((err) => console.error(err));

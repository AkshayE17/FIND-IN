// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { userReducer } from './state/user/user.reducer';
import { recruiterReducer } from './state/recruiter/recruiter.reducer';
import { adminReducer } from './state/admin/admin.reducer';
import { UserEffects } from './state/user/user.effect';
import { RecruiterEffects } from './state/recruiter/recruiter.effect';
import { AdminEffects } from './state/admin/admin.effect';
import { JobEffects } from './state/job/job.effect';
import { jobReducer } from './state/job/job.reducer';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,withViewTransitions()),
    provideStore(
      { user: userReducer, recruiter: recruiterReducer, admin: adminReducer ,job:jobReducer}
    ),
    provideEffects([UserEffects, RecruiterEffects, AdminEffects,JobEffects]),
    importProvidersFrom(HttpClientModule), provideAnimationsAsync(),
  ],
};

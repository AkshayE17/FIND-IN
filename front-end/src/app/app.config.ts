import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { userReducer } from './state/user/user.reducer';
import { adminReducer } from './state/admin/admin.reducer';
import { recruiterReducer } from './state/recruiter/recruiter.reducer';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { UserEffects } from './state/user/user.effect';
import { RecruiterEffects } from './state/recruiter/recruiter.effect';  
import { AdminEffects } from './state/admin/admin.effect';
import { HttpClientModule } from '@angular/common/http'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({ user: userReducer, recruiter: recruiterReducer,admin:adminReducer}),  // Register recruiter reducer
    provideEffects([UserEffects, RecruiterEffects,AdminEffects]),  // Register recruiter effects
    importProvidersFrom(HttpClientModule) // Use importProvidersFrom for HttpClientModule
  ],
};

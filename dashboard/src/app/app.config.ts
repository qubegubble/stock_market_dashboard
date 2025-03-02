// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// (Optional) If you have a class-based interceptor:
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MyInterceptor } from './interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Provide your router (if you have one)
    provideRouter(routes),

    // (Optional) If you have class-based interceptors, register them with the HTTP_INTERCEPTORS token:
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MyInterceptor,
      multi: true
    },

    // Provide HttpClient with DI-based interceptors
    provideHttpClient(
      withInterceptorsFromDi() // Tells Angular to pull in interceptors from DI
    )
  ]
};

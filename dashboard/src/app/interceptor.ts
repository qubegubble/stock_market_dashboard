// my-interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class MyInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Example: Clone the request to add a custom header
    const modifiedRequest = req.clone({
      setHeaders: {
        'X-Custom-Header': 'MyCustomHeaderValue'
      }
    });

    // Pass the modified request to the next handler in the chain
    return next.handle(modifiedRequest);
  }
}

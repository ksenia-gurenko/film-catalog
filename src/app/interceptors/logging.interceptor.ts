import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  return next(req).pipe(
    tap({
      next: (event) => {
        const elapsedTime = Date.now() - startTime;
        console.log(`[${req.method}] ${req.url} - ${elapsedTime}ms`);
      },
      error: (error) => {
        const elapsedTime = Date.now() - startTime;
        console.error(`[${req.method}] ${req.url} - ${elapsedTime}ms - Error: ${error.status} ${error.message}`);
      }
    })
  );
};

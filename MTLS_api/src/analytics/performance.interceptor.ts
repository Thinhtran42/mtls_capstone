import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemMonitorService } from './system-monitor.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - start;
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // Ghi lại thông tin request
        SystemMonitorService.logRequest(method, url, statusCode, responseTime);
      }),
    );
  }
}

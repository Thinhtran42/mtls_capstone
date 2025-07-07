import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    console.log('Request path:', request.url);
    console.log('Request method:', request.method);
    console.log('Request cookies:', request.cookies);
    
    // Kiểm tra localStorage nếu đây là request từ browser
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('Local Storage token:', localStorage.getItem('token'));
    }
    
    // Log headers để debug
    console.log('Request headers before interceptor:', request.headers);
    
    // Chuyển token từ query params hoặc cookies vào header nếu cần
    // Ví dụ: nếu token được gửi qua query param
    if (request.query.token && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${request.query.token}`;
    }
    
    // Hoặc từ cookies
    if (request.cookies?.token && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${request.cookies.token}`;
    }
    
    console.log('Request headers after interceptor:', request.headers);
    
    return next.handle();
  }
}

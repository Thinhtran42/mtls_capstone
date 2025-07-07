import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // Export service để các module khác có thể sử dụng
})
export class FirebaseModule {}

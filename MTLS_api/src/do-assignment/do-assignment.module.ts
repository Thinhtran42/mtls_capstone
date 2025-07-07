import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoAssignmentService } from './do-assignment.service';
import { DoAssignmentController } from './do-assignment.controller';
import { DoAssignment, DoAssignmentSchema } from './schemas/do-assignment.schema';
import { AssignmentModule } from '../assignment/assignment.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DoAssignment.name, schema: DoAssignmentSchema }]),
    AssignmentModule,
    UserModule,
    AuthModule,
  ],
  controllers: [DoAssignmentController],
  providers: [DoAssignmentService],
  exports: [DoAssignmentService],
})
export class DoAssignmentModule {}
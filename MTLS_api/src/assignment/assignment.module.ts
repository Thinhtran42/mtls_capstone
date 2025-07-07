import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { Assignment, AssignmentSchema } from './schemas/assignment.schema';
import { SectionModule } from '../section/section.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Assignment.name, schema: AssignmentSchema }]),
    SectionModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Course } from './schemas/course.schema';
import { User } from '../user/schema/user.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    // Check if student exists
    const student = await this.userModel.findById(createEnrollmentDto.student);
    if (!student) {
      throw new NotFoundException(`Student with ID ${createEnrollmentDto.student} not found`);
    }

    // Check if course exists
    const course = await this.courseModel.findById(createEnrollmentDto.course);
    if (!course) {
      throw new NotFoundException(`Course with ID ${createEnrollmentDto.course} not found`);
    }

    // Check if enrollment already exists
    const existingEnrollment = await this.enrollmentModel.findOne({
      student: createEnrollmentDto.student,
      course: createEnrollmentDto.course,
    });
    if (existingEnrollment) {
      throw new BadRequestException('Student is already enrolled in this course');
    }

    // Set default values if not provided
    if (!createEnrollmentDto.status) {
      createEnrollmentDto.status = 'active';
    }
    if (!createEnrollmentDto.enrolledAt) {
      createEnrollmentDto.enrolledAt = new Date();
    }

    // Create and save the enrollment
    const enrollment = new this.enrollmentModel(createEnrollmentDto);
    return enrollment.save();
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find()
      .populate('student', 'name email')
      .populate('course', 'title description level')
      .exec();
  }

  async findById(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findById(id)
      .populate('student', 'name email')
      .populate('course', 'title description level')
      .exec();
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const updatedEnrollment = await this.enrollmentModel
      .findByIdAndUpdate(id, updateEnrollmentDto, { new: true })
      .exec();
    if (!updatedEnrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return updatedEnrollment;
  }

  async remove(id: string): Promise<Enrollment> {
    const deletedEnrollment = await this.enrollmentModel.findByIdAndDelete(id).exec();
    if (!deletedEnrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return deletedEnrollment;
  }

  async findByStudentId(student: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ student })
      .populate('course', 'title description level')
      .exec();
  }

  async findByCourseId(course: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ course })
      .populate('student', 'name email')
      .exec();
  }

  async findByStudentAndCourse(student: string, course: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findOne({ student, course })
      .populate('student', 'name email')
      .populate('course', 'title description level')
      .exec();
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    return enrollment;
  }
}

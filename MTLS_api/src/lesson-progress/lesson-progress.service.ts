import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LessonProgress } from './schemas/lesson-progress.schema';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { UsersService } from 'src/user/user.service';
import { LessonService } from 'src/lesson/lesson.service';

@Injectable()
export class LessonProgressService {
  constructor(
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgress>,
    private userService: UsersService,
    private lessonService: LessonService
  ) {}

  async create(createLessonProgressDto: CreateLessonProgressDto, studentId: string): Promise<LessonProgress> {
        // Kiểm tra quiz có tồn tại không
        await this.lessonService.findById(createLessonProgressDto.lesson);
       // Kiểm tra student có tồn tại không
        await this.userService.findById(studentId);
    // Kiểm tra xem đã có bản ghi tiến độ cho học viên và bài học này chưa
    const existingProgress = await this.lessonProgressModel.findOne({
      student: studentId,
      lesson: createLessonProgressDto.lesson,
    });

    if (existingProgress) {
      throw new BadRequestException('Đã tồn tại bản ghi tiến độ cho học viên và bài học này');
    }

    // Tạo bản ghi tiến độ mới
    const lessonProgress = new this.lessonProgressModel({
      ...createLessonProgressDto,
      student: studentId,
      status: true,
    });
    return lessonProgress.save();
  }

  async findAll(): Promise<LessonProgress[]> {
    return this.lessonProgressModel
      .find()
      .populate('student', 'fullName email')
      .populate('lesson', 'title')
      .exec();
  }

  async findById(id: string): Promise<LessonProgress> {
    const lessonProgress = await this.lessonProgressModel
      .findById(id)
      .populate('student', 'fullName email')
      .populate('lesson', 'title')
      .exec();

    if (!lessonProgress) {
      throw new NotFoundException(`Không tìm thấy tiến độ với ID ${id}`);
    }

    return lessonProgress;
  }

  async findByStudentAndLesson(studentId: string, lessonId: string): Promise<LessonProgress> {
    const lessonProgress = await this.lessonProgressModel
      .findOne({ student: studentId, lesson: lessonId })
      .populate('lesson', 'title')
      .exec();

    if (!lessonProgress) {
      return null; // Trả về null thay vì throw exception để client có thể xử lý
    }

    return lessonProgress;
  }

  async findByStudent(studentId: string): Promise<LessonProgress[]> {
    return this.lessonProgressModel
      .find({ student: studentId })
      .populate('lesson', 'title')
      .exec();
  }

  async update(id: string, updateLessonProgressDto: UpdateLessonProgressDto): Promise<LessonProgress> {
    const updatedLessonProgress = await this.lessonProgressModel
      .findByIdAndUpdate(id, updateLessonProgressDto, { new: true })
      .populate('student', 'fullName email')
      .populate('lesson', 'title')
      .exec();

    if (!updatedLessonProgress) {
      throw new NotFoundException(`Không tìm thấy tiến độ với ID ${id}`);
    }

    return updatedLessonProgress;
  }

  async updateByStudentAndLesson(
    studentId: string,
    lessonId: string,
    updateLessonProgressDto: UpdateLessonProgressDto,
  ): Promise<LessonProgress> {
    const updatedLessonProgress = await this.lessonProgressModel
      .findOneAndUpdate(
        { student: studentId, lesson: lessonId },
        updateLessonProgressDto,
        { new: true }
      )
      .populate('lesson', 'title')
      .exec();

    return updatedLessonProgress;
  }

  async remove(id: string): Promise<LessonProgress> {
    const deletedLessonProgress = await this.lessonProgressModel.findByIdAndDelete(id).exec();

    if (!deletedLessonProgress) {
      throw new NotFoundException(`Không tìm thấy tiến độ với ID ${id}`);
    }

    return deletedLessonProgress;
  }
}
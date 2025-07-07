import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { CourseService } from '../course/course.service';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    private courseService: CourseService
  ) {}

  async create(createRatingDto: CreateRatingDto, studentId: string): Promise<Rating> {
    // Kiểm tra khóa học có tồn tại không
    await this.courseService.findById(createRatingDto.course);

    try {
      // Tạo đánh giá mới
      const rating = new this.ratingModel({
        ...createRatingDto,
        student: studentId
      });

      return await rating.save();
    } catch (error) {
      // Xử lý lỗi trùng lặp (học viên đã đánh giá khóa học này)
      if (error.code === 11000) {
        throw new ConflictException('Bạn đã đánh giá khóa học này rồi. Vui lòng cập nhật đánh giá thay vì tạo mới.');
      }
      throw new BadRequestException(`Không thể tạo đánh giá: ${error.message}`);
    }
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingModel.find()
      .populate('student', 'fullname email')
      .populate('course', 'title')
      .exec();
  }

  async findById(id: string): Promise<Rating> {
    const rating = await this.ratingModel.findById(id)
      .populate('student', 'fullname email')
      .populate('course', 'title')
      .exec();

    if (!rating) {
      throw new NotFoundException(`Không tìm thấy đánh giá với ID ${id}`);
    }

    return rating;
  }

  async update(id: string, updateRatingDto: UpdateRatingDto, studentId: string): Promise<Rating> {
    // Kiểm tra đánh giá có tồn tại không và thuộc về học viên này không
    const rating = await this.ratingModel.findOne({ _id: id, student: studentId });

    if (!rating) {
      throw new NotFoundException(`Không tìm thấy đánh giá hoặc bạn không có quyền cập nhật đánh giá này`);
    }

    // Cập nhật đánh giá
    Object.assign(rating, updateRatingDto);
    return rating.save();
  }

  async remove(id: string, studentId: string): Promise<Rating> {
    // Kiểm tra đánh giá có tồn tại không và thuộc về học viên này không
    const rating = await this.ratingModel.findOneAndDelete({ _id: id, student: studentId });

    if (!rating) {
      throw new NotFoundException(`Không tìm thấy đánh giá hoặc bạn không có quyền xóa đánh giá này`);
    }

    return rating;
  }

  async getCourseRatingStats(courseId: string): Promise<any> {
    // Kiểm tra khóa học có tồn tại không
    await this.courseService.findById(courseId);

    // Lấy tất cả đánh giá của khóa học
    const ratings = await this.ratingModel.find({ course: courseId }).exec();

    // Tính toán thống kê
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / totalRatings
      : 0;

    // Đếm số lượng mỗi loại sao
    const starCounts = {
      1: ratings.filter(r => r.stars === 1).length,
      2: ratings.filter(r => r.stars === 2).length,
      3: ratings.filter(r => r.stars === 3).length,
      4: ratings.filter(r => r.stars === 4).length,
      5: ratings.filter(r => r.stars === 5).length
    };

    return {
      courseId,
      totalRatings,
      averageRating,
      starCounts
    };
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<Rating> {
    // Kiểm tra tính hợp lệ của ID
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học sinh không hợp lệ: ${studentId}`);
    }

    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID khóa học không hợp lệ: ${courseId}`);
    }

    const rating = await this.ratingModel
      .findOne({
        student: studentId,
        course: courseId
      })
      .populate('student', 'fullname email avatar')
      .populate('course', 'title description')
      .exec();

    if (!rating) {
      throw new NotFoundException('Không tìm thấy đánh giá của học viên cho khóa học này');
    }

    return rating;
  }

  async findByStudent(studentId: string): Promise<{ ratings: Rating[]; count: number }> {
    // Kiểm tra tính hợp lệ của ID
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học sinh không hợp lệ: ${studentId}`);
    }

    const ratings = await this.ratingModel
      .find({ student: studentId })
      .populate('student', 'fullname email avatar')
      .populate('course', 'title description')
      .sort({ createdAt: -1 })
      .exec();

    return {
      ratings,
      count: ratings.length
    };
  }

  async findByCourse(courseId: string): Promise<{ ratings: Rating[]; count: number }> {
    // Kiểm tra tính hợp lệ của ID
    if (!courseId || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID khóa học không hợp lệ: ${courseId}`);
    }

    const ratings = await this.ratingModel
      .find({ course: courseId })
      .populate('student', 'fullname email avatar')
      .populate('course', 'title description')
      .sort({ createdAt: -1 })
      .exec();

    return {
      ratings,
      count: ratings.length
    };
  }
}
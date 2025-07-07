import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DoAssignment,
  DoAssignmentDocument,
} from './schemas/do-assignment.schema';
import { CreateDoAssignmentDto } from './dto/create-do-assignment.dto';
import { UpdateDoAssignmentDto } from './dto/update-do-assignment.dto';
import { AssignmentService } from '../assignment/assignment.service';
import { UsersService } from '../user/user.service';
import { UpdateStudentSubmissionDto } from './dto/update-student-submission.dto';

@Injectable()
export class DoAssignmentService {
  constructor(
    @InjectModel(DoAssignment.name)
    private doAssignmentModel: Model<DoAssignmentDocument>,
    private assignmentService: AssignmentService,
    private userService: UsersService,
  ) {}

  async create(
    createDoAssignmentDto: CreateDoAssignmentDto,
    studentId: string,
  ): Promise<DoAssignment> {
    // Kiểm tra assignment có tồn tại không
    await this.assignmentService.findOne(createDoAssignmentDto.assignment);
    // Kiểm tra student có tồn tại không
    await this.userService.findById(studentId);
    // Kiểm tra xem học viên đã làm assignment này chưa
    const existingSubmission = await this.doAssignmentModel.findOne({
      assignment: createDoAssignmentDto.assignment,
      student: studentId,
    });
    if (existingSubmission) {
      throw new BadRequestException('Học viên đã nộp bài cho assignment này');
    }
    const status = createDoAssignmentDto.score >= 5;
    const doAssignment = new this.doAssignmentModel({
      ...createDoAssignmentDto,
      student: studentId,
      status: status,
      submittedAt: new Date(),
    });
    return doAssignment.save();
  }

  async findAll(): Promise<DoAssignment[]> {
    return this.doAssignmentModel
      .find()
      .populate({
        path: 'assignment',
        populate: {
          path: 'section',
          populate: {
            path: 'module',
            select: 'title description',
            populate: {
              path: 'course',
              select: 'title description image',
            },
          },
        },
      })
      .populate('student', 'fullname email')
      .populate('teacher', 'fullname email')
      .exec();
  }

  async findByStudentAndAssignment(
    studentId: string,
    assignmentId: string,
  ): Promise<DoAssignment | null> {
    // Kiểm tra tính hợp lệ của ID
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học viên không hợp lệ: ${studentId}`);
    }

    if (!assignmentId || !assignmentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID bài tập không hợp lệ: ${assignmentId}`);
    }

    try {
      // Tìm bài làm mới nhất
      return await this.doAssignmentModel
        .findOne({ student: studentId, assignment: assignmentId })
        .populate('assignment', 'title description deadline')
        .sort({ updatedAt: -1 })
        .exec();
    } catch (error) {
      console.error(`Error finding assignment submission: ${error.message}`);
      return null;
    }
  }

  async findOne(id: string): Promise<DoAssignment> {
    const doAssignment = await this.doAssignmentModel
      .findById(id)
      .populate('assignment', 'title')
      .populate('student', 'fullname email')
      .populate('teacher', 'fullname email')
      .exec();

    if (!doAssignment) {
      throw new NotFoundException(`DoAssignment with ID ${id} not found`);
    }

    return doAssignment;
  }

  // Thêm phương thức để lấy chi tiết bài nộp với thông tin đầy đủ
  async findOneDetailed(id: string): Promise<DoAssignment> {
    const doAssignment = await this.doAssignmentModel
      .findById(id)
      .populate({
        path: 'assignment',
        populate: { path: 'section', select: 'title' },
      })
      .populate('student', 'fullname email')
      .populate('teacher', 'fullname email')
      .exec();

    if (!doAssignment) {
      throw new NotFoundException(`DoAssignment with ID ${id} not found`);
    }

    return doAssignment;
  }

  async findByAssignment(assignmentId: string): Promise<DoAssignment[]> {
    // Kiểm tra assignment có tồn tại không
    await this.assignmentService.findOne(assignmentId);

    return this.doAssignmentModel
      .find({ assignment: assignmentId })
      .populate('assignment', 'title')
      .populate('student', 'fullname email')
      .populate('teacher', 'fullname email')
      .exec();
  }

  async findByStudent(studentId: string): Promise<DoAssignment[]> {
    // Kiểm tra student có tồn tại không
    await this.userService.findById(studentId);

    return this.doAssignmentModel
      .find({ student: studentId })
      .populate('assignment', 'title')
      .populate('student', 'fullName email')
      .populate('teacher', 'fullName email')
      .exec();
  }

  async findByTeacher(teacherId: string): Promise<DoAssignment[]> {
    // Kiểm tra teacher có tồn tại không
    await this.userService.findById(teacherId);

    return this.doAssignmentModel
      .find({ teacher: teacherId })
      .populate('assignment', 'title')
      .populate('student', 'fullname email')
      .populate('teacher', 'fullname email')
      .exec();
  }

  // Thêm phương thức để lấy bài nộp chưa chấm điểm
  async findUngraded(): Promise<DoAssignment[]> {
    return this.doAssignmentModel
      .find({ isGraded: false })
      .populate('assignment', 'title')
      .populate('student', 'fullname email')
      .exec();
  }

  async update(
    id: string,
    updateDoAssignmentDto: UpdateDoAssignmentDto,
  ): Promise<DoAssignment> {
    const doAssignment = await this.findOne(id);

    // Nếu có teacher mới, kiểm tra teacher có tồn tại không
    if (updateDoAssignmentDto.teacher) {
      await this.userService.findById(updateDoAssignmentDto.teacher);
    }

    // Nếu có score và comment, đánh dấu là đã chấm điểm
    if (
      updateDoAssignmentDto.score !== undefined ||
      updateDoAssignmentDto.comment
    ) {
      updateDoAssignmentDto.isGraded = true;

    };
    if (updateDoAssignmentDto.score >=5){
      updateDoAssignmentDto.status = true;
    }

    const updatedDoAssignment = await this.doAssignmentModel
      .findByIdAndUpdate(id, updateDoAssignmentDto, { new: true })
      .populate('assignment', 'title')
      .populate('student', 'fullname email')
      .populate('teacher', 'fullname email')
      .exec();

    return updatedDoAssignment;
  }

  async remove(id: string): Promise<void> {
    const result = await this.doAssignmentModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`DoAssignment with ID ${id} not found`);
    }
  }

  // Lấy chi tiết đầy đủ về bài nộp, bao gồm thông tin học sinh, giáo viên, assignment và section
  async getSubmissionDetails(id: string): Promise<any> {
    const submission = await this.doAssignmentModel
      .findById(id)
      .populate({
        path: 'assignment',
        populate: { path: 'section', select: 'title type' },
      })
      .populate('student', 'fullname email avatar')
      .populate('teacher', 'fullname email avatar')
      .exec();

    if (!submission) {
      throw new NotFoundException(`DoAssignment with ID ${id} not found`);
    }

    return submission;
  }

  // Lấy tất cả bài nộp đã được chấm điểm
  async getGradedSubmissions(): Promise<DoAssignment[]> {
    return this.doAssignmentModel
      .find({ isGraded: true })
      .populate('assignment', 'title')
      .populate('student', 'fullname email')
      .populate('teacher', 'fullname email')
      .exec();
  }

  // Lấy thống kê điểm số cho một assignment
  async getAssignmentStatistics(assignmentId: string): Promise<any> {
    // Kiểm tra assignment có tồn tại không
    await this.assignmentService.findOne(assignmentId);

    const submissions = await this.doAssignmentModel
      .find({ assignment: assignmentId })
      .exec();

    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter((sub) => sub.isGraded).length;
    const ungradedSubmissions = totalSubmissions - gradedSubmissions;

    // Tính điểm trung bình (chỉ tính các bài đã chấm)
    const gradedScores = submissions
      .filter((sub) => sub.isGraded && sub.score !== null)
      .map((sub) => sub.score);
    const averageScore =
      gradedScores.length > 0
        ? gradedScores.reduce((sum, score) => sum + score, 0) /
          gradedScores.length
        : 0;

    return {
      totalSubmissions,
      gradedSubmissions,
      ungradedSubmissions,
      averageScore,
      highestScore: gradedScores.length > 0 ? Math.max(...gradedScores) : 0,
      lowestScore: gradedScores.length > 0 ? Math.min(...gradedScores) : 0,
    };
  }

  // Lấy danh sách học sinh đã làm assignment và trạng thái chấm điểm
  async getStudentSubmissionsByAssignment(
    assignmentId: string,
  ): Promise<any[]> {
    // Kiểm tra assignment có tồn tại không
    const assignment = await this.assignmentService.findOne(assignmentId);

    const submissions = await this.doAssignmentModel
      .find({ assignment: assignmentId })
      .populate('student', 'fullname email avatar')
      .populate('teacher', 'fullname email')
      .exec();

    return submissions.map((submission) => ({
      submissionId: submission._id,
      student: submission.student,
      submittedAt: submission.submittedAt,
      isGraded: submission.isGraded,
      score: submission.score,
      teacher: submission.teacher,
      comment: submission.comment,
      status: submission.status,
      submissionUrl: submission.submissionUrl,
    }));
  }

  // Lấy danh sách assignment mà học sinh đã làm và trạng thái chấm điểm
  async getAssignmentSubmissionsByStudent(studentId: string): Promise<any[]> {
    // Kiểm tra student có tồn tại không
    await this.userService.findById(studentId);

    const submissions = await this.doAssignmentModel
      .find({ student: studentId })
      .populate('assignment', 'title questionText fileUrl duration')
      .populate('teacher', 'fullname email')
      .exec();

    return submissions.map((submission) => ({
      submissionId: submission._id,
      assignment: submission.assignment,
      submittedAt: submission.submittedAt,
      isGraded: submission.isGraded,
      score: submission.score,
      teacher: submission.teacher,
      comment: submission.comment,
      status: submission.status,
      submissionUrl: submission.submissionUrl,
    }));
  }

  // Lấy danh sách bài đã chấm của giáo viên
  async getGradedSubmissionsByTeacher(teacherId: string): Promise<any[]> {
    // Kiểm tra teacher có tồn tại không
    await this.userService.findById(teacherId);

    const submissions = await this.doAssignmentModel
      .find({
        teacher: teacherId,
        isGraded: true,
      })
      .populate('assignment', 'title')
      .populate('student', 'fullname email')
      .exec();

    return submissions.map((submission) => {
      const submissionObj = submission.toObject();
      return {
        submissionId: submissionObj._id,
        assignment: submissionObj.assignment,
        student: submissionObj.student,
        submittedAt: submissionObj.submittedAt,
        score: submissionObj.score,
        comment: submissionObj.comment,
        status: submission.status,
        gradedAt: submissionObj.updatedAt || new Date(),
      };
    });
  }

  // Thêm phương thức mới vào DoAssignmentService
  async updateStudentSubmission(
    id: string,
    updateStudentSubmissionDto: UpdateStudentSubmissionDto,
    studentId: string,
  ): Promise<DoAssignment> {
    // Kiểm tra bài làm có tồn tại không
    const doAssignment = await this.doAssignmentModel.findById(id).exec();
    if (!doAssignment) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID ${id}`);
    }

    // Kiểm tra xem học viên có phải là người nộp bài không
    if (doAssignment.student.toString() !== studentId) {
      throw new UnauthorizedException('Bạn không có quyền cập nhật bài nộp này');
    }

    // Nếu bài đã được chấm điểm, đánh dấu là chưa chấm để giáo viên chấm lại
    const updateData = { ...updateStudentSubmissionDto };

    // Đánh dấu bài làm là đã hoàn thành
    updateData.status = true;

    if (doAssignment.isGraded) {
      // Đánh dấu bài làm là chưa chấm điểm
      updateData.isGraded = false;

      // Reset điểm và comment
      updateData.score = undefined;
      updateData.comment = null;
    }

    // Cập nhật bài làm
    const updatedDoAssignment = await this.doAssignmentModel
      .findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
      )
      .exec();

    return updatedDoAssignment;
  }

  // Add this method to DoAssignmentService
  async getStudentAssignmentStatus(studentId: string, assignmentId: string): Promise<{ started: boolean, completed: boolean }> {
    const submission = await this.findByStudentAndAssignment(studentId, assignmentId);

    if (!submission) {
      return { started: false, completed: false };
    }

    return {
      started: true,
      completed: submission.status
    };
  }
}

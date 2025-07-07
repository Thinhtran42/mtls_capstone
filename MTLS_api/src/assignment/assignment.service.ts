import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument, AssignmentWithSubmissions } from './schemas/assignment.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SectionService } from '../section/section.service';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name) 
    private assignmentModel: Model<AssignmentDocument>,
    private sectionService: SectionService,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    // Kiểm tra section có tồn tại không
    await this.sectionService.findById(createAssignmentDto.section);

    const createdAssignment = new this.assignmentModel(createAssignmentDto);
    return createdAssignment.save();
  }

  async findAll(): Promise<{ assignments: Assignment[], count: number }> {
    const assignments = await this.assignmentModel.find().exec();
    
    return {
      assignments,
      count: assignments.length
    };
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentModel.findById(id)
      .populate('section', 'title')
      .exec();

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async findBySection(sectionId: string): Promise<Assignment[]> {
    // Kiểm tra section có tồn tại không
    await this.sectionService.findById(sectionId);

    return this.assignmentModel.find({ section: sectionId })
      .populate('section', 'title')
      .exec();
  }

  // Thêm phương thức để lấy assignment với danh sách bài nộp
  async findOneWithSubmissions(id: string): Promise<AssignmentWithSubmissions> {
    const assignment = await this.assignmentModel.findById(id)
      .populate('section', 'title')
      .populate({
        path: 'submissions',
        populate: [
          { path: 'student', select: 'fullName email' },
          { path: 'teacher', select: 'fullName email' }
        ]
      })
      .exec();

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment as unknown as AssignmentWithSubmissions;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    // Kiểm tra assignment có tồn tại không
    await this.findOne(id);

    // Nếu có section mới, kiểm tra section có tồn tại không
    if (updateAssignmentDto.section) {
      await this.sectionService.findById(updateAssignmentDto.section);
    }

    const updatedAssignment = await this.assignmentModel
      .findByIdAndUpdate(id, updateAssignmentDto, { new: true })
      .populate('section', 'title')
      .exec();

    return updatedAssignment;
  }

  async remove(id: string): Promise<void> {
    const result = await this.assignmentModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
  }

  // Lấy danh sách học sinh đã làm assignment
  async getStudentsWhoSubmitted(id: string): Promise<any[]> {
    const assignment = await this.findOneWithSubmissions(id);

    if (!assignment.submissions || assignment.submissions.length === 0) {
      return [];
    }

    return assignment.submissions.map(submission => ({
      submissionId: submission._id,
      student: submission.student,
      submittedAt: submission.submittedAt,
      isGraded: submission.isGraded,
      score: submission.score,
      teacher: submission.teacher
    }));
  }

  // Lấy thống kê về assignment
  async getAssignmentStats(id: string): Promise<any> {
    const assignment = await this.findOneWithSubmissions(id);

    const totalSubmissions = assignment.submissions ? assignment.submissions.length : 0;
    const gradedSubmissions = assignment.submissions ?
      assignment.submissions.filter(sub => sub.isGraded).length : 0;

    return {
      assignmentId: assignment._id,
      title: assignment.title,
      section: assignment.section,
      totalSubmissions,
      gradedSubmissions,
      pendingGrading: totalSubmissions - gradedSubmissions
    };
  }
}

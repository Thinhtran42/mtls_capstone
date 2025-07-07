/* eslint-disable prettier/prettier */
import { Lesson } from './../lesson/schemas/lesson.schema';
import { LessonProgress } from './../lesson-progress/schemas/lesson-progress.schema';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import * as mongoose from 'mongoose';
import { Module, ModuleDocument } from './schemas/module.schema';
import { Section, SectionDocument } from '../section/schemas/section.schema';
import { Quiz } from '../quiz/schemas/quiz.schema';
import {
  Assignment,
  AssignmentDocument,
} from '../assignment/schemas/assignment.schema';
import { Exercise } from '../exercise/schemas/exercise.schema';
import { DoQuiz } from '../do-quiz/schemas/do-quiz.schema';
import {
  DoAssignment,
  DoAssignmentDocument,
} from '../do-assignment/schemas/do-assignment.schema';
import { DoExercise } from '../do-exercise/schemas/do-exercise.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Exercise.name) private exerciseModel: Model<Exercise>,
    @InjectModel(DoQuiz.name) private doQuizModel: Model<DoQuiz>,
    @InjectModel(DoAssignment.name)
    private doAssignmentModel: Model<DoAssignmentDocument>,
    @InjectModel(DoExercise.name) private doExerciseModel: Model<DoExercise>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgress>,
  ) { }

  async createCourse(
    createCourseDto: CreateCourseDto,
    teacherId: string,
  ): Promise<Course> {
    console.log('Creating course with teacherId:', teacherId);
    console.log('CreateCourseDto:', JSON.stringify(createCourseDto));

    try {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        throw new BadRequestException(`Invalid teacher ID: ${teacherId}`);
      }

      const course = new this.courseModel({
        ...createCourseDto,
        teacher: teacherId,
      });

      return await course.save();
    } catch (error) {
      console.error('Error saving course:', error);
      throw new BadRequestException(`Error creating course: ${error.message}`);
    }
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      const course = new this.courseModel(createCourseDto);
      return await course.save();
    } catch (error) {
      throw new BadRequestException(`Error creating course: ${error.message}`);
    }
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel
      .find()
      .populate('teacher', 'name email')
      .populate('module')
      .exec();
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return updatedCourse;
  }

  async remove(id: string): Promise<Course> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return deletedCourse;
  }

  async findByTeacherId(teacher: string): Promise<Course[]> {
    return this.courseModel.find({ teacher }).exec();
  }

  async getCourseDetailWithProgress(
    courseId: string,
    studentId?: string,
  ): Promise<any> {
    // Kiểm tra course có tồn tại không
    const course = await this.courseModel.findById(courseId).lean().exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Lấy tất cả module của course
    const modules = await this.moduleModel
      .find({ course: courseId })
      .sort({ order: 1 })
      .lean()
      .exec();

    // Lấy tất cả section của các module
    const moduleIds = modules.map((module) => module._id);
    const sections = await this.sectionModel
      .find({ module: { $in: moduleIds } })
      .sort({ order: 1 })
      .lean()
      .exec();

    // Lấy tất cả quiz, assignment, exercise từ các section
    const sectionIds = sections.map((section) => section._id);

    // Lấy quizzes
    const quizzes = await this.quizModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Lấy assignments
    const assignments = await this.assignmentModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Lấy exercises
    const exercises = await this.exerciseModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Lấy lessons
    const lessons = await this.lessonModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Lấy tiến độ của học viên
    // Quiz progress
    const quizProgress = await this.doQuizModel
      .find({
        quiz: { $in: quizzes.map((q) => q._id) },
        ...(studentId && { student: studentId }),
      })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();

    // Assignment progress
    const assignmentProgress = await this.doAssignmentModel
      .find({
        assignment: { $in: assignments.map((a) => a._id) },
        ...(studentId && { student: studentId }),
      })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();

    // Exercise progress
    const exerciseProgress = await this.doExerciseModel
      .find({
        exercise: { $in: exercises.map((e) => e._id) },
        ...(studentId && { student: studentId }),
      })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();

    // Lấy tiến độ của học viên cho lessons
    const lessonProgress = await this.lessonProgressModel
      .find({
        lesson: { $in: lessons.map((l) => l._id) },
        ...(studentId && { student: studentId }),
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    // Tính toán tiến độ tổng thể
    const totalActivities =
      quizzes.length + assignments.length + exercises.length + lessons.length;

    // Count only completed activities based on status
    const completedQuizzes = quizProgress.filter(
      (q) => q.status === true,
    ).length;
    const completedAssignments = assignmentProgress.filter(
      (a) => a.status === true,
    ).length;
    const completedExercises = exerciseProgress.filter(
      (e) => e.status === true,
    ).length;
    const completedLessons = lessonProgress.length; // Lessons are considered completed if they have progress

    const completedActivities =
      completedQuizzes +
      completedAssignments +
      completedExercises +
      completedLessons;

    const progressPercentage =
      totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 100)
        : 0;

    // Tổ chức dữ liệu theo cấu trúc phân cấp
    const moduleWithSections = modules.map((module) => {
      const moduleSections = sections.filter(
        (section) => section.module.toString() === module._id.toString(),
      );

      const sectionsWithActivities = moduleSections.map((section) => {
        // Lấy các hoạt động theo loại section
        let activities = [];

        if (section.type === 'Quiz') {
          activities = quizzes.filter(
            (quiz) => quiz.section.toString() === section._id.toString(),
          );

          // Thêm thông tin tiến độ vào mỗi quiz
          activities = activities.map((quiz) => {
            const quizAttempt = quizProgress.find(
              (p) => p.quiz.toString() === quiz._id.toString(),
            );

            return {
              ...quiz,
              status: quizAttempt
                ? quizAttempt.status
                  ? 'completed'
                  : 'pending'
                : 'pending',
              submittedAt: quizAttempt?.submittedAt || null,
              score: quizAttempt?.score || null,
            };
          });
        } else if (section.type === 'Assignment') {
          activities = assignments.filter(
            (assignment) =>
              assignment.section.toString() === section._id.toString(),
          );

          // Thêm thông tin tiến độ vào mỗi assignment
          activities = activities.map((assignment) => {
            const assignmentSubmission = assignmentProgress.find(
              (p) => p.assignment.toString() === assignment._id.toString(),
            );

            return {
              ...assignment,
              status: assignmentSubmission
                ? assignmentSubmission.status
                  ? 'completed'
                  : assignmentSubmission.isGraded
                    ? 'graded'
                    : 'submitted'
                : 'pending',
              submittedAt: assignmentSubmission?.submittedAt || null,
              score: assignmentSubmission?.score || null,
              isGraded: assignmentSubmission?.isGraded || false,
            };
          });
        } else if (section.type === 'Exercise') {
          activities = exercises.filter(
            (exercise) =>
              exercise.section.toString() === section._id.toString(),
          );

          // Thêm thông tin tiến độ vào mỗi exercise
          activities = activities.map((exercise) => {
            const exerciseAttempt = exerciseProgress.find(
              (p) => p.exercise.toString() === exercise._id.toString(),
            );

            return {
              ...exercise,
              status: exerciseAttempt
                ? exerciseAttempt.status
                  ? 'completed'
                  : 'pending'
                : 'pending',
              submittedAt: exerciseAttempt?.submittedAt || null,
              score: exerciseAttempt?.score || null,
            };
          });
        } else if (section.type === 'Lesson') {
          activities = lessons.filter(
            (lesson) => lesson.section.toString() === section._id.toString(),
          );

          // Thêm thông tin tiến độ vào mỗi lesson
          activities = activities.map((lesson) => {
            const lessonAttempt = lessonProgress.find(
              (p) => p.lesson.toString() === lesson._id.toString(),
            );

            return {
              ...lesson,
              status: lessonAttempt ? 'completed' : 'pending',
            };
          });
        }

        return {
          ...section,
          components: activities,
        };
      });

      return {
        ...module,
        sections: sectionsWithActivities,
      };
    });

    return {
      ...course,
      progress: {
        percentage: progressPercentage,
        completed: completedActivities,
        total: totalActivities,
      },
      modules: moduleWithSections,
    };
  }

  async getCourseWithStructure(courseId: string): Promise<any> {
    // Kiểm tra course có tồn tại không
    const course = await this.courseModel.findById(courseId).lean().exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Lấy tất cả module của course
    const modules = await this.moduleModel
      .find({ course: courseId })
      .sort({ order: 1 })
      .lean()
      .exec();

    // Lấy tất cả section của các module
    const moduleIds = modules.map((module) => module._id);
    const sections = await this.sectionModel
      .find({ module: { $in: moduleIds } })
      .sort({ order: 1 })
      .lean()
      .exec();

    // Lấy tất cả quiz, assignment, exercise từ các section
    const sectionIds = sections.map((section) => section._id);

    // Lấy quizzes
    const quizzes = await this.quizModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Lấy assignments
    const assignments = await this.assignmentModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Lấy exercises
    const exercises = await this.exerciseModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Lấy lessons
    const lessons = await this.lessonModel
      .find({ section: { $in: sectionIds } })
      .lean()
      .exec();

    // Tổ chức dữ liệu theo cấu trúc phân cấp
    const moduleWithSections = modules.map((module) => {
      const moduleSections = sections.filter(
        (section) => section.module.toString() === module._id.toString(),
      );

      const sectionsWithActivities = moduleSections.map((section) => {
        // Lấy các hoạt động theo loại section
        let activities = [];

        if (section.type === 'Quiz') {
          activities = quizzes.filter(
            (quiz) => quiz.section.toString() === section._id.toString(),
          );
        } else if (section.type === 'Assignment') {
          activities = assignments.filter(
            (assignment) =>
              assignment.section.toString() === section._id.toString(),
          );
        } else if (section.type === 'Exercise') {
          activities = exercises.filter(
            (exercise) =>
              exercise.section.toString() === section._id.toString(),
          );
        } else if (section.type === 'Lesson') {
          activities = lessons.filter(
            (lesson) => lesson.section.toString() === section._id.toString(),
          );
        }

        return {
          ...section,
          components: activities,
        };
      });

      return {
        ...module,
        sections: sectionsWithActivities,
      };
    });

    return {
      ...course,
      modules: moduleWithSections,
    };
  }
}

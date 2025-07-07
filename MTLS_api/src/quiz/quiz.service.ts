import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from './schemas/quiz.schema';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import { SectionService } from '../section/section.service';
import { Question } from '../question/schemas/question.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private quizModel: Model<Quiz>,
    @InjectModel(Question.name)
    private questionModel: Model<Question>,
    private sectionService: SectionService,
  ) { }

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    // kiểm tra section có tồn tại không
    await this.sectionService.findById(createQuizDto.section);
    const quiz = new this.quizModel(createQuizDto);
    return quiz.save();
  }

  async findAll(): Promise<{ quizzes: Quiz[]; count: number }> {
    const quizzes = await this.quizModel.find().exec();

    return {
      quizzes,
      count: quizzes.length,
    };
  }

  async findById(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return quiz;
  }

  async findBySectionId(id: string): Promise<Quiz[]> {
    return this.quizModel.find({ section: id }).exec();
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const updatedQuiz = await this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true })
      .exec();
    if (!updatedQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return updatedQuiz;
  }

  async remove(id: string): Promise<Quiz> {
    const deletedQuiz = await this.quizModel.findByIdAndDelete(id).exec();
    if (!deletedQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return deletedQuiz;
  }

  async findAllWithQuestionsCount(): Promise<{
    quizzes: any[];
    count: number;
  }> {
    const quizzes = await this.quizModel.find().exec();

    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const quizObj = quiz.toObject();
        // Đếm số câu hỏi từ bảng Question
        const questionsCount = await this.questionModel
          .countDocuments({ quiz: quiz._id })
          .exec();
        return {
          ...quizObj,
          questionsCount,
        };
      }),
    );

    return {
      quizzes: quizzesWithCount,
      count: quizzes.length,
    };
  }

  async findBySectionIdWithQuestionsCount(id: string): Promise<any[]> {
    const quizzes = await this.quizModel.find({ section: id }).exec();

    return Promise.all(
      quizzes.map(async (quiz) => {
        const quizObj = quiz.toObject();
        // Đếm số câu hỏi từ bảng Question
        const questionsCount = await this.questionModel
          .countDocuments({ quiz: quiz._id })
          .exec();
        return {
          ...quizObj,
          questionsCount,
        };
      }),
    );
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './schemas/question.schema';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import { CreateMultipleQuestionsDto } from './dtos/create-multiple-questions.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { quiz, exercise } = createQuestionDto;
    if (quiz && exercise) {
      throw new BadRequestException(
        'Chỉ được cung cấp một trong hai trường quiz hoặc exercise',
      );
    }
    if (!quiz && !exercise) {
      throw new BadRequestException(
        'Phải cung cấp một trong hai trường quiz hoặc exercise',
      );
    }

    // Thêm isActive và notion với giá trị mặc định nếu không được cung cấp
    const questionData = {
      ...createQuestionDto,
      isActive:
        createQuestionDto.isActive !== undefined
          ? createQuestionDto.isActive
          : true,
      notation: createQuestionDto.notation || '',
    };

    const question = new this.questionModel(questionData);
    return question.save();
  }

  async findAll(): Promise<{ questions: Question[]; count: number }> {
    const questions = await this.questionModel.find().exec();

    return {
      questions,
      count: questions.length,
    };
  }

  async findById(id: string): Promise<Question> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async findByQuizId(
    quizId: string,
  ): Promise<{ questions: Question[]; count: number }> {
    // Kiểm tra quizId có phải là MongoDB ObjectId hợp lệ không
    if (!quizId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID quiz không hợp lệ');
    }

    // Tìm các câu hỏi thuộc quiz và có trạng thái isActive = true
    const questions = await this.questionModel
      .find({ quiz: quizId, isActive: true })
      .exec();

    return {
      questions,
      count: questions.length,
    };
  }

  async findByExerciseId(
    exerciseId: string,
  ): Promise<{ questions: Question[]; count: number }> {
    // Kiểm tra exerciseId có phải là MongoDB ObjectId hợp lệ không
    if (!exerciseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID bài tập không hợp lệ');
    }

    // Tìm các câu hỏi thuộc exercise và có trạng thái isActive = true
    const questions = await this.questionModel
      .find({ exercise: exerciseId, isActive: true })
      .exec();

    return {
      questions,
      count: questions.length,
    };
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const updatedQuestion = await this.questionModel
      .findByIdAndUpdate(id, updateQuestionDto, { new: true })
      .exec();
    if (!updatedQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return updatedQuestion;
  }

  async remove(id: string): Promise<Question> {
    const deletedQuestion = await this.questionModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return deletedQuestion;
  }

  async createMultiple(
    createMultipleQuestionsDto: CreateMultipleQuestionsDto,
  ): Promise<any> {
    const results = [];

    for (const questionDto of createMultipleQuestionsDto.questions) {
      if (!questionDto.quiz && !questionDto.exercise) {
        throw new BadRequestException(
          'Mỗi câu hỏi phải thuộc về một quiz hoặc exercise',
        );
      }

      if (questionDto.quiz && questionDto.exercise) {
        console.warn('Cả quiz và exercise đều được cung cấp, sẽ ưu tiên quiz');
      }

      // Thêm isActive và notion với giá trị mặc định nếu không được cung cấp
      const questionData = {
        ...questionDto,
        isActive:
          questionDto.isActive !== undefined ? questionDto.isActive : true,
        notion: questionDto.notation || '',
      };

      const question = new this.questionModel(questionData);
      const savedQuestion = await question.save();
      results.push(savedQuestion);
    }

    return {
      message: `Đã tạo thành công ${results.length} câu hỏi`,
      data: results,
    };
  }
}

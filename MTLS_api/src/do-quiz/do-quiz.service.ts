import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoQuiz } from './schemas/do-quiz.schema';
import { CreateDoQuizDto } from './dtos/create-do-quiz.dto';
import { UpdateDoQuizDto } from './dtos/update-do-quiz.dto';
import { QuizService } from 'src/quiz/quiz.service';
import { UsersService } from 'src/user/user.service';
import { QuestionService } from 'src/question/question.service';
import { OptionService } from 'src/option/option.service';

@Injectable()
export class DoQuizService {
  constructor(
    @InjectModel(DoQuiz.name)
    private doQuizModel: Model<DoQuiz>,
    private quizService: QuizService,
    private userService: UsersService,
    private questionService: QuestionService,
    private optionService: OptionService,
  ) {}

  async create(
    createDoQuizDto: CreateDoQuizDto,
    studentId: string,
  ): Promise<DoQuiz> {
    // Kiểm tra quiz có tồn tại không
    await this.quizService.findById(createDoQuizDto.quiz);
    // Kiểm tra student có tồn tại không
    await this.userService.findById(studentId);
    // Kiểm tra xem học viên đã làm quiz này chưa
    const existingSubmission = await this.doQuizModel.findOne({
      quiz: createDoQuizDto.quiz,
      student: studentId,
    });
    if (existingSubmission) {
      throw new BadRequestException('Học viên đã làm quiz này');
    }

    // Tính toán status dựa trên score
    const status = createDoQuizDto.score >= 5;

    const doQuiz = new this.doQuizModel({
      ...createDoQuizDto,
      student: studentId,
      status: status, // Thiết lập status dựa trên score
    });
    return doQuiz.save();
  }

  async findAll(): Promise<{ doQuizzes: DoQuiz[]; count: number }> {
    const doQuizzes = await this.doQuizModel.find().exec();

    return {
      doQuizzes,
      count: doQuizzes.length,
    };
  }

  async findById(id: string): Promise<DoQuiz> {
    const doQuiz = await this.doQuizModel.findById(id).exec();
    if (!doQuiz) {
      throw new NotFoundException(`DoQuiz with ID ${id} not found`);
    }
    return doQuiz;
  }

  async update(id: string, updateDoQuizDto: UpdateDoQuizDto): Promise<DoQuiz> {
    const updatedDoQuiz = await this.doQuizModel
      .findByIdAndUpdate(id, updateDoQuizDto, { new: true })
      .exec();

    if (!updatedDoQuiz) {
      throw new NotFoundException(`DoQuiz with ID ${id} not found`);
    }

    // Cập nhật status dựa trên score
    updatedDoQuiz.status = updatedDoQuiz.score >= 5;

    // Lưu lại bản cập nhật
    await updatedDoQuiz.save();

    return updatedDoQuiz;
  }

  async remove(id: string): Promise<DoQuiz> {
    const deletedDoQuiz = await this.doQuizModel.findByIdAndDelete(id).exec();
    if (!deletedDoQuiz) {
      throw new NotFoundException(`DoQuiz with ID ${id} not found`);
    }
    return deletedDoQuiz;
  }

  async findByQuizId(quizId: string): Promise<DoQuiz[]> {
    return this.doQuizModel.find({ quiz: quizId }).exec();
  }

  async findByStudentId(
    studentId: string,
  ): Promise<{ doQuizzes: DoQuiz[]; count: number }> {
    const doQuizzes = await this.doQuizModel
      .find({ student: studentId })
      .populate('quiz')
      .exec();

    return {
      doQuizzes,
      count: doQuizzes.length,
    };
  }

  async findByStudentIdAndQuizId(
    studentId: string,
    quizId: string,
  ): Promise<DoQuiz> {
    // Kiểm tra tính hợp lệ của ID
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học sinh không hợp lệ: ${studentId}`);
    }

    if (!quizId || !quizId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID quiz không hợp lệ: ${quizId}`);
    }

    // Tìm bài làm quiz mới nhất của học sinh cho quiz này
    const doQuiz = await this.doQuizModel
      .findOne({ student: studentId, quiz: quizId })
      .sort({ createdAt: -1 }) // Lấy bài làm mới nhất
      .exec();

    // Nếu không tìm thấy bài làm, trả về null (thay vì throw error)
    // Điều này giúp UI kiểm tra xem học sinh đã làm bài này chưa
    return doQuiz;
  }

  async getStudentQuizStatus(studentId: string, quizId: string): Promise<{ started: boolean, completed: boolean }> {
    const submission = await this.findByStudentIdAndQuizId(studentId, quizId);

    if (!submission) {
      return { started: false, completed: false };
    }

    return {
      started: true,
      completed: submission.status
    };
  }

  /**
   * Xáo trộn câu hỏi và câu trả lời của một quiz
   * @param quizId ID của quiz cần xáo trộn câu hỏi và câu trả lời
   * @param shuffleQuestions Có xáo trộn câu hỏi hay không
   * @param shuffleOptions Có xáo trộn câu trả lời hay không
   * @returns Danh sách câu hỏi và câu trả lời đã được xáo trộn
   */
  async shuffleQuestionsAndOptions(
    quizId: string,
    shuffleQuestions: boolean = true,
    shuffleOptions: boolean = true,
  ) {
    // Kiểm tra quizId có hợp lệ không
    if (!quizId || !quizId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID quiz không hợp lệ: ${quizId}`);
    }

    // Lấy danh sách câu hỏi của quiz
    const questionsResult = await this.questionService.findByQuizId(quizId);
    let questions = questionsResult.questions;

    // Nếu không có câu hỏi, trả về mảng rỗng
    if (!questions || questions.length === 0) {
      return { questions: [], count: 0 };
    }

    // Xáo trộn câu hỏi nếu cần
    if (shuffleQuestions) {
      questions = this.shuffleArray([...questions]);
    }

    // Lấy và xáo trộn câu trả lời cho mỗi câu hỏi
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        // Chuyển đổi question từ Document sang plain object
        const questionObj = question.toObject();

        try {
          // Lấy các lựa chọn cho câu hỏi này
          const options = await this.optionService.findByQuestionId(question._id.toString());

          // Xáo trộn các lựa chọn nếu cần
          let shuffledOptions = options;
          if (shuffleOptions) {
            shuffledOptions = this.shuffleArray([...options]);
          }

          // Thêm các lựa chọn vào câu hỏi
          return {
            ...questionObj,
            options: shuffledOptions,
          };
        } catch (error) {
          console.error(`Error getting options for question ${question._id}:`, error);
          return {
            ...questionObj,
            options: [],
          };
        }
      }),
    );

    return {
      questions: questionsWithOptions,
      count: questionsWithOptions.length,
    };
  }

  /**
   * Hàm xáo trộn mảng (Fisher-Yates algorithm)
   * @param array Mảng cần xáo trộn
   * @returns Mảng đã được xáo trộn
   */
  private shuffleArray(array: any[]) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

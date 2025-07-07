import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoExercise } from './schemas/do-exercise.schema';
import { CreateDoExerciseDto } from './dtos/create-do-exercise.dto';
import { UpdateDoExerciseDto } from './dtos/update-do-exercise.dto';
import { ExerciseService } from 'src/exercise/exercise.service';
import { UsersService } from 'src/user/user.service';
import { QuestionService } from '../question/question.service';
import { OptionService } from '../option/option.service';

@Injectable()
export class DoExerciseService {
  constructor(
    @InjectModel(DoExercise.name)
    private doExerciseModel: Model<DoExercise>,
    private exerciseService: ExerciseService,
    private userService: UsersService,
    private readonly questionService: QuestionService,
    private readonly optionService: OptionService,
  ) {}

  async create(
    createDoExerciseDto: CreateDoExerciseDto,
    studentId: string,
  ): Promise<DoExercise> {
    // Kiểm tra exercise có tồn tại không
    await this.exerciseService.findById(createDoExerciseDto.exercise);
    // Kiểm tra student có tồn tại không
    await this.userService.findById(studentId);
    // Kiểm tra xem học viên đã làm exercise này chưa
    const existingSubmission = await this.doExerciseModel.findOne({
      exercise: createDoExerciseDto.exercise,
      student: studentId,
    });
    if (existingSubmission) {
      throw new BadRequestException('Học viên đã làm bài tập này');
    }

    // Tính toán status dựa trên score
    const status = createDoExerciseDto.score >= 5;

    const doExercise = new this.doExerciseModel({
      ...createDoExerciseDto,
      student: studentId,
      status: status,
    });
    return doExercise.save();
  }

  async findAll(): Promise<{ doExercises: DoExercise[]; count: number }> {
    const doExercises = await this.doExerciseModel.find().exec();
    return {
      doExercises,
      count: doExercises.length,
    };
  }

  async findById(id: string): Promise<DoExercise> {
    const doExercise = await this.doExerciseModel.findById(id).exec();
    if (!doExercise) {
      throw new NotFoundException(`DoExercise with ID ${id} not found`);
    }
    return doExercise;
  }

  async update(
    id: string,
    updateDoExerciseDto: UpdateDoExerciseDto,
  ): Promise<DoExercise> {
    const updatedDoExercise = await this.doExerciseModel
      .findByIdAndUpdate(id, updateDoExerciseDto, { new: true })
      .exec();

    if (!updatedDoExercise) {
      throw new NotFoundException(`DoExercise with ID ${id} not found`);
    }

    // Cập nhật status dựa trên score
    updatedDoExercise.status = updatedDoExercise.score >= 5;

    // Lưu lại bản cập nhật
    await updatedDoExercise.save();

    return updatedDoExercise;
  }

  async remove(id: string): Promise<DoExercise> {
    const deletedDoExercise = await this.doExerciseModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedDoExercise) {
      throw new NotFoundException(`DoExercise with ID ${id} not found`);
    }
    return deletedDoExercise;
  }

  async findByExerciseId(exerciseId: string): Promise<DoExercise[]> {
    return this.doExerciseModel.find({ exercise: exerciseId }).exec();
  }

  async findByStudentId(
    studentId: string,
  ): Promise<{ doExercises: DoExercise[]; count: number }> {
    const doExercises = await this.doExerciseModel
      .find({ student: studentId })
      .populate('exercise')
      .exec();

    return {
      doExercises,
      count: doExercises.length,
    };
  }

  async findByStudentIdAndExerciseId(
    studentId: string,
    exerciseId: string,
  ): Promise<any> {
    // Kiểm tra tính hợp lệ của ID
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học sinh không hợp lệ: ${studentId}`);
    }

    if (!exerciseId || !exerciseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID exercise không hợp lệ: ${exerciseId}`);
    }

    // Tìm bài làm exercise mới nhất của học sinh
    const doExercise = await this.doExerciseModel
      .findOne({ student: studentId, exercise: exerciseId })
      .sort({ createdAt: -1 })
      .exec();

    if (!doExercise) {
      return null;
    }

    // Lấy danh sách câu hỏi của exercise mà không xáo trộn
    const { questions } = await this.shuffleQuestionsAndOptions(exerciseId, false, false);

    // Trả về kết quả với câu hỏi theo thứ tự mặc định
    return {
      ...doExercise.toObject(),
      questions,
    };
  }

  async getStudentExerciseStatus(studentId: string, exerciseId: string): Promise<{ started: boolean, completed: boolean }> {
    const submission = await this.findByStudentIdAndExerciseId(studentId, exerciseId);

    if (!submission) {
      return { started: false, completed: false };
    }

    return {
      started: true,
      completed: submission.status
    };
  }

  /**
   * Xáo trộn câu hỏi và câu trả lời của một exercise
   * @param exerciseId ID của exercise cần xáo trộn câu hỏi và câu trả lời
   * @param shuffleQuestions Có xáo trộn câu hỏi hay không
   * @param shuffleOptions Có xáo trộn câu trả lời hay không
   * @returns Danh sách câu hỏi và câu trả lời đã được xáo trộn
   */
  async shuffleQuestionsAndOptions(
    exerciseId: string,
    shuffleQuestions: boolean = true,
    shuffleOptions: boolean = true,
  ) {
    // Kiểm tra exerciseId có hợp lệ không
    if (!exerciseId || !exerciseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID exercise không hợp lệ: ${exerciseId}`);
    }

    // Lấy danh sách câu hỏi của exercise
    const questionsResult = await this.questionService.findByExerciseId(exerciseId);
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
        const questionObj = question.toObject ? question.toObject() : question;

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
   * Xáo trộn một mảng
   * @param array Mảng cần xáo trộn
   * @returns Mảng đã được xáo trộn
   */
  private shuffleArray(array: any[]): any[] {
    // Tạo bản sao của mảng để không thay đổi mảng gốc
    const shuffled = [...array];

    // Thuật toán Fisher-Yates (Knuth) shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubmitAnswer } from './schemas/submit-answer.schema';
import { CreateSubmitAnswerDto } from './dtos/create-submit-answer.dto';
import { UpdateSubmitAnswerDto } from './dtos/update-submit-answer.dto';
import { Option } from '../option/schemas/option.schema';
import { DoQuiz } from '../do-quiz/schemas/do-quiz.schema';
import { DoExercise } from '../do-exercise/schemas/do-exercise.schema';
import { CreateMultipleSubmitAnswersDto } from './dtos/create-multiple-submit-answers.dto';
import { UpdateMultipleSubmitAnswersDto } from './dtos/update-multiple-submit-answers.dto';

@Injectable()
export class SubmitAnswerService {
  constructor(
    @InjectModel(SubmitAnswer.name)
    private submitAnswerModel: Model<SubmitAnswer>,
    @InjectModel(Option.name) private optionModel: Model<Option>,
    @InjectModel(DoQuiz.name) private doQuizModel: Model<DoQuiz>,
    @InjectModel(DoExercise.name) private doExerciseModel: Model<DoExercise>,
  ) {}

  async create(
    createSubmitAnswerDto: CreateSubmitAnswerDto,
  ): Promise<SubmitAnswer> {
    const { doQuiz, doExercise } = createSubmitAnswerDto;
    // Validation: Ensure only one of doQuiz or doExercise is set
    if (doQuiz && doExercise) {
      throw new BadRequestException(
        'Only one of doQuiz or doExercise should be set.',
      );
    }
    const submitAnswer = new this.submitAnswerModel(createSubmitAnswerDto);
    return submitAnswer.save();
  }

  async findAll(): Promise<SubmitAnswer[]> {
    return this.submitAnswerModel.find().exec();
  }

  async findById(id: string): Promise<SubmitAnswer> {
    const submitAnswer = await this.submitAnswerModel.findById(id).exec();
    if (!submitAnswer) {
      throw new NotFoundException(`SubmitAnswer with ID ${id} not found`);
    }
    return submitAnswer;
  }

  async update(
    id: string,
    updateSubmitAnswerDto: UpdateSubmitAnswerDto,
  ): Promise<SubmitAnswer> {
    const updatedSubmitAnswer = await this.submitAnswerModel
      .findByIdAndUpdate(id, updateSubmitAnswerDto, { new: true })
      .exec();
    if (!updatedSubmitAnswer) {
      throw new NotFoundException(`SubmitAnswer with ID ${id} not found`);
    }
    return updatedSubmitAnswer;
  }

  async remove(id: string): Promise<SubmitAnswer> {
    const deletedSubmitAnswer = await this.submitAnswerModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedSubmitAnswer) {
      throw new NotFoundException(`SubmitAnswer with ID ${id} not found`);
    }
    return deletedSubmitAnswer;
  }

  async findByDoQuizId(doQuizId: string): Promise<SubmitAnswer[]> {
    const submitAnswers = await this.submitAnswerModel
      .find({ doQuiz: doQuizId })
      .exec();
    if (!submitAnswers || submitAnswers.length === 0) {
      throw new NotFoundException(
        `No submit answers found for DoQuiz ID ${doQuizId}`,
      );
    }
    return submitAnswers;
  }

  async countCorrectOptionsAndUpdateScore(doQuizId: string): Promise<number> {
    const submitAnswers = await this.submitAnswerModel
      .find({ doQuiz: doQuizId })
      .exec();
    if (!submitAnswers || submitAnswers.length === 0) {
      throw new NotFoundException(
        `No submit answers found for DoQuiz ID ${doQuizId}`,
      );
    }

    let correctCount = 0;
    for (const answer of submitAnswers) {
      const option = await this.optionModel.findById(answer.option).exec();
      if (option && option.isCorrect) {
        correctCount++;
      }
    }

    await this.doQuizModel
      .findByIdAndUpdate(doQuizId, { score: correctCount, status: true })
      .exec();

    return correctCount;
  }

  /**
   * Tìm các bản ghi submit-answer có trùng doExerciseId
   * @param doExerciseId ID của bài làm exercise cần tìm
   * @returns Danh sách các câu trả lời trong bài làm
   */
  async findByDoExerciseId(doExerciseId: string): Promise<SubmitAnswer[]> {
    const submitAnswers = await this.submitAnswerModel
      .find({ doExercise: doExerciseId })
      .exec();

    if (!submitAnswers || submitAnswers.length === 0) {
      throw new NotFoundException(
        `No submit answers found for DoExercise ID ${doExerciseId}`,
      );
    }

    return submitAnswers;
  }

  /**
   * Đếm số câu trả lời đúng và cập nhật điểm cho bài làm exercise
   * @param doExerciseId ID của bài làm exercise cần tính điểm
   * @returns Số câu trả lời đúng
   */
  async countCorrectAnswersAndUpdateExerciseScore(
    doExerciseId: string,
  ): Promise<number> {
    const submitAnswers = await this.submitAnswerModel
      .find({ doExercise: doExerciseId })
      .exec();

    if (!submitAnswers || submitAnswers.length === 0) {
      throw new NotFoundException(
        `No submit answers found for DoExercise ID ${doExerciseId}`,
      );
    }

    let correctCount = 0;
    for (const answer of submitAnswers) {
      const option = await this.optionModel.findById(answer.option).exec();
      if (option && option.isCorrect) {
        correctCount++;
      }
    }

    // Cập nhật điểm số cho bài làm exercise
    await this.doExerciseModel
      .findByIdAndUpdate(doExerciseId, { score: correctCount, status: true })
      .exec();

    return correctCount;
  }

  async createMultiple(createMultipleDto: CreateMultipleSubmitAnswersDto) {
    const results = [];
    const errors = [];

    for (const answerDto of createMultipleDto.submitAnswers) {
      try {
        const savedAnswer = await this.create(answerDto);
        results.push(savedAnswer);
      } catch (error) {
        errors.push({
          answer: answerDto,
          error: error.message,
        });
      }
    }

    return {
      success: {
        count: results.length,
        data: results,
      },
      errors: {
        count: errors.length,
        data: errors,
      },
    };
  }

  async updateMultiple(updateMultipleDto: UpdateMultipleSubmitAnswersDto) {
    console.log('Bắt đầu cập nhật câu trả lời:', updateMultipleDto);

    // Kiểm tra tính hợp lệ của doQuiz hoặc doExercise
    if (!updateMultipleDto.doQuiz && !updateMultipleDto.doExercise) {
      throw new BadRequestException('Phải cung cấp doQuiz hoặc doExercise');
    }

    // Xóa câu trả lời hiện có
    try {
      if (updateMultipleDto.doExercise) {
        if (!updateMultipleDto.doExercise.match(/^[0-9a-fA-F]{24}$/)) {
          throw new BadRequestException(
            `ID của doExercise không hợp lệ: ${updateMultipleDto.doExercise}`,
          );
        }

        console.log(
          `Xóa câu trả lời cho doExercise: ${updateMultipleDto.doExercise}`,
        );
        const deleteResult = await this.submitAnswerModel.deleteMany({
          doExercise: updateMultipleDto.doExercise,
        });
        console.log(
          `Đã xóa ${deleteResult.deletedCount} câu trả lời của doExercise`,
        );
      }

      if (updateMultipleDto.doQuiz) {
        if (!updateMultipleDto.doQuiz.match(/^[0-9a-fA-F]{24}$/)) {
          throw new BadRequestException(
            `ID của doQuiz không hợp lệ: ${updateMultipleDto.doQuiz}`,
          );
        }

        console.log(`Xóa câu trả lời cho doQuiz: ${updateMultipleDto.doQuiz}`);
        const deleteResult = await this.submitAnswerModel.deleteMany({
          doQuiz: updateMultipleDto.doQuiz,
        });
        console.log(
          `Đã xóa ${deleteResult.deletedCount} câu trả lời của doQuiz`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Lỗi khi xóa câu trả lời:', error);
      throw new BadRequestException(
        `Không thể xóa câu trả lời hiện có: ${error.message}`,
      );
    }

    // Tạo câu trả lời mới
    const results = [];
    const errors = [];

    for (const answerDto of updateMultipleDto.submitAnswers) {
      try {
        // Đảm bảo answerDto có doQuiz hoặc doExercise đúng
        if (updateMultipleDto.doQuiz) {
          answerDto.doQuiz = updateMultipleDto.doQuiz;
        }
        if (updateMultipleDto.doExercise) {
          answerDto.doExercise = updateMultipleDto.doExercise;
        }

        console.log('Tạo câu trả lời mới:', answerDto);
        const savedAnswer = await this.create(answerDto);
        results.push(savedAnswer);
      } catch (error) {
        console.error('Lỗi khi tạo câu trả lời:', error);
        errors.push({
          answer: answerDto,
          error: error.message,
        });
      }
    }

    return {
      success: {
        count: results.length,
        data: results,
      },
      errors: {
        count: errors.length,
        data: errors,
      },
    };
  }
}

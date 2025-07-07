import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise } from './schemas/exercise.schema';
import { CreateExerciseDto } from './dtos/create-exercise.dto';
import { UpdateExerciseDto } from './dtos/update-exercise.dto';
import { SectionService } from '../section/section.service';
import { Question } from '../question/schemas/question.schema';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,
    @InjectModel(Question.name)
    private questionModel: Model<Question>,
    private sectionService: SectionService,
  ) { }

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    // kiểm tra section có tồn tại không
    await this.sectionService.findById(createExerciseDto.section);
    const exercise = new this.exerciseModel(createExerciseDto);
    return exercise.save();
  }

  async findAll(): Promise<{ exercises: Exercise[]; count: number }> {
    const exercises = await this.exerciseModel.find().exec();

    return {
      exercises,
      count: exercises.length,
    };
  }

  async findById(id: string): Promise<Exercise> {
    const exercise = await this.exerciseModel.findById(id).exec();
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercise;
  }

  async findBySectionId(id: string): Promise<Exercise[]> {
    const exercises = await this.exerciseModel.find({ section: id }).exec();
    if (!exercises) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercises;
  }

  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    const updatedExercise = await this.exerciseModel
      .findByIdAndUpdate(id, updateExerciseDto, { new: true })
      .exec();
    if (!updatedExercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return updatedExercise;
  }

  async remove(id: string): Promise<Exercise> {
    const deletedExercise = await this.exerciseModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedExercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return deletedExercise;
  }

  async findAllWithQuestionsCount(): Promise<{
    exercises: any[];
    count: number;
  }> {
    const exercises = await this.exerciseModel.find().exec();

    const exercisesWithCount = await Promise.all(
      exercises.map(async (exercise) => {
        const exerciseObj = exercise.toObject();
        // Đếm số câu hỏi từ bảng Question
        const questionsCount = await this.questionModel
          .countDocuments({ exercise: exercise._id })
          .exec();
        return {
          ...exerciseObj,
          questionsCount,
        };
      }),
    );

    return {
      exercises: exercisesWithCount,
      count: exercises.length,
    };
  }

  async findBySectionIdWithQuestionsCount(id: string): Promise<any[]> {
    const exercises = await this.exerciseModel.find({ section: id }).exec();

    return Promise.all(
      exercises.map(async (exercise) => {
        const exerciseObj = exercise.toObject();
        // Đếm số câu hỏi từ bảng Question
        const questionsCount = await this.questionModel
          .countDocuments({ exercise: exercise._id })
          .exec();
        return {
          ...exerciseObj,
          questionsCount,
        };
      }),
    );
  }
}

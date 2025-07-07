import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { SectionService } from '../section/section.service';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @Inject(forwardRef(() => SectionService))
    private readonly sectionService: SectionService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Kiểm tra section có tồn tại không
    await this.sectionService.findById(createLessonDto.section);

    const createdLesson = new this.lessonModel(createLessonDto);
    return createdLesson.save();
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel
    .find()
    .populate('section','title').exec();
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel
      .findById(id)
      .populate('section','title')
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async findById(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    if (updateLessonDto.section) {
      await this.sectionService.findById(updateLessonDto.section);
    }

    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .populate('section')
      .exec();

    if (!updatedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return updatedLesson;
  }

  async remove(id: string): Promise<void> {
    const result = await this.lessonModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }

  async findBySection(sectionId: string): Promise<Lesson[]> {
    return this.lessonModel.find({ section: sectionId }).populate('section','title').exec();
  }

  async addLessonToSection(sectionId: string, createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Kiểm tra section có tồn tại không
    const section = await this.sectionService.findById(sectionId);
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    // Tạo lesson mới với sectionId
    const lesson = new this.lessonModel({
      ...createLessonDto,
      section: sectionId,
    });

    // Lưu lesson
    const savedLesson = await lesson.save();

    // Populate section data
    return savedLesson.populate('section');
  }
}
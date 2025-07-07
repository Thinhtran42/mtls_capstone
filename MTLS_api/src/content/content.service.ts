import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { LessonService } from '../lesson/lesson.service';
import { ContentType } from './schemas/content.schema';
import { CreateMultipleContentsDto } from './dto/create-multiple-contents.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    // Kiểm tra lesson có tồn tại không
    await this.lessonService.findOne(createContentDto.lesson);

    const content = new this.contentModel(createContentDto);
    const savedContent = await content.save();

    return this.contentModel
      .findById(savedContent._id)
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();
  }

  async findAll(): Promise<Content[]> {
    return this.contentModel
      .find({ isActive: true })
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentModel
      .findOne({ _id: id, isActive: true })
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    if (updateContentDto.lesson) {
      await this.lessonService.findOne(updateContentDto.lesson);
    }

    const updatedContent = await this.contentModel
      .findByIdAndUpdate(id, updateContentDto, { new: true })
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();

    if (!updatedContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return updatedContent;
  }

  async remove(id: string): Promise<Content> {
    // Soft delete by setting isActive to false
    const deletedContent = await this.contentModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();

    if (!deletedContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return deletedContent;
  }

  async findByLesson(lessonId: string): Promise<Content[]> {
    return this.contentModel
      .find({ lesson: lessonId, isActive: true })
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();
  }

  async addContentToLesson(lessonId: string, createContentDto: CreateContentDto): Promise<Content> {
    // Kiểm tra lesson có tồn tại không
    const lesson = await this.lessonService.findOne(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Tạo content mới với lessonId
    const content = new this.contentModel({
      ...createContentDto,
      lesson: lessonId,
      isActive: true,
    });

    // Lưu content
    const savedContent = await content.save();

    // Populate lesson data
    return this.contentModel
      .findById(savedContent._id)
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();
  }

  async findByType(type: ContentType): Promise<Content[]> {
    return this.contentModel
      .find({ type, isActive: true })
      .populate({
        path: 'lesson',
        select: 'title description duration',
        populate: {
          path: 'section',
          select: 'title type'
        }
      })
      .exec();
  }

  async createMultiple(createMultipleContentsDto: CreateMultipleContentsDto): Promise<any> {
    const results = [];

    for (const contentDto of createMultipleContentsDto.contents) {
      const content = new this.contentModel(contentDto);
      const savedContent = await content.save();
      results.push(savedContent);
    }

    return {
      message: `Đã tạo thành công ${results.length} nội dung`,
      data: results
    };
  }
}

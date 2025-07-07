import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Discussion } from './schemas/discussion.schema';
import { CreateDiscussionDto } from './dtos/create-discussion.dto';
import { UpdateDiscussionDto } from './dtos/update-discussion.dto';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectModel(Discussion.name) private discussionModel: Model<Discussion>,
  ) { }

  async createDiscussion(
    createDiscussionDto: CreateDiscussionDto,
    studentId: string,
  ): Promise<Discussion> {
    console.log('Creating discussion with studentId:', studentId);
    console.log('CreateDiscussionDto:', JSON.stringify(createDiscussionDto));

    try {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new BadRequestException(`Invalid teacher ID: ${studentId}`);
      }

      const discussion = new this.discussionModel({
        ...createDiscussionDto,
        studentId: studentId,
      });

      return await discussion.save();
    } catch (error) {
      console.error('Error saving course:', error);
      throw new BadRequestException(
        `Error creating discussion: ${error.message}`,
      );
    }
  }

  async create(createDiscussionDto: CreateDiscussionDto): Promise<Discussion> {
    const discussion = new this.discussionModel(createDiscussionDto);
    return discussion.save();
  }

  async findAll(): Promise<Discussion[]> {
    return this.discussionModel.find().exec();
  }

  async findById(id: string): Promise<Discussion> {
    const discussion = await this.discussionModel.findById(id).exec();

    if (!discussion) {
      throw new NotFoundException(`Discussion with ID ${id} not found`);
    }
    return discussion;
  }

  async findByModuleId(moduleId: string): Promise<Discussion[]> {
    return this.discussionModel.find({ moduleId }).exec();
  }

  async findByStudentId(studentId: string): Promise<Discussion[]> {
    return this.discussionModel.find({ studentId }).exec();
  }

  async update(
    id: string,
    updateDiscussionDto: UpdateDiscussionDto,
  ): Promise<Discussion> {
    const discussion = await this.discussionModel
      .findByIdAndUpdate(id, updateDiscussionDto, { new: true })
      .exec();

    if (!discussion) {
      throw new NotFoundException(`Discussion with ID ${id} not found`);
    }
    return discussion;
  }

  async remove(id: string): Promise<Discussion> {
    const discussion = await this.discussionModel.findByIdAndDelete(id).exec();
    if (!discussion) {
      throw new NotFoundException(`Discussion with ID ${id} not found`);
    }
    return discussion;
  }

  async findByModule(
    moduleId: string,
  ): Promise<{ discussions: Discussion[]; count: number }> {
    if (!moduleId || !moduleId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID module không hợp lệ: ${moduleId}`);
    }

    const discussions = await this.discussionModel
      .find({ moduleId: moduleId })
      .populate('studentId', 'fullname email avatar')
      .populate('moduleId', 'title')
      .sort({ createdAt: -1 })
      .exec();

    return {
      discussions,
      count: discussions.length,
    };
  }

  async findByStudentAndModule(
    studentId: string,
    moduleId: string,
  ): Promise<{ discussions: Discussion[]; count: number }> {
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học sinh không hợp lệ: ${studentId}`);
    }

    if (!moduleId || !moduleId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID module không hợp lệ: ${moduleId}`);
    }

    const discussions = await this.discussionModel
      .find({
        studentId: studentId,
        moduleId: moduleId,
      })
      .populate('studentId', 'fullname email avatar')
      .populate('moduleId', 'title')
      .sort({ createdAt: -1 })
      .exec();

    return {
      discussions,
      count: discussions.length,
    };
  }
}

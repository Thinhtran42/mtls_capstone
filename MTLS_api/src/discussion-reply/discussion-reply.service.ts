import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DiscussionReply } from './schemas/discussion-reply.schema';
import { CreateDiscussionReplyDto } from './dtos/create-discussion-reply.dto';
import { UpdateDiscussionReplyDto } from './dtos/update-discussion-reply.dto';
import { DiscussionService } from '../discussion/discussion.service';

@Injectable()
export class DiscussionReplyService {
  constructor(
    @InjectModel(DiscussionReply.name)
    private discussionReplyModel: Model<DiscussionReply>,
    private discussionService: DiscussionService,
  ) { }

  async createReply(
    createDiscussionReplyDto: CreateDiscussionReplyDto,
    studentId: string,
  ): Promise<DiscussionReply> {
    try {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new BadRequestException(`Invalid student ID: ${studentId}`);
      }

      const discussion = await this.discussionService.findById(
        createDiscussionReplyDto.discussionId,
      );
      if (!discussion) {
        throw new BadRequestException(
          `Discussion with ID ${createDiscussionReplyDto.discussionId} not found`,
        );
      }

      const reply = new this.discussionReplyModel({
        ...createDiscussionReplyDto,
        studentId: studentId,
      });

      return await reply.save();
    } catch (error) {
      throw new BadRequestException(`Error creating reply: ${error.message}`);
    }
  }

  async findAll(): Promise<DiscussionReply[]> {
    return this.discussionReplyModel.find({ isActive: true }).exec();
  }

  async findById(id: string): Promise<DiscussionReply> {
    const reply = await this.discussionReplyModel.findById(id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }
    return reply;
  }

  async findByDiscussionId(discussionId: string): Promise<DiscussionReply[]> {
    return this.discussionReplyModel
      .find({
        discussionId,
        isActive: true,
      })
      .populate('student', 'fullname email avatar role')
      .populate({
        path: 'discussionId',
        select: 'content moduleId',
        populate: {
          path: 'moduleId',
          select: 'title',
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStudentId(studentId: string): Promise<DiscussionReply[]> {
    return this.discussionReplyModel
      .find({
        studentId,
        isActive: true,
      })
      .exec();
  }

  async update(
    id: string,
    updateDiscussionReplyDto: UpdateDiscussionReplyDto,
  ): Promise<DiscussionReply> {
    const reply = await this.discussionReplyModel
      .findByIdAndUpdate(id, updateDiscussionReplyDto, { new: true })
      .exec();

    if (!reply) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }
    return reply;
  }

  async remove(id: string): Promise<DiscussionReply> {
    const reply = await this.discussionReplyModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!reply) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }
    return reply;
  }

  async findByDiscussion(
    discussionId: string,
  ): Promise<{ replies: DiscussionReply[]; count: number }> {
    if (!discussionId || !discussionId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(
        `ID thảo luận không hợp lệ: ${discussionId}`,
      );
    }

    const replies = await this.discussionReplyModel
      .find({ discussion: discussionId })
      .populate('student', 'fullname email avatar role')
      .populate({
        path: 'discussion',
        select: 'title content',
        populate: {
          path: 'module',
          select: 'title',
        },
      })
      .sort({ createdAt: 1 })
      .exec();

    return {
      replies,
      count: replies.length,
    };
  }

  async findByStudentAndDiscussion(
    studentId: string,
    discussionId: string,
  ): Promise<{ replies: DiscussionReply[]; count: number }> {
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học sinh không hợp lệ: ${studentId}`);
    }

    if (!discussionId || !discussionId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(
        `ID thảo luận không hợp lệ: ${discussionId}`,
      );
    }

    const replies = await this.discussionReplyModel
      .find({
        student: studentId,
        discussion: discussionId,
      })
      .populate('student', 'fullname email avatar role')
      .populate('discussion', 'title content')
      .sort({ createdAt: -1 })
      .exec();

    return {
      replies,
      count: replies.length,
    };
  }

  async findByStudent(
    studentId: string,
  ): Promise<{ replies: DiscussionReply[]; count: number }> {
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException(`ID học sinh không hợp lệ: ${studentId}`);
    }

    const replies = await this.discussionReplyModel
      .find({ student: studentId })
      .populate('student', 'fullname email avatar role')
      .populate({
        path: 'discussion',
        select: 'title content module',
        populate: {
          path: 'module',
          select: 'title',
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      replies,
      count: replies.length,
    };
  }
}

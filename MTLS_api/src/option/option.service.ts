import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Option } from './schemas/option.schema';
import { CreateOptionDto } from './dtos/create-option.dto';
import { UpdateOptionDto } from './dtos/update-option.dto';
import { CreateMultipleOptionsDto } from './dtos/create-multiple-options.dto';
import { QuestionService } from 'src/question/question.service';

@Injectable()
export class OptionService {
  constructor(
    @InjectModel(Option.name)
    private optionModel: Model<Option>,
    private questionService: QuestionService,
  ) {}

  async create(createOptionDto: CreateOptionDto): Promise<Option> {
    //kiểm tra có đúng question không
    await this.questionService.findById(createOptionDto.question);

    // Thêm isActive với giá trị mặc định là true nếu không được cung cấp
    const optionData = {
      ...createOptionDto,
      isActive:
        createOptionDto.isActive !== undefined
          ? createOptionDto.isActive
          : true,
    };

    const option = new this.optionModel(optionData);
    return option.save();
  }

  async findAll(): Promise<Option[]> {
    return this.optionModel.find().exec();
  }

  async findById(id: string): Promise<Option> {
    const option = await this.optionModel.findById(id).exec();
    if (!option) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }
    return option;
  }

  async findByQuestionId(questionId: string): Promise<Option[]> {
    return this.optionModel.find({ question: questionId }).exec();
  }

  async update(id: string, updateOptionDto: UpdateOptionDto): Promise<Option> {
    const updatedOption = await this.optionModel
      .findByIdAndUpdate(id, updateOptionDto, { new: true })
      .exec();
    if (!updatedOption) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }
    return updatedOption;
  }

  async remove(id: string): Promise<Option> {
    const deletedOption = await this.optionModel.findByIdAndDelete(id).exec();
    if (!deletedOption) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }
    return deletedOption;
  }

  async createMultiple(
    createMultipleOptionsDto: CreateMultipleOptionsDto,
  ): Promise<any> {
    const results = [];

    for (const optionDto of createMultipleOptionsDto.options) {
      // Thêm isActive với giá trị mặc định là true nếu không được cung cấp
      const optionData = {
        ...optionDto,
        isActive: optionDto.isActive !== undefined ? optionDto.isActive : true,
      };

      const option = new this.optionModel(optionData);
      const savedOption = await option.save();
      results.push(savedOption);
    }

    return {
      message: `Đã tạo thành công ${results.length} tùy chọn`,
      data: results,
    };
  }
}

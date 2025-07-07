import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { Module, ModuleDocument } from './schemas/module.schema';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Course } from './schemas/course.schema';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    // Create a new instance of the module model
    const newModule = new this.moduleModel(createModuleDto);
    await newModule.save(); // Save the new module instance

    if (createModuleDto.course) {
      await this.courseModel.findOne({ _id: createModuleDto.course }).then((course) => {
        if (!course.module) course.module = [];
        course.module.push(newModule._id as MongooseSchema.Types.ObjectId);
        return course.save();
      });
    }
    return newModule;
  }

  async findAll(): Promise<Module[]> {
    return this.moduleModel
      .find({ isActive: true })
      .populate('course', 'title description level')
      .exec();
  }

  async findById(id: string): Promise<Module> {
    const module = await this.moduleModel
      .findOne({ _id: id, isActive: true })
      .populate('course', 'title description level')
      .exec();
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  async findByCourseId(course: string): Promise<Module[]> {
    return this.moduleModel
      .find({ course, isActive: true })
      .populate('course', 'title description level')
      .exec();
  }

  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const updatedModule = await this.moduleModel
      .findByIdAndUpdate(id, updateModuleDto, { new: true })
      .populate('course', 'title description')
      .exec();
    if (!updatedModule) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return updatedModule;
  }

  async remove(id: string): Promise<Module> {
    // Soft delete by setting isActive to false
    const deletedModule = await this.moduleModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .populate('course', 'title description')
      .exec();
    if (!deletedModule) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return deletedModule;
  }

  async updateStatus(id: string, isActive: boolean): Promise<Module> {
    const updatedModule = await this.moduleModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .populate('course', 'title description')
      .exec();
    if (!updatedModule) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return updatedModule;
  }

  async addSectionToModule(moduleId: string, sectionId: string): Promise<Module> {
    try {
      const module = await this.moduleModel.findById(moduleId);
      if (!module) {
        throw new NotFoundException(`Module with ID ${moduleId} not found`);
      }

      if (!module.sections) {
        module.sections = [];
      }

      // Kiểm tra xem section đã tồn tại trong module chưa
      if (module.sections.includes(sectionId as any)) {
        throw new BadRequestException('Section already exists in this module');
      }

      module.sections.push(sectionId as any);
      return await module.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add section to module');
    }
  }
}

import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section, SectionDocument } from './schemas/section.schema';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ModuleService } from '../course/module.service';
import { LessonService } from '../lesson/lesson.service';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    private readonly moduleService: ModuleService,
    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,
  ) {}

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    const section = new this.sectionModel(createSectionDto);
    await section.save();

    // Thêm section vào module
    await this.moduleService.addSectionToModule(
      section.module.toString(),
      section._id.toString(),
    );

    return section;
  }

  async findAll(): Promise<Section[]> {
    return this.sectionModel
      .find({ isActive: true })
      .populate('module', 'title description')
      .exec();
  }

  async findById(id: string): Promise<Section> {
    const section = await this.sectionModel
      .findOne({ _id: id, isActive: true })
      .populate('module', 'title description')
      .exec();
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    return section;
  }

  async findByModuleId(module: string): Promise<Section[]> {
    return this.sectionModel
      .find({ module, isActive: true })
      .populate('module', 'title description')
      .exec();
  }

  async findByType(type: string): Promise<Section[]> {
    return this.sectionModel
      .find({ type, isActive: true })
      .populate('module', 'title description')
      .exec();
  }

  async update(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    // If module is provided, check if it exists
    if (updateSectionDto.module) {
      const module = await this.moduleService.findById(updateSectionDto.module);
      if (!module) {
        throw new NotFoundException(
          `Module with ID ${updateSectionDto.module} not found`,
        );
      }
    }

    const updatedSection = await this.sectionModel
      .findByIdAndUpdate(id, updateSectionDto, { new: true })
      .populate('module', 'title description')
      .exec();
    if (!updatedSection) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    return updatedSection;
  }

  async remove(id: string): Promise<Section> {
    // Soft delete by setting isActive to false
    const deletedSection = await this.sectionModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .populate('module', 'title description')
      .exec();
    if (!deletedSection) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    return deletedSection;
  }

  async updateStatus(id: string, isActive: boolean): Promise<Section> {
    const updatedSection = await this.sectionModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .populate('module', 'title description')
      .exec();
    if (!updatedSection) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }
    return updatedSection;
  }

  async addLessonToSection(
    sectionId: string,
    createLessonDto: any,
  ): Promise<any> {
    // Kiểm tra section có tồn tại không
    const section = await this.findById(sectionId);
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    // Gọi đến lessonService để tạo lesson và liên kết với section
    return this.lessonService.addLessonToSection(sectionId, createLessonDto);
  }
}

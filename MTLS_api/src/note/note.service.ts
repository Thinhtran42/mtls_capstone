import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ModuleService } from '../course/module.service';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    private moduleService: ModuleService,
  ) {}

  async create(createNoteDto: CreateNoteDto, studentId: string): Promise<Note> {
    // Kiểm tra module có tồn tại không
    await this.moduleService.findById(createNoteDto.module);

    const note = new this.noteModel({
      ...createNoteDto,
      student: studentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return note.save();
  }

  async findAll(): Promise<{ notes: Note[]; count: number }> {
    const notes = await this.noteModel.find()
      .populate('student', 'fullname email')
      .populate('module', 'title')
      .exec();

    return {
      notes,
      count: notes.length
    };
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.noteModel.findById(id)
      .populate('student', 'fullname email')
      .populate('module', 'title')
      .exec();

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, studentId: string): Promise<Note> {
    // Kiểm tra note có tồn tại không và thuộc về học viên này không
    const note = await this.noteModel.findOne({ _id: id, student: studentId });

    if (!note) {
      throw new NotFoundException(`Note not found or you don't have permission to update it`);
    }

    const updatedNote = await this.noteModel
      .findByIdAndUpdate(
        id,
        { ...updateNoteDto, updatedAt: new Date() },
        { new: true }
      )
      .populate('student', 'fullname email')
      .populate('module', 'title')
      .exec();

    return updatedNote;
  }

  async remove(id: string, studentId: string): Promise<Note> {
    // Kiểm tra note có tồn tại không và thuộc về học viên này không
    const note = await this.noteModel.findOneAndDelete({ _id: id, student: studentId });

    if (!note) {
      throw new NotFoundException(`Note not found or you don't have permission to delete it`);
    }

    return note;
  }

  async findByStudentId(studentId: string): Promise<{ notes: Note[]; count: number }> {
    const notes = await this.noteModel.find({ student: studentId })
      .populate('student', 'fullname email')
      .populate('module', 'title')
      .sort({ createdAt: -1 })
      .exec();

    return {
      notes,
      count: notes.length
    };
  }

  async findByModuleId(moduleId: string): Promise<{ notes: Note[]; count: number }> {
    const notes = await this.noteModel.find({ module: moduleId })
      .populate('student', 'fullname email')
      .populate('module', 'title')
      .sort({ createdAt: -1 })
      .exec();

    return {
      notes,
      count: notes.length
    };
  }

  async findByStudentAndModule(studentId: string, moduleId: string): Promise<{ notes: Note[]; count: number }> {
    const notes = await this.noteModel.find({
      student: studentId,
      module: moduleId
    })
      .populate('student', 'fullname email')
      .populate('module', 'title')
      .sort({ createdAt: -1 })
      .exec();

    return {
      notes,
      count: notes.length
    };
  }
}
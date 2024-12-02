import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<AdminDocument>) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const { username, email, password } = createAdminDto;

    // 检查用户名是否已存在
    const existingAdmin = await this.adminModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingAdmin) {
      throw new ConflictException('Username or email already exists');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdAdmin = new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
      roles: createAdminDto.roles || ['admin'],
    });

    return createdAdmin.save();
  }

  async findAll(): Promise<Admin[]> {
    return this.adminModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminModel.findById(id).select('-password');
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async findByUsername(username: string): Promise<Admin> {
    const admin = await this.adminModel.findOne({ username });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async update(id: string, updateData: Partial<Admin>): Promise<Admin> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const admin = await this.adminModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select('-password');

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async remove(id: string): Promise<void> {
    const result = await this.adminModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Admin not found');
    }
  }
}

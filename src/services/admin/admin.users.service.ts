import { IStudent } from '@/interfaces/student.interface';
import { IUser } from '@/interfaces/user.interface';
import { AppError } from '@/utils/globalErrorHandler';
import { Class } from '@/models/class.model';
import { StudentModel } from '@/models/student.model';
import { UserModel } from '@/models/user.model';
import { FilterQuery } from 'mongoose';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class AdminUserStudentService {
  private users = UserModel;
  private students = StudentModel;
  private classes = Class;

  public async getUsers(query: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{
    users: any[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const findQuery: FilterQuery<IUser> = {};

    if (query.search) {
      findQuery.$or = [
        { username: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.role) {
      findQuery.role = query.role;
    }

    if (query.status) {
      findQuery.isActive = query.status === 'active';
    }

    const [users, total] = await Promise.all([
      this.users
        .find(findQuery)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.users.countDocuments(findQuery),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * @description Cập nhật trạng thái (kích hoạt/vô hiệu hóa) của một người dùng.
   * @route PATCH /api/admin/users/:userId/status
   */
  public async updateUserStatus(
    userId: string,
    isActive: boolean,
  ): Promise<IUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw createAppError(404, 'User not found');
    }

    user.isActive = isActive;
    await user.save();

    const { password, ...userToReturn } = user.toObject(); // Destructure to exclude password
    return userToReturn;
  }

  public async getStudents(query: {
    page?: string;
    limit?: string;
    search?: string;
    classId?: string;
  }): Promise<{
    students: any[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const findQuery: FilterQuery<IStudent> = {};

    if (query.search) {
      findQuery.fullName = { $regex: query.search, $options: 'i' };
    }

    if (query.classId) {
      findQuery.classId = query.classId;
    }

    const aggregationPipeline: any[] = [
      { $match: findQuery },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'parentId',
          foreignField: '_id',
          as: 'parentInfo',
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      {
        $unwind: { path: '$parentInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          dateOfBirth: 1,
          createdAt: 1,
          parent: {
            _id: '$parentInfo._id',
            username: '$parentInfo.username',
            email: '$parentInfo.email',
          },
          class: { _id: '$classInfo._id', className: '$classInfo.className' },
        },
      },
    ];

    const totalCountPipeline = [{ $match: findQuery }, { $count: 'total' }];

    const [students, totalResult] = await Promise.all([
      this.students.aggregate(aggregationPipeline),
      this.students.aggregate(totalCountPipeline),
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    return {
      students,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * @description Tạo mới một học sinh và cập nhật sĩ số lớp.
   * @route POST /api/admin/students
   */
  public async createStudent(studentData: {
    fullName: string;
    dateOfBirth: Date;
    parentId: string;
    classId: string;
  }): Promise<IStudent> {
    const parent = await this.users.findOne({
      _id: studentData.parentId,
      role: 'Parent',
    });

    if (!parent) {
      throw createAppError(
        404,
        'Parent account not found or user is not a parent',
      );
    }
    const targetClass = await this.classes.findById(studentData.classId);
    if (!targetClass) {
      throw createAppError(404, 'Class not found');
    }
    const newStudent = await this.students.create(studentData);
    targetClass.students.push(newStudent._id);
    targetClass.totalStudents = targetClass.students.length;
    await targetClass.save();

    return newStudent;
  }

  /**
   * @description Cập nhật thông tin học sinh, xử lý logic chuyển lớp.
   * @route PUT /api/admin/students/:studentId
   */
  public async updateStudent(
    studentId: string,
    studentData: {
      fullName?: string;
      dateOfBirth?: Date;
      parentId?: string;
      classId?: string;
    },
  ): Promise<IStudent> {
    const student = await this.students.findById(studentId);
    if (!student) {
      throw createAppError(404, 'Student not found');
    }

    const oldClassId = student.classId;

    Object.assign(student, studentData);
    if (
      studentData.classId &&
      studentData.classId.toString() !== oldClassId.toString()
    ) {
      const oldClass = await this.classes.findById(oldClassId);
      if (oldClass) {
        oldClass.students.pull(student._id);
        oldClass.totalStudents = oldClass.students.length;
        await oldClass.save();
      }

      // Update new class
      const newClass = await this.classes.findById(studentData.classId);
      if (!newClass) {
        throw createAppError(404, 'New class not found');
      }
      newClass.students.push(student._id);
      newClass.totalStudents = newClass.students.length;
      await newClass.save();
    }

    const updatedStudent = await student.save();
    return updatedStudent;
  }
}

export default AdminUserStudentService;

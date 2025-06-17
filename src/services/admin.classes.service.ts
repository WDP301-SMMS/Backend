import { IClass } from '@/interfaces/class.interface';
import { AppError } from '@/middlewares/globalErrorHandler';
import { Class } from '@/models/class.model';
import { StudentModel } from '@/models/student.model';
import mongoose, { FilterQuery } from 'mongoose';

const createAppError = (status: number, message: string): AppError => {
    const error: AppError = new Error(message);
    error.status = status;
    return error;
};

class AdminClassService {
    private classes = Class;
    private students = StudentModel;

    public async getClasses(query: {
        page?: string;
        limit?: string;
        search?: string;
        gradeLevel?: string;
        schoolYear?: string;
    }): Promise<{ classes: IClass[]; total: number; pages: number; currentPage: number }> {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const skip = (page - 1) * limit;

        const findQuery: FilterQuery<IClass> = {};

        if (query.search) {
            findQuery.className = { $regex: query.search, $options: 'i' };
        }
        if (query.gradeLevel) {
            findQuery.gradeLevel = parseInt(query.gradeLevel, 10);
        }
        if (query.schoolYear) {
            findQuery.schoolYear = query.schoolYear;
        }

        const [classes, total] = await Promise.all([
            this.classes
                .find(findQuery)
                .populate('students', 'fullName')
                .sort({ schoolYear: -1, gradeLevel: 1, className: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.classes.countDocuments(findQuery),
        ]);

        return {
            classes,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        };
    }

    public async createClass(classData: { className: string; gradeLevel: number; schoolYear: string }): Promise<IClass> {
        const { className, gradeLevel, schoolYear } = classData;

        const existingClass = await this.classes.findOne({ className, gradeLevel, schoolYear });
        if (existingClass) {
            throw createAppError(409, 'A class with this name, grade, and school year already exists.'); // 409 Conflict
        }

        const newClass = await this.classes.create({
            ...classData,
            students: [],
            totalStudents: 0,
        });

        return newClass;
    }


    public async addStudentsToClass(classId: string, studentIds: string[]): Promise<IClass> {
        if (!studentIds || studentIds.length === 0) {
            throw createAppError(400, 'Student IDs array cannot be empty.');
        }

        const targetClass = await this.classes.findById(classId);
        if (!targetClass) {
            throw createAppError(404, 'Target class not found.');
        }


        const studentsToAdd = await this.students.find({ _id: { $in: studentIds } });
        if (studentsToAdd.length !== studentIds.length) {
            throw createAppError(404, 'One or more students not found.');
        }

        const studentsAlreadyInAClass = studentsToAdd.filter(student => student.classId);
        if (studentsAlreadyInAClass.length > 0) {
            const studentNames = studentsAlreadyInAClass.map(s => s.fullName).join(', ');
            throw createAppError(409, `Cannot add students who are already in a class: ${studentNames}. Please move them individually.`);
        }

        const studentObjectIds = studentsToAdd.map(s => s._id);
        targetClass.students.addToSet(...studentObjectIds);
        targetClass.totalStudents = targetClass.students.length;
        await this.students.updateMany({ _id: { $in: studentObjectIds } }, { $set: { classId: targetClass._id } });
        await targetClass.save();

        return targetClass;
    }


    public async removeStudentsFromClass(classId: string, studentIds: string[]): Promise<IClass> {
        if (!studentIds || studentIds.length === 0) {
            throw createAppError(400, 'Student IDs array cannot be empty.');
        }
        const targetClass = await this.classes.findById(classId);
        if (!targetClass) {
            throw createAppError(404, 'Target class not found.');
        }

        const studentObjectIdsToRemove = studentIds.map(id => new mongoose.Types.ObjectId(id));
        const studentsActuallyInClass = targetClass.students.filter(studentIdInClass =>
            studentObjectIdsToRemove.some(idToRemove => idToRemove.equals(studentIdInClass)),
        );

        if (studentsActuallyInClass.length === 0) {
            throw createAppError(404, 'None of the provided students were found in this class.');
        }
        targetClass.students.pull(...studentsActuallyInClass);
        targetClass.totalStudents = targetClass.students.length;
        await Promise.all([
            targetClass.save(),
            this.students.updateMany({ _id: { $in: studentsActuallyInClass } }, { $set: { classId: null } }),
        ]);
        return targetClass;
    }
}

export default AdminClassService;
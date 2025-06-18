import AdminClassService from '@/services/admin.classes.service';
import { NextFunction, Request, Response } from 'express';

const adminClassService = new AdminClassService();

const getClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      gradeLevel?: string;
      schoolYear?: string;
    };
    const result = await adminClassService.getClasses(query);
    res.status(200).json({ data: result, message: 'Classes retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const classData = req.body; // Mong đợi { className, gradeLevel, schoolYear }

    if (!classData.className || !classData.gradeLevel || !classData.schoolYear) {
      res.status(400).json({ message: 'Missing required fields: className, gradeLevel, schoolYear' });
      return;
    }

    const newClass = await adminClassService.createClass(classData);
    res.status(201).json({ data: newClass, message: 'Class created successfully' });
  } catch (error) {
    next(error);
  }
};

const addStudentsToClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body; // Mong đợi { "studentIds": ["id1", "id2", ...] }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ message: 'studentIds must be a non-empty array' });
      return;
    }

    const updatedClass = await adminClassService.addStudentsToClass(classId, studentIds);
    res.status(200).json({ data: updatedClass, message: 'Students added to class successfully' });
  } catch (error) {
    next(error);
  }
};

const removeStudentsFromClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body; // Mong đợi { "studentIds": ["id1", "id2", ...] }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ message: 'studentIds must be a non-empty array' });
      return;
    }

    const updatedClass = await adminClassService.removeStudentsFromClass(classId, studentIds);
    res.status(200).json({ data: updatedClass, message: 'Students removed from class successfully' });
  } catch (error) {
    next(error);
  }
};


export const AdminClassController = {
  getClasses,
  createClass,
  addStudentsToClass,
  removeStudentsFromClass,
};
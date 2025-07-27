import { RoleEnum } from '@/enums/RoleEnum';
import AdminUserStudentService from '@/services/admin/admin.users.service';
import { NextFunction, Request, Response } from 'express';

class AdminUserStudentController {
  public adminUserStudentService = new AdminUserStudentService();

  public getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = req.query as {
        page?: string;
        limit?: string;
        search?: string;
        role?: string;
        status?: string;
      };

      const result = await this.adminUserStudentService.getUsers(query);
      res
        .status(200)
        .json({ data: result, message: 'Users retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body; // Mong đợi { "isActive": true } hoặc { "isActive": false }

      if (typeof isActive !== 'boolean') {
        res
          .status(400)
          .json({ message: 'Invalid input: isActive must be a boolean' });
        return;
      }

      const updatedUser = await this.adminUserStudentService.updateUserStatus(
        userId,
        isActive,
      );
      res.status(200).json({
        data: updatedUser,
        message: 'User status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const allowedRoles = [RoleEnum.Manager, RoleEnum.Nurse];
      if (!allowedRoles.includes(role)) {
        res.status(400).json({
          message: 'Invalid role. Only NURSE or MANAGER are allowed.',
        });
        return;
      }

      const updatedUser = await this.adminUserStudentService.updateUserRole(
        userId,
        role,
      );
      res
        .status(200)
        .json({ data: updatedUser, message: 'User role updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getStudents = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = req.query as {
        page?: string;
        limit?: string;
        search?: string;
        classId?: string;
      };

      const result = await this.adminUserStudentService.getStudents(query);
      res
        .status(200)
        .json({ data: result, message: 'Students retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  public createStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const studentData = req.body; // Mong đợi { fullName, dateOfBirth, classId }
      if (
        !studentData.fullName ||
        !studentData.dateOfBirth ||
        !studentData.classId
      ) {
        res.status(400).json({
          message: 'Missing required fields: fullName, dateOfBirth, classId',
        });
        return;
      }

      const newStudent =
        await this.adminUserStudentService.createStudent(studentData);
      res
        .status(201)
        .json({ data: newStudent, message: 'Student created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { studentId } = req.params;
      const studentData = req.body;

      if (Object.keys(studentData).length === 0) {
        res.status(400).json({ message: 'Request body cannot be empty' });
        return;
      }

      const updatedStudent = await this.adminUserStudentService.updateStudent(
        studentId,
        studentData,
      );
      res.status(200).json({
        data: updatedStudent,
        message: 'Student updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminUserStudentController;

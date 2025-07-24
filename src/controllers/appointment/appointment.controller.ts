import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppointmentService } from '@/services/appointment/appointment.service';
import { RoleEnum } from '@/enums/RoleEnum';
import { UserModel } from '@/models/user.model';

export class AppointmentController {
  // Get students with abnormal results (for nurses)
  static async getStudentsWithAbnormalResults(req: Request, res: Response) {
    const { campaignId } = req.params;
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const students = await AppointmentService.getStudentsWithAbnormalResults(
        userId,
        campaignId,
      );

      return res.status(200).json({
        success: true,
        message: 'Students with abnormal results retrieved successfully',
        data: students,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error.message || 'Failed to retrieve students with abnormal results',
      });
    }
  }

  // Create appointment (for nurses)
  static async createAppointment(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const appointmentData = {
        studentId: req.body.studentId,
        parentId: req.body.parentId,
        resultId: req.body.resultId,
        meetingTime: new Date(req.body.meetingTime),
        location: req.body.location,
        notes: req.body.notes,
      };

      const appointment =
        await AppointmentService.createAppointmentForAbnormalResult(
          userId,
          appointmentData,
        );

      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create appointment',
      });
    }
  }

  // Get appointments
  static async getAppointments(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get user role
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        status: req.query.status as any,
        studentId: req.query.studentId as string,
      };

      const result = await AppointmentService.getAppointments(
        userId,
        user.role,
        filters,
      );

      return res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: result.appointments,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve appointments',
      });
    }
  }

  // Respond to appointment (for parents)
  static async respondToAppointment(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const appointmentId = req.params.appointmentId;
      const response = {
        action: req.body.action,
        reason: req.body.reason,
      };

      const appointment = await AppointmentService.respondToAppointment(
        userId,
        appointmentId,
        response,
      );

      return res.status(200).json({
        success: true,
        message: `Appointment ${response.action}ed successfully`,
        data: appointment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to respond to appointment',
      });
    }
  }

  // Update appointment status (for nurses)
  static async updateAppointmentStatus(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const appointmentId = req.params.appointmentId;
      const updateData = {
        status: req.body.status,
        reason: req.body.reason,
      };

      const appointment = await AppointmentService.updateAppointmentStatus(
        userId,
        appointmentId,
        updateData,
      );

      return res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        data: appointment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update appointment status',
      });
    }
  }

  // Add after-meeting notes (for nurses)
  static async addAfterMeetingNotes(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const appointmentId = req.params.appointmentId;
      const notes = req.body.afterMeetingNotes;

      const appointment = await AppointmentService.addAfterMeetingNotes(
        userId,
        appointmentId,
        notes,
      );

      return res.status(200).json({
        success: true,
        message: 'After-meeting notes added successfully',
        data: appointment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to add after-meeting notes',
      });
    }
  }

  // Get appointment by ID (for nurses and parents)
  static async getAppointmentById(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const appointmentId = req.params.appointmentId;

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const appointment = await AppointmentService.getAppointmentById(
        userId,
        user.role,
        appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: 'Appointment retrieved successfully',
        data: appointment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve appointment',
      });
    }
  }
}

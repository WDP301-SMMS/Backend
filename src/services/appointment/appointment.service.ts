import { AppointmentStatus } from '@/enums/AppointmentEnums';
import { NotificationType } from '@/enums/NotificationEnums';
import { CampaignStatus } from '@/enums/CampaignEnum';
import { RoleEnum } from '@/enums/RoleEnum';
import { IMeetingSchedule } from '@/interfaces/meeting.schedule.interface';
import Appointment from '@/models/appointment.model';
import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import { HealthCheckResult } from '@/models/healthcheck.result.model';
import { StudentModel } from '@/models/student.model';
import { UserModel } from '@/models/user.model';
import { sendMeetingScheduleNotification } from '@/utils/notification.helper';

export interface CreateAppointmentRequest {
  studentId: string;
  parentId: string;
  resultId?: string;
  meetingTime: Date;
  location: string;
  notes?: string;
}

export interface RespondToAppointmentRequest {
  action: 'APPROVED' | 'CANCELLED';
  reason?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  reason?: string;
}

export class AppointmentService {
  // Check if student has abnormal health results and create appointment
  static async createAppointmentForAbnormalResult(
    nurseId: string,
    appointmentData: CreateAppointmentRequest,
  ): Promise<IMeetingSchedule> {
    // Verify nurse has permission
    const nurse = await UserModel.findById(nurseId);
    if (!nurse || nurse.role !== RoleEnum.Nurse) {
      throw new Error('Only nurses can create appointments');
    }

    // Verify student exists
    const student = await StudentModel.findById(appointmentData.studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Verify parent exists and is linked to student
    const parent = await UserModel.findById(appointmentData.parentId);
    if (!parent || parent.role !== RoleEnum.Parent) {
      throw new Error('Invalid parent');
    }

    if (student.parentId?.toString() !== appointmentData.parentId) {
      throw new Error('Parent is not linked to this student');
    }

    // Check if student has abnormal health results
    let hasAbnormalResults = false;
    if (appointmentData.resultId) {
      const healthResult = await HealthCheckResult.findById(
        appointmentData.resultId,
      );
      if (!healthResult) {
        throw new Error('Health check result not found');
      }

      if (healthResult.studentId.toString() !== appointmentData.studentId) {
        throw new Error('Health result does not belong to this student');
      }

      hasAbnormalResults = healthResult.isAbnormal;
    } else {
      // Check for any abnormal results for this student
      const abnormalResults = await HealthCheckResult.findOne({
        studentId: appointmentData.studentId,
        isAbnormal: true,
      });

      hasAbnormalResults = !!abnormalResults;
    }

    if (!hasAbnormalResults) {
      throw new Error(
        'Appointment can only be created for students with abnormal health results',
      );
    }

    // Check for existing pending appointments
    const existingAppointment = await Appointment.findOne({
      studentId: appointmentData.studentId,
      status: AppointmentStatus.SCHEDULED,
    });

    if (existingAppointment) {
      throw new Error('Student already has a pending appointment');
    }

    // Create appointment
    const appointment = new Appointment({
      studentId: appointmentData.studentId,
      parentId: appointmentData.parentId,
      resultId: appointmentData.resultId,
      meetingTime: appointmentData.meetingTime,
      location: appointmentData.location,
      status: AppointmentStatus.SCHEDULED,
      notes: appointmentData.notes || '',
      afterMeetingNotes: '',
    });

    await appointment.save();

    if (appointment) {
      sendMeetingScheduleNotification(
        appointment,
        NotificationType.MEETING_SCHEDULE_NEW,
      );
    }
    return appointment.toObject();
  }

  // Handle parent response to appointment (accept/decline)
  static async respondToAppointment(
    parentId: string,
    appointmentId: string,
    response: RespondToAppointmentRequest,
  ): Promise<IMeetingSchedule> {
    // Verify parent exists
    const parent = await UserModel.findById(parentId);
    if (!parent || parent.role !== RoleEnum.Parent) {
      throw new Error('Only parents can respond to appointments');
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Verify parent owns this appointment
    if (appointment.parentId.toString() !== parentId) {
      throw new Error('You can only respond to your own appointments');
    }

    // Check if appointment is in a valid state to respond
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new Error('Can only respond to scheduled appointments');
    }

    // Check if appointment time hasn't passed
    if (new Date(appointment.meetingTime) <= new Date()) {
      throw new Error('Cannot respond to past appointments');
    }

    // Update appointment based on response
    if (response.action === 'APPROVED') {
      // Keep status as SCHEDULED when accepted
      appointment.notes = appointment.notes;
    } else if (response.action === 'CANCELLED') {
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.notes = appointment.notes;
    }

    await appointment.save();
    return appointment.toObject();
  }

  // Get appointments for a user (nurse/parent)
  static async getAppointments(
    userId: string,
    userRole: RoleEnum,
    filters: {
      page?: number;
      limit?: number;
      status?: AppointmentStatus;
      studentId?: string;
    } = {},
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const skip = (page - 1) * limit;

    let query: any = {};

    // Apply role-based filters
    if (userRole === RoleEnum.Parent) {
      query.parentId = userId;
    } else if (userRole === RoleEnum.Nurse) {
      // Nurses can see all appointments
    } else {
      throw new Error('Unauthorized to view appointments');
    }

    // Apply additional filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.studentId) {
      query.studentId = filters.studentId;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('studentId', 'fullName dateOfBirth gender')
        .populate('parentId', 'username email phone')
        .populate('resultId', 'checkupDate isAbnormal overallConclusion')
        .sort({ meetingTime: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update appointment status (for nurses)
  static async updateAppointmentStatus(
    nurseId: string,
    appointmentId: string,
    updateData: UpdateAppointmentStatusRequest,
  ): Promise<IMeetingSchedule> {
    // Verify nurse exists
    const nurse = await UserModel.findById(nurseId);
    if (!nurse || nurse.role !== RoleEnum.Nurse) {
      throw new Error('Only nurses can update appointment status');
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Update status
    appointment.status = updateData.status;

    if (updateData.reason) {
      appointment.notes = appointment.notes;
    }

    await appointment.save();
    return appointment.toObject();
  }

  // Add after-meeting notes (for nurses)
  static async addAfterMeetingNotes(
    nurseId: string,
    appointmentId: string,
    notes: string,
  ): Promise<IMeetingSchedule> {
    // Verify nurse exists
    const nurse = await UserModel.findById(nurseId);
    if (!nurse || nurse.role !== RoleEnum.Nurse) {
      throw new Error('Only nurses can add after-meeting notes');
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Check if appointment is completed or can have notes added
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new Error('Cannot add notes to cancelled appointments');
    }

    // Add notes and mark as completed if scheduled
    appointment.afterMeetingNotes = notes;
    if (appointment.status === AppointmentStatus.SCHEDULED) {
      appointment.status = AppointmentStatus.COMPLETED;
    }

    await appointment.save();
    return appointment.toObject();
  }

  // Get students with abnormal results (for nurses to create appointments)
  static async getStudentsWithAbnormalResults(
    nurseId: string,
    campaignId: string,
  ): Promise<any[]> {
    // Verify nurse exists
    const nurse = await UserModel.findById(nurseId);
    if (!nurse || nurse.role !== RoleEnum.Nurse) {
      throw new Error('Only nurses can view students with abnormal results');
    }

    const campaign = await HealthCheckCampaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Health check campaign not found');
    } else if (campaign.status !== CampaignStatus.COMPLETED) {
      throw new Error(
        'Health check campaign is not completed, so no results available',
      );
    }

    // Find students with abnormal health results who don't have pending or completed appointments
    const studentsWithAbnormalResults = await HealthCheckResult.aggregate([
      {
        $match: {
          isAbnormal: true,
          campaignId: campaign._id,
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'student.parentId',
          foreignField: '_id',
          as: 'parent',
        },
      },
      {
        $unwind: { path: '$parent', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'appointments',
          let: { studentId: '$studentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    {
                      $or: [
                        { $eq: ['$status', AppointmentStatus.SCHEDULED] },
                        { $eq: ['$status', AppointmentStatus.COMPLETED] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'existingAppointments',
        },
      },
      {
        $match: {
          existingAppointments: { $size: 0 }, // No pending or completed appointments
          parent: { $exists: true }, // Has a parent linked
        },
      },
      {
        $group: {
          _id: '$studentId',
          student: { $first: '$student' },
          parent: { $first: '$parent' },
          latestResult: { $first: '$$ROOT' },
          abnormalResultsCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          studentId: '$_id',
          studentName: '$student.fullName',
          studentGender: '$student.gender',
          studentDateOfBirth: '$student.dateOfBirth',
          parentId: '$parent._id',
          parentName: '$parent.fullName',
          parentEmail: '$parent.email',
          parentPhone: '$parent.phone',
          latestCheckupDate: '$latestResult.checkupDate',
          latestResultId: '$latestResult._id',
          abnormalResultsCount: 1,
        },
      },
      {
        $sort: { latestCheckupDate: -1 },
      },
    ]);

    return studentsWithAbnormalResults;
  }

  // Get single appointment by ID
  static async getAppointmentById(
    userId: string,
    role: RoleEnum,
    appointmentId: string,
  ): Promise<IMeetingSchedule> {
    const appointment = await Appointment.findById(appointmentId)
      .populate('studentId', 'fullName dateOfBirth gender')
      .populate('parentId', 'username email phone fullName')
      .populate('resultId', 'checkupDate isAbnormal overallConclusion')
      .lean();

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Authorization: ensure user is allowed to see this appointment
    if (
      role === RoleEnum.Parent &&
      appointment.parentId?._id?.toString() !== userId
    ) {
      throw new Error('Access denied: This appointment does not belong to you');
    }

    // Nurses can see all, no restriction needed

    return appointment;
  }
}

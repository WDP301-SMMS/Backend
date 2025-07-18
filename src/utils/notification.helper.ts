import { StudentModel } from '@/models/student.model';

import { addNotificationJob } from '@/queues/notification.queue';

import { Class } from '@/models/class.model';
import { NotificationType } from '@/enums/NotificationEnums';

export const sendAnnounceNotification = async (campaign: any): Promise<void> => {
  try {
    console.log(`[Notification Helper] Starting to find parents for campaign: ${campaign.name}`);

    const targetClasses = await Class.find({
      gradeLevel: { $in: campaign.targetGradeLevels }
    }).select('_id');

    if (targetClasses.length === 0) {
      console.log(`[Notification Helper] No classes found for target grade levels.`);
      return;
    }
    const classIds = targetClasses.map(c => c._id);

    const studentsInCampaign = await StudentModel.find({
      classId: { $in: classIds },
      status: 'ACTIVE',
      parentId: { $exists: true, $ne: null }
    }).select('parentId').lean();

    if (studentsInCampaign.length === 0) {
      console.log(`[Notification Helper] No students found in target classes.`);
      return;
    }

    const parentIds = [...new Set(studentsInCampaign.map(s => s.parentId!.toString()))];

    console.log(`[Notification Helper] Found ${parentIds.length} unique parents to notify.`);

    await addNotificationJob({
      recipientIds: parentIds,
      type: NotificationType.VACCINE_CAMPAIGN_NEW,
      entityId: campaign._id.toString(),
      entityModel: 'VaccinationCampaign'
    });

    console.log(`[Notification Helper] Job added for campaign ${campaign._id}.`);

  } catch (error) {
    console.error(`[Notification Helper] Failed to send notification for campaign ${campaign._id}:`, error);
  }
}

export const sendHealthCheckAnnounceNotification = async (campaign: any): Promise<void> => {
  try {
    console.log(`[Notification Helper] Starting to find parents for HEALTH CHECK campaign: ${campaign.name}`);

    // Logic cho Health Check: Lấy classId từ mảng `assignments`
    if (!campaign.assignments || campaign.assignments.length === 0) {
        console.log(`[Notification Helper] No classes assigned to this health check campaign.`);
        return;
    }
    const classIds = campaign.assignments.map((a: any) => a.classId.toString());

    // Tìm học sinh trong các lớp này
    const studentsInCampaign = await StudentModel.find({
        classId: { $in: classIds },
        status: 'ACTIVE',
        parentId: { $exists: true, $ne: null }
      }).select('parentId').lean();

    if (studentsInCampaign.length === 0) {
        console.log(`[Notification Helper] No students found in assigned classes.`);
        return;
    }

    const parentIds = [...new Set(studentsInCampaign.map(s => s.parentId!.toString()))];

    console.log(`[Notification Helper] Found ${parentIds.length} unique parents to notify.`);

    await addNotificationJob({
        recipientIds: parentIds,
        type: NotificationType.HEALTH_CHECK_CAMPAIGN_NEW,
        entityId: campaign._id.toString(),
        entityModel: 'HealthCheckCampaign'
    });

    console.log(`[Notification Helper] Job added for HEALTH CHECK campaign ${campaign._id}.`);

  } catch (error) {
    console.error(`[Notification Helper] Failed to send notification for HEALTH CHECK campaign ${campaign._id}:`, error);
  }
}

export const sendIncidentNotificationToParent = async (incident: any): Promise<void> => {
  try {
    // Kiểm tra xem sự cố có studentId không
    if (!incident.studentId) {
      console.warn(`[Notification Helper] Incident ${incident._id} has no studentId. Cannot notify parent.`);
      return;
    }
    
    console.log(`[Notification Helper] Preparing to notify parent about incident: ${incident._id}`);
    const student = await StudentModel.findById(incident.studentId).select('parentId').lean();

    // Kiểm tra xem học sinh có phụ huynh không
    if (!student || !student.parentId) {
      console.warn(`[Notification Helper] Student ${incident.studentId} not found or has no parent. Cannot send notification.`);
      return;
    }

    const parentId = student.parentId.toString();
    console.log(`[Notification Helper] Found parent ${parentId} to notify for incident ${incident._id}.`);

    // Gửi job vào queue cho một người nhận duy nhất
    await addNotificationJob({
      recipientIds: [parentId],
      type: NotificationType.MEDICAL_INCIDENT_PARENT_ALERT, 
      entityId: incident._id.toString(),
      entityModel: 'MedicalIncident'
    });

    console.log(`[Notification Helper] Job added for new incident ${incident._id}.`);

  } catch (error) {
    console.error(`[Notification Helper] Failed to send notification for new incident ${incident._id}:`, error);
  }
}
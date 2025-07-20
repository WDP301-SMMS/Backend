export enum NotificationType {
  // === Dành cho Phụ huynh (Parent) ===
  HEALTH_CHECK_CAMPAIGN_NEW = 'HEALTH_CHECK_CAMPAIGN_NEW', // Có chiến dịch KSK mới
  HEALTH_CHECK_RESULT_READY = 'HEALTH_CHECK_RESULT_READY', // Kết quả KSK đã có
  VACCINE_CAMPAIGN_NEW = 'VACCINE_CAMPAIGN_NEW',           // Có chiến dịch tiêm chủng mới
  MEDICATION_REQUEST_SCHEDULED = 'MEDICATION_REQUEST_SCHEDULED', // Yêu cầu cấp thuốc đã được lên lịch
  MEDICATION_REQUEST_COMPLETED = 'MEDICATION_REQUEST_COMPLETED', // Hoàn thành một đợt cấp thuốc
  MEDICATION_REQUEST_REJECTED = 'MEDICATION_REQUEST_REJECTED', // Yêu cầu cấp thuốc bị từ chối
  MEETING_SCHEDULE_NEW = 'MEETING_SCHEDULE_NEW',           // Có lịch hẹn mới với y tá
  MEETING_SCHEDULE_UPDATED = 'MEETING_SCHEDULE_UPDATED',     // Lịch hẹn được cập nhật
  MEETING_SCHEDULE_CANCELED = 'MEETING_SCHEDULE_CANCELED',   // Lịch hẹn bị hủy
  MEDICAL_INCIDENT_PARENT_ALERT = 'MEDICAL_INCIDENT_PARENT_ALERT', // Thông báo sự cố y tế đến phụ huynh

  // === Dành cho Y tá (Nurse) / Quản lý (Manager) ===
  PARENT_SUBMITTED_CONSENT = 'PARENT_SUBMITTED_CONSENT', // Phụ huynh đã đồng ý/từ chối
  NEW_MEDICATION_REQUEST_RECEIVED = 'NEW_MEDICATION_REQUEST_RECEIVED', // Nhận được yêu cầu cấp thuốc mới
  MEDICAL_INCIDENT_NEW = 'MEDICAL_INCIDENT_NEW',       // Ghi nhận một sự cố y tế mới (thông báo cho Manager)
  INVENTORY_ITEM_LOW_STOCK = 'INVENTORY_ITEM_LOW_STOCK', // Cảnh báo tồn kho thấp

  // === Dành cho Chat ===
  CHAT_MESSAGE_NEW = 'CHAT_MESSAGE_NEW',                   // Có tin nhắn mới trong một cuộc trò chuyện
}
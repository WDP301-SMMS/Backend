export enum ConsentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE', // Quá hạn
  NO_RESPONSE = 'NO_RESPONSE', // Không phản hồi
  REVOKED = 'REVOKED', //Đã thu hồi
  UNDER_OBSERVATION = 'UNDER_OPSERVATION', //Đang theo dõi
  ADVERSE_REACTION = 'ADVERSE_REACTION', //Phản ứng phụ
}

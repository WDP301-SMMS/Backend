import { ConsentStatus } from '@/enums/ConsentsEnum';

const createHealthCheckConsent = () => {};
const updateHealthCheckConsent = () => {};
const deleteHealthCheckConsent = () => {};
const getHealthCheckConsent = () => {};
const getAllHealthCheckConsents = () => {};

const allowedTransitions: Record<ConsentStatus, ConsentStatus[]> = {
  [ConsentStatus.PENDING]: [ConsentStatus.APPROVED, ConsentStatus.DECLINED],
  [ConsentStatus.APPROVED]: [ConsentStatus.REVOKED, ConsentStatus.COMPLETED],
  [ConsentStatus.COMPLETED]: [],
  [ConsentStatus.DECLINED]: [],
  [ConsentStatus.REVOKED]: [],
  [ConsentStatus.UNDER_OBSERVATION]: [],
  [ConsentStatus.ADVERSE_REACTION]: [],
};

export default {
  createHealthCheckConsent,
  updateHealthCheckConsent,
  deleteHealthCheckConsent,
  getHealthCheckConsent,
  getAllHealthCheckConsents,
};

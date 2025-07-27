import express from 'express';
import consentController from '@/controllers/health-check/health-check-consents.controller';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Get all health check consents
router.get('/', asyncHandler(consentController.getAllConsents));

// Get detail health check consents
router.get('/:consentId', asyncHandler(consentController.getConsentDetailById));

// Get health check consents by nurse ID
router.get(
  '/nurse/:campaignId',
  asyncHandler(consentController.getHealthCheckConsentsByNurseId),
);

// Get health check consents by campaign ID
router.get(
  '/campaign/:campaignId',
  asyncHandler(consentController.getHealthCheckConsentsByCampaignId),
);

// Add all students to consent by campaign ID
router.post(
  '/campaign/add-students',
  asyncHandler(consentController.addAllStudentToConsentByCampaignId),
);

// Handle consent status (approve/decline)
router.patch(
  '/:consentId/status',
  asyncHandler(consentController.handleStatusConsent),
);

export default router;

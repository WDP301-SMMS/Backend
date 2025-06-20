import { VaccinationCampaignController } from '@/controllers/vaccine/vaccination.campaigns.controller';
import { VaccinationConsentController } from '@/controllers/vaccine/vaccination.consents.controller';
import { createCampaignValidator, updateCampaignValidator } from '@/validators/vaccine/vaccination.validator';
const express = require('express');


const router = express.Router();
const CampaignController = new VaccinationCampaignController();
const ConsentController = new VaccinationConsentController();

// Vaccination Campaign Routes
router.get(
    '/',
    CampaignController.getAllCampaigns
);


router.post(
    '/',
    createCampaignValidator,
    CampaignController.createCampaign
);


router.get(
    '/:campaignId',
    CampaignController.getCampaignById
);

router.patch(
    '/:campaignId',
    updateCampaignValidator,
    CampaignController.updateCampaign
);

router.post(
    '/:campaignId/dispatch',
    CampaignController.dispatchCampaign
);

// Lấy báo cáo summary của một campaign
// router.get(
//     '/:campaignId/summary',
//     authMiddleware,
//     roleMiddleware(allowedRoles),
//     controller.getCampaignSummary // Bạn sẽ cần tạo hàm này trong controller và service
// );


// VACCINATION CONSENT ROUTES(Parents)
router.get(
    '/consents/my-requests',
    // authMiddleware,
    // roleMiddleware([RoleEnum.Parent]),
    ConsentController.getMyConsents
);

router.put(
    '/consents/:consentId/respond',
    // authMiddleware,
    // roleMiddleware([RoleEnum.Parent]),
    // respondToConsentValidator, // <-- Bạn sẽ cần tạo validator cho request body này
    ConsentController.respondToConsent
);

export default router;
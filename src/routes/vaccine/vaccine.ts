import { VaccinationCampaignController } from '@/controllers/vaccine/vaccination.campaigns.controller';
const express = require('express');


const router = express.Router();
const CampaignController = new VaccinationCampaignController();

// Vaccination Campaign Routes
router.get(
    '/',
    CampaignController.getAllCampaigns
);


router.post(
    '/',
    CampaignController.createCampaign
);


router.get(
    '/:campaignId',
    CampaignController.getCampaignById
);

router.patch(
    '/:campaignId',
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

export default router;
import { VaccinationCampaignController } from '@/controllers/vaccine/vaccination.campaigns.controller';
import { VaccinationConsentController } from '@/controllers/vaccine/vaccination.consents.controller';
import { VaccinationRecordController } from '@/controllers/vaccine/vaccination.records.controller';
import { addObservationValidator, createCampaignValidator, createRecordValidator, respondToConsentValidator, updateCampaignValidator } from '@/validators/vaccine/vaccination.validator';
const express = require('express');


const router = express.Router();
const CampaignController = new VaccinationCampaignController();
const ConsentController = new VaccinationConsentController();
const RecordController = new VaccinationRecordController();

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

    // roleMiddleware([RoleEnum.Parent]),
    ConsentController.getMyConsents
);

router.patch(
     '/consent/:campaignId/students/:studentId/respond',
    // roleMiddleware([RoleEnum.Parent]),
    respondToConsentValidator, 
    ConsentController.respondByStudentAndCampaign
);


// VACCINATION RECORD ROUTES (Admin/Nurse)
router.get(
    '/campaigns/:campaignId/registrants',
    // roleMiddleware([RoleEnum.Admin, RoleEnum.Nurse]),
    RecordController.getRegistrants
);

// Ghi nhận một lượt tiêm chủng cho học sinh
router.post(
    '/records',
    // roleMiddleware([RoleEnum.Admin, RoleEnum.Nurse]),
    createRecordValidator, 
    RecordController.createVaccinationRecord
);

router.post(
    '/records/:recordId/observations',
    // roleMiddleware([RoleEnum.Admin, RoleEnum.Nurse]),
    addObservationValidator, 
    RecordController.addObservation
);
export default router;
import { HealthProfileController } from "@/controllers/health-profile/health.profile.controller";
import { createProfileValidator, updateProfileValidator } from "@/validators/health-profile/health.profile.validator";
const express = require('express');
const router = express.Router();


const ProfileController = new HealthProfileController();


router.post(
    '/',
    createProfileValidator,
    ProfileController.createProfile
);


router.get(
    '/student/:studentId',
    ProfileController.getProfileByStudentId
);


router.patch(
    '/:profileId',

    updateProfileValidator,
    ProfileController.updateProfile
);


router.delete(
    '/:profileId',
    ProfileController.deleteProfile
);

export default router;
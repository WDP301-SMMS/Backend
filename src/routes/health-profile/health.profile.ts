
import { HealthProfileController } from '@/controllers/health-profile/health.profile.controller';
import { createProfileValidator, updateProfileValidator } from '@/validators/health-profile/health.profile.validator';
import { RoleEnum } from '@/enums/RoleEnum';
import { roleBaseAccess } from '@/middlewares/security/authorization';

const express = require('express');
const router = express.Router();

const healthProfile = new HealthProfileController();


router.post(
    '/students/claim',
    healthProfile.claimStudent
);


router.get(
    '/students/my-students',
    roleBaseAccess([RoleEnum.Parent, RoleEnum.Manager]),
    healthProfile.getMyStudents
);


router.post(
    '/',
    createProfileValidator,
    healthProfile.createProfile
);


router.get(
    '/student/:studentId',

    healthProfile.getProfileByStudentId
);


router.patch(
    '/:profileId',
    updateProfileValidator,
    healthProfile.updateProfile
);


router.delete(
    '/:profileId',
    healthProfile.deleteProfile
);

export default router;
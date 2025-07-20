
import { UserController } from '@/controllers/notifications/user.notifination.controller';
import { Router } from 'express';


const router = Router();
const controller = new UserController();

router.post(
  '/push-tokens/register',
  controller.registerPushToken
);

router.post(
  '/push-tokens/unregister',

  controller.unregisterPushToken
);



export default router;
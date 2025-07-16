import { NotificationController } from '@/controllers/notifications/notification.controller';
import { validateMarkAsRead } from '@/validators/notifications/notifications.validator';
import { Router } from 'express';


const router = Router();
const controller = new NotificationController();


router.get('/', controller.getNotifications);

router.get('/unread-count', controller.getUnreadCount);

router.patch(
  '/:notificationId/read',
  validateMarkAsRead,
  controller.markAsRead,
);


router.patch('/read-all', controller.markAllAsRead);

export default router;
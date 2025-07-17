import { getAllMessagesByRoomId } from '@/controllers/message/message.controller';
import { validateRoomId } from '@/validators/message/message.validator';
import { Router } from 'express';

const router = Router();

/**
 * @route GET /api/messages/:roomId
 * @desc Get all messages by room ID
 * @access Private (authenticated users)
 */
router.get('/:roomId', validateRoomId, getAllMessagesByRoomId);

export default router;

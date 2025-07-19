import { getAllMessagesByRoomId, getRoomsByUserId } from '@/controllers/message/message.controller';
import { validateRoomId, validateUserId } from '@/validators/message/message.validator';
import { Router } from 'express';

const router = Router();

/**
 * @route GET /api/messages/:roomId
 * @desc Get all messages by room ID
 * @access Private (authenticated users)
 */
router.get('/:roomId', validateRoomId, getAllMessagesByRoomId);

/**
 * @route GET /api/messages/user/:userId
 * @desc Get all rooms by user ID
 * @access Private (authenticated users)
 */
router.get('/user/:userId', validateUserId, getRoomsByUserId);

export default router;

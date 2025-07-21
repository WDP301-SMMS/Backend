import { getAllMessagesByRoomId, getRoomsByUserId, createOrFindDirectRoom, getAvailableUsersForChat } from '@/controllers/message/message.controller';
import { validateRoomId, validateUserId, validateCreateRoom } from '@/validators/message/message.validator';
import { Router } from 'express';

const router = Router();

/**
 * @route GET /api/messages/available-users
 * @desc Get users available for new chat (users without existing rooms with current user)
 * @access Private (authenticated users)
 */
router.get('/available-users', getAvailableUsersForChat);

/**
 * @route POST /api/messages/room/create
 * @desc Create or find a direct room between two users
 * @access Private (authenticated users)
 */
router.post('/room/create', validateCreateRoom, createOrFindDirectRoom);

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

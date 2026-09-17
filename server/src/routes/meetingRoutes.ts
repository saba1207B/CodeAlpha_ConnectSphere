import { Router } from 'express';
import { createMeeting, getMeeting, getUserMeetings } from '../controllers/meetingController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, createMeeting);
router.get('/user', authMiddleware, getUserMeetings);
router.get('/:meetingId', optionalAuthMiddleware, getMeeting);

export default router;

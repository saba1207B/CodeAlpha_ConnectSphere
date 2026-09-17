import { Router } from 'express';
import { uploadFile, getMeetingFiles, deleteFile } from '../controllers/fileController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/upload', optionalAuthMiddleware, upload.single('file'), uploadFile);
router.get('/:meetingId', getMeetingFiles);
router.delete('/:fileId', optionalAuthMiddleware, deleteFile);

export default router;

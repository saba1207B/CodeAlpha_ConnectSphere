import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const { meetingId, uploaderId, uploaderName } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No valid file uploaded' });
    }

    if (!meetingId) {
      return res.status(400).json({ message: 'Meeting ID is required' });
    }

    const userId = req.user?.id || uploaderId || 'guest';
    const userName = req.user?.name || uploaderName || 'Guest Contributor';

    // Store in database
    let savedFile = null;
    try {
      savedFile = await prisma.sharedFile.create({
        data: {
          meetingId,
          uploaderId: userId,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          storagePath: file.filename
        }
      });
    } catch (e) {
      // If ad-hoc meeting not in DB yet, construct file object
      savedFile = {
        id: 'file-' + Date.now(),
        meetingId,
        uploaderId: userId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storagePath: file.filename,
        createdAt: new Date()
      };
    }

    return res.status(201).json({
      file: {
        id: savedFile.id,
        meetingId: savedFile.meetingId,
        uploaderId: savedFile.uploaderId,
        uploaderName: userName,
        fileName: savedFile.fileName,
        fileSize: savedFile.fileSize,
        mimeType: savedFile.mimeType,
        fileUrl: `/uploads/${file.filename}`,
        createdAt: savedFile.createdAt
      }
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ message: err.message || 'Error uploading file' });
  }
};

export const getMeetingFiles = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;

    const files = await prisma.sharedFile.findMany({
      where: { meetingId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: { id: true, name: true }
        }
      }
    });

    const formatted = files.map((f) => ({
      id: f.id,
      meetingId: f.meetingId,
      uploaderId: f.uploaderId,
      uploaderName: f.uploader?.name || 'Contributor',
      fileName: f.fileName,
      fileSize: f.fileSize,
      mimeType: f.mimeType,
      fileUrl: `/uploads/${f.storagePath}`,
      createdAt: f.createdAt.toISOString()
    }));

    return res.json({ files: formatted });
  } catch (err: any) {
    // Return empty list on ad-hoc rooms
    return res.json({ files: [] });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const file = await prisma.sharedFile.findUnique({
      where: { id: fileId }
    });

    if (file) {
      // Remove from filesystem if exists
      const filePath = path.resolve(process.cwd(), 'uploads', file.storagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await prisma.sharedFile.delete({
        where: { id: fileId }
      });
    }

    return res.json({ message: 'File deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error deleting file' });
  }
};

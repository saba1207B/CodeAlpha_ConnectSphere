import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'connectsphere_dev_jwt_secret_forest_editorial_2026',
  cookieSecret: process.env.COOKIE_SECRET || 'connectsphere_dev_cookie_secret_2026',
  uploadDir: path.resolve(__dirname, '../uploads'),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
};

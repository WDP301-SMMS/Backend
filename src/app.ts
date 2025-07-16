import express from 'express';
import { errorHandler } from './utils/globalErrorHandler';
import connectDB from './config/database';
import 'dotenv/config';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  /^https:\/\/.*\.ngrok-free\.app$/,
  /^https:\/\/.*\.onrender\.com$/, // For deployed apps on Render
  process.env.FRONTEND_URL,
  process.env.BASE_URL, // Add your deployed backend URL for Swagger UI
  ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed origins
      const isAllowed = allowedOrigins.some(
        (o) => o && (typeof o === 'string' ? o === origin : o.test?.(origin)),
      );

      // For Swagger UI testing - allow if it's the same domain as the API
      const isSameDomain =
        origin.includes('backend-test-103x.onrender.com') ||
        origin.includes('localhost:3000');

      if (isAllowed || isSameDomain) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        console.log('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);
connectDB();

const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;

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
  '0.0.0.0',
  'http://localhost:3000',
  /^https:\/\/.*\.ngrok-free\.app$/,
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.BASE_URL,
  'https://backend-test-103x.onrender.com', // Your deployed server URL
  /^https:\/\/.*\.onrender\.com$/, // Allow any onrender.com subdomain
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin is in the allowed list
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`CORS Error: Origin ${origin} not allowed`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
connectDB();

const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Add a simple health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header',
    host: req.headers.host,
    userAgent: req.headers['user-agent'],
  });
});

app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;

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
  /^https:\/\/.*\.ngrok-free\.app$/,
  'http://localhost:5173',
  process.env.FRONTEND_URL || '*',
  process.env.BASE_URL || '*',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.some((o) =>
          typeof o === 'string' ? o === origin : o.test(origin),
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
connectDB();

const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;

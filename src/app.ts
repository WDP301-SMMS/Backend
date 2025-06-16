import express from 'express';
import { errorHandler } from './middlewares/globalErrorHandler';
import connectDB from './config/database';
import 'dotenv/config';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import dashboardRoute from '@routes/dashboard/dashboard';


const app = express();
app.use(express.json());
app.use(cors());
connectDB();

const swaggerDocument = YAML.load('swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

app.use('/api/admin', dashboardRoute);

export default app;

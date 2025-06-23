import express from 'express';
import templateRouter from './template';

const healthCheckRouter = express.Router();

healthCheckRouter.use('/templates', templateRouter);



export default healthCheckRouter;
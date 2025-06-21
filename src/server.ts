import 'module-alias/register';
import app from './app';
import config from '@config/config';

app.listen(config.port, () => {
  console.log('Server is running on port', config.port);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Swagger UI URL: http://localhost:${config.port}/api-docs`);
});

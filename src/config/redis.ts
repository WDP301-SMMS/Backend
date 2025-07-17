// import IORedis from 'ioredis';

// const redisConnection = new IORedis({
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
//   maxRetriesPerRequest: null
// });

// export default redisConnection;

import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("FATAL ERROR: REDIS_URL is not defined.");
  process.exit(1);
}

const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null
});

redisConnection.on('connect', () => {
  console.log('Successfully connected to Redis (Upstash)!');
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redisConnection;
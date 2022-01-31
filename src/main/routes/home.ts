import * as express from 'express';
// import RedisClient from '@node-redis/client/dist/lib/client';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('home');
});

export default router;

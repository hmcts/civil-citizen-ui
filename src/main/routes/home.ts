import * as express from 'express';
// import RedisClient from '@node-redis/client/dist/lib/client';

const router = express.Router();

router.get('/', (req, res) => {
  const draftStorageClient = req.app.locals.draftStorageClient;

  // (async() => {
  //   await draftStorageClient.set('testKey', 'testValue');
  // })();

  (async() => {
    console.info(await draftStorageClient.get('testKey'));
  })();

  res.render('home');
});

export default router;

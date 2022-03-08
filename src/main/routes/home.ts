import * as express from 'express';

const router = express.Router();

router.get('/home', (req, res) => {
  res.render('home');
});

export default router;

import * as express from 'express';

const router = express.Router();

router.get('/features/defendant/citizen-phone', (req, res) => {
  res.render('features/defendant/citizen-phone');
});

export default router;

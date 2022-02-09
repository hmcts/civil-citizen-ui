import {Router} from 'express';

const router = Router();

router.get('/unauthorised', (req, res) => {
  res.render('unauthorised');
});

export default router;

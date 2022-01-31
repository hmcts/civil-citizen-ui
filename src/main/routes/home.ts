import * as express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  //res.render('home');
  res.redirect('http://localhost:3333');
  //res.redirect(AppPaths.receiver.uri);
});

export default router;

import {Router} from 'express';

const homeController = Router();

homeController.get('/home', (_req, res) => {
  res.render('home');
});

export default homeController;

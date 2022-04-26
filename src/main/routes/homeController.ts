import * as express from 'express';

const homeController = express.Router();

homeController.get('/home', (_req, res) => {
  res.render('home');
});

export default homeController;

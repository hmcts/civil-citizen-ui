import {Router} from 'express';

const unauthorisedController = Router();

unauthorisedController.get('/unauthorised', (_req, res) => {
  res.render('unauthorised');
});

export default unauthorisedController;

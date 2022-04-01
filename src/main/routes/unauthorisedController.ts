import {Router} from 'express';

const unauthorisedController = Router();

unauthorisedController.get('/unauthorised', (req, res) => {
  res.render('unauthorised');
});

export default unauthorisedController;

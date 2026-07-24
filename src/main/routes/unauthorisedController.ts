import {Router} from 'express';

const unauthorisedController = Router();

unauthorisedController.get('/unauthorised', (_req, res) => {
  res.render('unauthorised', {htmlLang: 'en'});
});

export default unauthorisedController;

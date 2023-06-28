import {Router} from 'express';
import {TERMS_AND_CONDITIONS_URL} from './urls';

const termsAndConditionsController = Router();

termsAndConditionsController.get(TERMS_AND_CONDITIONS_URL, (_req, res) => {
  res.render('terms-and-conditions');
});

export default termsAndConditionsController;

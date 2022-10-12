import {Router} from 'express';
import {AGE_ELIGIBILITY_URL} from '../../../../routes/urls';

const ageEligibilityController = Router();

ageEligibilityController.get(AGE_ELIGIBILITY_URL, (_req, res) => {
  res.render('features/response/ageEligibility/under-18');
});

export default ageEligibilityController;

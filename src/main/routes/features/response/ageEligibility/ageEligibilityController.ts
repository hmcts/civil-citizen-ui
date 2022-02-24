import * as express from 'express';
import {AGE_ELIGIBILITY_URL} from '../../../../routes/urls';

const router = express.Router();

router.get(AGE_ELIGIBILITY_URL, (req, res) => {
  res.render('features/response/ageEligibility/under-18');
});

export default router;

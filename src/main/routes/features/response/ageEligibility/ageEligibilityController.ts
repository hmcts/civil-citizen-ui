import * as express from 'express';
import {AGE_ELIGIBILITY} from '../../../../routes/urls';

const router = express.Router();

router.get(AGE_ELIGIBILITY, (req, res) => {
  res.render('features/response/ageEligibility/under-18');
});

export default router;

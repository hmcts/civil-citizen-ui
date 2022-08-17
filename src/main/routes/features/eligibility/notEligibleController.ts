import * as express from 'express';
import {NOT_ELIGIBLE_FOR_THIS_SERVICE} from '../../urls';

const notEligibleController = express.Router();
const notEligibleControllerViewPath = 'features/eligibility/not-eligible';

notEligibleController
  .get(NOT_ELIGIBLE_FOR_THIS_SERVICE, async (req, res, next) => {
    try {
      res.render(notEligibleControllerViewPath, {reason: req.query});
    } catch (error) {
      next(error);
    }
  });

export default notEligibleController;

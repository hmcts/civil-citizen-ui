import {NextFunction, Request, Response, Router} from 'express';
import {DATE_PAID_CONFIRMATION_URL} from 'routes/urls';

const claimSettledController: Router = Router();

claimSettledController.get(DATE_PAID_CONFIRMATION_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('features/response/claim-settled-confirmation', {});
  } catch (error) {
    next(error);
  }
});

export default claimSettledController;

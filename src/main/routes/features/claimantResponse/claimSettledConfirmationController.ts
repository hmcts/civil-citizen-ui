import {NextFunction, Request, Response, Router} from 'express';
import {DATE_PAID_CONFIRMATION_URL} from 'routes/urls';

const claimSettledConfirmationController: Router = Router();

claimSettledConfirmationController.get(DATE_PAID_CONFIRMATION_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('features/response/claim-settled-confirmation');
  } catch (error) {
    next(error);
  }
});

export default claimSettledConfirmationController;

import { Request, Response, Router } from 'express';
import { BASE_ELIGIBILITY_URL, MAKE_CLAIM } from 'routes/urls';

const makeClaimController = Router();

makeClaimController.get(MAKE_CLAIM, async (req: Request, res: Response) => {
  return res.redirect(BASE_ELIGIBILITY_URL);
});

export default makeClaimController;
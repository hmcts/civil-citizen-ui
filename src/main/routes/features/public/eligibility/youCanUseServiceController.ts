import {Request, RequestHandler, Response, Router} from 'express';
import {ELIGIBLE_FOR_THIS_SERVICE_URL, SIGN_IN_URL} from 'routes/urls';

const youCanUseServiceController = Router();
const youCanUseServicePath = 'features/public/eligibility/you-can-use-service';

youCanUseServiceController.get(ELIGIBLE_FOR_THIS_SERVICE_URL, (async (req: Request, res: Response) => {
  res.render(youCanUseServicePath,
    {urlNextView: SIGN_IN_URL});
}) as RequestHandler);

export default youCanUseServiceController;

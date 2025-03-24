import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {deadLineGuard} from 'routes/guards/deadLineGuard';
import {AppRequest} from 'common/models/AppRequest';

const understandingYourOptionsController = Router();

understandingYourOptionsController.get(UNDERSTANDING_RESPONSE_OPTIONS_URL, deadLineGuard,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      res.render('features/response/understanding-your-options', {
        responseDate: claim.formattedResponseDeadline(lang),
      });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default understandingYourOptionsController;

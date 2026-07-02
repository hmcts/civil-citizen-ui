import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../urls';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
import {deadLineGuard} from 'routes/guards/deadLineGuard';
const understandingYourOptionsController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('understandingYourOptionsController');

understandingYourOptionsController.get(UNDERSTANDING_RESPONSE_OPTIONS_URL, deadLineGuard,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getStashedClaimOrFromStore(req, 'understandingYourOptionsController GET');
      res.render('features/response/understanding-your-options', {
        responseDate: claim.formattedResponseDeadline(lang),
      });
    } catch (error) {
      logger.error(`Error when getting understanding your opinions, req.params.claimId  ${ req.params.claimId } -  ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

export default understandingYourOptionsController;

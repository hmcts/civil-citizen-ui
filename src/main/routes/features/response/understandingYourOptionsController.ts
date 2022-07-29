import * as express from 'express';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {deadLineGuard} from '../../../routes/guards/deadLineGuard';

const understandingYourOptionsController = express.Router();

understandingYourOptionsController.get(UNDERSTANDING_RESPONSE_OPTIONS_URL, deadLineGuard,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      res.render('features/response/understanding-your-options', {
        responseDate: claim.formattedResponseDeadline(),
      });
    } catch (error) {
      next(error);
    }
  });

export default understandingYourOptionsController;

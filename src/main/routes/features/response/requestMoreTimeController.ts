import * as express from 'express';
import {REQUEST_MORE_TIME_URL} from '../../urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Claim} from '../../../common/models/claim';

const requestMoreTimeController = express.Router();
const requestMoreTimeViewPath = 'features/response/response-deadline-options';

function renderView(res: express.Response, form: GenericForm<any>, claim: Claim): void {
  const responseDeadline = Object.assign(form);
  responseDeadline.option = form.model?.option;
  res.render(requestMoreTimeViewPath, {
    form: responseDeadline,
    responseDate: claim.formattedResponseDeadline(),
    claimantName: claim.getClaimantName(),
  });
}

requestMoreTimeController.get(REQUEST_MORE_TIME_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      renderView(res, new GenericForm(claim), claim);
    } catch (error) {
      next(error);
    }
  });

requestMoreTimeController.post(REQUEST_MORE_TIME_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(claimId);
      const form = new GenericForm(claim);
      renderView(res, form, claim);
    } catch (error) {
      next(error);
    }
  });

export default requestMoreTimeController;

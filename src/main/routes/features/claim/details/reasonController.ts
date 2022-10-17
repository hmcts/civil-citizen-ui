import {NextFunction, Request, Response, Router} from 'express';
import {AppRequest} from '../../../../common/models/AppRequest';
import {GenericForm} from '../../../../common/form/models/genericForm';

import {
  CLAIM_REASON_URL,
  CLAIM_TIMELINE_URL,
} from '../../../urls';
import {getClaimDetails, saveClaimDetails} from '../../../../services/features/claim/details/claimDetailsService';
import {Reason} from '../../../../common/form/models/claim/details/reason';

const reasonController = Router();
const reasonViewPath = 'features/claim/details/reason';
const dqPropertyName = 'reason';

function renderView(form: GenericForm<Reason>, res: Response): void {
  res.render(reasonViewPath, {form});
}

reasonController.get(CLAIM_REASON_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimDetails = await getClaimDetails(req.session?.user?.id);
    const reason = Object.assign(new Reason(), claimDetails.reason);
    const reasonForm = new GenericForm(reason);

    renderView(reasonForm, res);
  } catch (error) {
    next(error);
  }
});

reasonController.post(CLAIM_REASON_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const reasonForm = new GenericForm(new Reason(req.body.text));
    reasonForm.validateSync();

    if (reasonForm.hasErrors()) {
      renderView(reasonForm, res);
    } else {
      const appRequest = <AppRequest>req;
      await saveClaimDetails(appRequest.session?.user?.id, reasonForm.model, dqPropertyName);
      res.redirect(CLAIM_TIMELINE_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default reasonController;

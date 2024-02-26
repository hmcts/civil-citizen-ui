import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';

import {CLAIM_REASON_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {getClaimDetails, saveClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {Reason} from 'form/models/claim/details/reason';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';

const reasonController = Router();
const reasonViewPath = 'features/claim/details/reason';
const claimDetailsPropertyName = 'reason';

function renderView(form: GenericForm<Reason>, res: Response): void {
  res.render(reasonViewPath, {form});
}

reasonController.get(CLAIM_REASON_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimDetails: ClaimDetails = await getClaimDetails(req.session?.user?.id);
    const reason: Reason = claimDetails.reason;
    const reasonForm = new GenericForm(reason);

    renderView(reasonForm, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

reasonController.post(CLAIM_REASON_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const reasonForm = new GenericForm(new Reason(req.body.text));
    reasonForm.validateSync();

    if (reasonForm.hasErrors()) {
      renderView(reasonForm, res);
    } else {
      const appRequest = <AppRequest>req;
      await saveClaimDetails(appRequest.session?.user?.id, reasonForm.model, claimDetailsPropertyName);
      res.redirect(CLAIM_TIMELINE_URL);
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default reasonController;

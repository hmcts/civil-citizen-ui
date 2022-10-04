import * as express from 'express';
import {ClaimantDefendantEmail} from '../../../../common/form/models/claim/claimantDefendantEmail';
import {CLAIMANT_DEFENDANT_EMAIL_URL, CLAIMANT_DEFENDANT_MOBILE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getClaimantDefendantEmail,saveClaimantDefendantEmail} from '../../../../../main/services/features/claim/claimantDefendantEmailService';
import {AppRequest} from 'common/models/AppRequest';

const claimantDefendantEmailViewPath = 'features/public/claim/defendant-email';
const claimantDefendantEmailController = express.Router();

function renderView(form: GenericForm<ClaimantDefendantEmail>, res: express.Response): void {
  res.render(claimantDefendantEmailViewPath, {form});
}

claimantDefendantEmailController.get(CLAIMANT_DEFENDANT_EMAIL_URL, async (req: AppRequest,res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const form: ClaimantDefendantEmail = await getClaimantDefendantEmail(claimId);
    renderView(new GenericForm<ClaimantDefendantEmail>(form),res);
  } catch (error) {
    next(error);
  }
});

claimantDefendantEmailController.post(CLAIMANT_DEFENDANT_EMAIL_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const form: GenericForm<ClaimantDefendantEmail> = new GenericForm(new ClaimantDefendantEmail(req.body.emailAddress));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimantDefendantEmail(req.params.id,form.model);
      res.redirect(CLAIMANT_DEFENDANT_MOBILE_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimantDefendantEmailController;

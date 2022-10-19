import {NextFunction, Response, Request, Router} from 'express';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_HELP_WITH_FEES_REFERENCE_URL,
  CLAIM_TOTAL_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AppRequest} from '../../../../common/models/AppRequest';
import {YesNo} from '../../../../common/form/models/yesNo';
import {HelpWithFees} from '../../../../common/form/models/claim/details/helpWithFees';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {getClaimDetails, saveClaimDetails} from '../../../../../main/services/features/claim/details/claimDetailsService';

const helpWithFeesController = Router();
const helpWithFeesViewPath = 'features/claim/details/help-with-fees';
const helpWithFeesPropertyName = 'helpWithFees';

function renderView(form: GenericForm<HelpWithFees>, res: Response): void {
  res.render(helpWithFeesViewPath, {form});
}

helpWithFeesController.get(CLAIM_HELP_WITH_FEES_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claimDetails: ClaimDetails = await getClaimDetails(userId);
    const form = new GenericForm(claimDetails.helpWithFees);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

helpWithFeesController.post(CLAIM_HELP_WITH_FEES_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    const referenceNumber = req.body.option === YesNo.NO ? '' : req.body.referenceNumber;
    const helpWithFees = new HelpWithFees(req.body.option, referenceNumber);
    const form = new GenericForm(helpWithFees);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimDetails(userId, form.model, helpWithFeesPropertyName);
      req.body.option === YesNo.YES
        ? res.redirect(CLAIM_HELP_WITH_FEES_REFERENCE_URL)
        : res.redirect(CLAIM_TOTAL_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default helpWithFeesController;

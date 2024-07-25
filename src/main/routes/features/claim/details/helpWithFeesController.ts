import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_TOTAL_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {getClaimDetails, saveClaimDetails} from 'services/features/claim/details/claimDetailsService';

const helpWithFeesController = Router();
const helpWithFeesViewPath = 'features/claim/details/help-with-fees';
const helpWithFeesPropertyName = 'helpWithFees';

function renderView(form: GenericForm<HelpWithFees>, res: Response): void {
  res.render(helpWithFeesViewPath, {form, pageTitle: 'PAGES.HELP_WITH_FEES.PAGE_TITLE'});
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
      res.redirect(CLAIM_TOTAL_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default helpWithFeesController;

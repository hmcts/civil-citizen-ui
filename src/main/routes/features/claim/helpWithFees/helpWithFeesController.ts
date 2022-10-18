import {NextFunction, Response, Request, Router} from 'express';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_HELP_WITH_FEES_REFERENCE_URL,
  CLAIM_TOTAL_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getHelpWithFees, saveHelpWithFees} from '../../../../services/features/claim/details/helpWithFees/helpWithFeesService';
import {YesNo} from '../../../../common/form/models/yesNo';
import {HelpWithFees} from '../../../../common/form/models/claim/details/helpWithFees';

const helpWithFeesReferenceController = Router();
const helpWithFeesViewPath = 'features/claim/help-with-fees-reference';

function renderView(form: GenericForm<HelpWithFees>, res: Response): void {
  res.render(helpWithFeesViewPath, {form});
}

helpWithFeesReferenceController.get(CLAIM_HELP_WITH_FEES_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const helpWithFees: HelpWithFees = await getHelpWithFees(userId);
    const form = new GenericForm(helpWithFees);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

helpWithFeesReferenceController.post(CLAIM_HELP_WITH_FEES_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    req.body.option === YesNo.NO ? req.body.referenceNumber = '' : req.body.referenceNumber;
    const helpWithFees = new HelpWithFees(req.body.option, req.body.referenceNumber);
    const form = new GenericForm(helpWithFees);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveHelpWithFees(userId, form.model);
      req.body.option === YesNo.YES
        ? res.redirect(CLAIM_HELP_WITH_FEES_REFERENCE_URL)
        : res.redirect(CLAIM_TOTAL_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default helpWithFeesReferenceController;

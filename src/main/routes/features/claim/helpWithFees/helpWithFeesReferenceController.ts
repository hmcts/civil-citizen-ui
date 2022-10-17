import {NextFunction, Response, Request, Router} from 'express';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_HELP_WITH_FEES_REFERENCE_URL,
  CLAIM_TOTAL_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getHelpWithFees, saveHelpWithFees} from '../../../../services/features/claim/details/helpWithFees/helpWithFeesReferenceService';
import {VALID_YES_NO_SELECTION} from '../../../../common/form/validationErrors/errorMessageConstants';
import {YesNo} from '../../../../common/form/models/yesNo';
import {HelpWithFees} from '../../../../common/form/models/claim/details/helpWithFees';

const helpWithFeesReferenceController = Router();
const helpWithFeesViewPath = 'features/claim/help-with-fees-reference';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(helpWithFeesViewPath, {form});
}

helpWithFeesReferenceController.get(CLAIM_HELP_WITH_FEES_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const helpWithFees: HelpWithFees = await getHelpWithFees(userId);
    const form = new GenericForm(new GenericYesNo(helpWithFees.helpWithFeesReferenceOption?.option));
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

helpWithFeesReferenceController.post(CLAIM_HELP_WITH_FEES_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, VALID_YES_NO_SELECTION));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveHelpWithFees(userId, {option: form.model.option}, 'helpWithFeesReferenceOption');
      req.body.option === YesNo.YES
        ? res.redirect(CLAIM_HELP_WITH_FEES_REFERENCE_URL)
        : res.redirect(CLAIM_TOTAL_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default helpWithFeesReferenceController;

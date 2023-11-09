import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES_START,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
  DASHBOARD_CLAIMANT_URL, APPLY_HELP_WITH_FEES,
} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {getClaimById} from 'modules/utilityService';
import {getApplyHelpWithFeesContent} from 'services/features/helpWithFees/applyHelpWithFeesService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';

const applyHelpWithFeesController = Router();
const applyHelpWithFeesViewPath  = 'features/helpWithFees/help-fees-start';

applyHelpWithFeesController.get(APPLY_HELP_WITH_FEES, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, <AppRequest>req);
    const form = new GenericForm(new GenericYesNo('', 'ERRORS.VALID_YES_NO_SELECTION'));
    const cancelUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    res.render(applyHelpWithFeesViewPath, {form, applyHelpWithFeesContent:getApplyHelpWithFeesContent(claim), cancelUrl: cancelUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applyHelpWithFeesController.post(APPLY_HELP_WITH_FEES, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, <AppRequest>req);
    const option = req.body.option;
    const form = new GenericForm(new GenericYesNo(option, 'ERRORS.VALID_YES_NO_SELECTION'));
    await form.validate();
    if (form.hasErrors()) {
      res.render(applyHelpWithFeesViewPath, {form, applyHelpWithFeesContent:getApplyHelpWithFeesContent(claim)});
    } else {
      let redirectUrl;
      if (req.body.option == YesNo.YES) {
        redirectUrl = constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_START);
      } else {
        redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION);
      }
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default applyHelpWithFeesController;

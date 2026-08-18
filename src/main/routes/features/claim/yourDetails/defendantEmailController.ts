import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DefendantEmail} from '../../../../common/form/models/claim/yourDetails/defendantEmail';
import {CLAIM_DEFENDANT_EMAIL_URL, CLAIM_DEFENDANT_PHONE_NUMBER_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getDefendantEmail,saveDefendantEmail} from '../../../../services/features/claim/yourDetails/defendantEmailService';
import {AppRequest} from '../../../../common/models/AppRequest';

const defendantEmailViewPath = 'features/claim/yourDetails/defendant-email';
const defendantEmailController = Router();

function renderView(form: GenericForm<DefendantEmail>, res: Response): void {
  res.render(defendantEmailViewPath, {form, pageTitle: 'PAGES.CLAIM_JOURNEY.DEFENDANT_EMAIL.TITLE'});
}

defendantEmailController.get(CLAIM_DEFENDANT_EMAIL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const form: DefendantEmail = await getDefendantEmail(claimId);
    renderView(new GenericForm<DefendantEmail>(form), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

defendantEmailController.post(CLAIM_DEFENDANT_EMAIL_URL, (async (req: AppRequest & Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const form: GenericForm<DefendantEmail> = new GenericForm(new DefendantEmail(req.body.emailAddress));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDefendantEmail(claimId, form.model);
      res.redirect(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantEmailController;

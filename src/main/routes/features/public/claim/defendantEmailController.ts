import {NextFunction, Response, Request, Router} from 'express';
import {DefendantEmail} from '../../../../common/form/models/claim/defendantEmail';
import {DEFENDANT_EMAIL_URL, DEFENDANT_PHONE_NUMBER_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getDefendantEmail,saveDefendantEmail} from '../../../../services/features/claim/defendantEmailService';
import {AppRequest} from '../../../../common/models/AppRequest';

const defendantEmailViewPath = 'features/public/claim/defendant-email';
const defendantEmailController = Router();

function renderView(form: GenericForm<DefendantEmail>, res: Response): void {
  res.render(defendantEmailViewPath, {form});
}

defendantEmailController.get(DEFENDANT_EMAIL_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const form: DefendantEmail = await getDefendantEmail(claimId);
    renderView(new GenericForm<DefendantEmail>(form),res);
  } catch (error) {
    next(error);
  }
});

defendantEmailController.post(DEFENDANT_EMAIL_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form: GenericForm<DefendantEmail> = new GenericForm(new DefendantEmail(req.body.emailAddress));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDefendantEmail(req.params.id,form.model);
      res.redirect(DEFENDANT_PHONE_NUMBER_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default defendantEmailController;

import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {DATE_PAID_URL, DATE_PAID_CONFIRMATION_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {getClaimantResponse, saveClaimantResponse} from '../../../../services/features/claimantResponse/claimantResponseService';
import {CitizenDate} from '../../../../common/form/models/claim/claimant/citizenDate';

const claimantResponsePropertyName = 'datePaid';
const datePaidViewPath = 'features/claimantResponse/paidInFull/date-paid';
const datePaidViewController = Router();

function renderView(form: GenericForm<CitizenDate>, res: Response): void {
  res.render(datePaidViewPath, {form, today: new Date()});
}

datePaidViewController.get(DATE_PAID_URL, async (req: Request,res: Response,next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form: ClaimantResponse = await getClaimantResponse(claimId);
    renderView(new GenericForm<CitizenDate>(form.datePaid),res);
  } catch (error) {
    next(error);
  }
});

datePaidViewController.post(DATE_PAID_URL, async (req: Request,res: Response,next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const {year, month, day} = req.body;
    const form = new GenericForm(new CitizenDate(day,month,year));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form,res);
    } else {
      await saveClaimantResponse(claimId, form.model, claimantResponsePropertyName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DATE_PAID_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default datePaidViewController;

import {DatePaid} from '../../../../main/common/form/models/paidInFull/datePaid';
import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from '../../../../main/common/utils/urlFormatter';
import {DATE_PAID_URL,DATE_PAID_CONFIRMATION_URL} from '../../../../main/routes/urls';
import {GenericForm} from '../../../../main/common/form/models/genericForm';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {getClaimantResponse, saveClaimantResponse} from '../../../../main/services/features/claimantResponse/claimantResponseService';

const claimantResponsePropertyName = 'datePaid';
const datePaidViewPath = 'features/paidInFull/date-paid';
const datePaidViewController = Router();

function renderView(form: GenericForm<DatePaid>, res: Response): void {
  res.render(datePaidViewPath, {form, today: new Date()});
}

datePaidViewController.get(DATE_PAID_URL, async (req: Request,res: Response,next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form: ClaimantResponse = await getClaimantResponse(claimId);
    renderView(new GenericForm<DatePaid>(form.datePaid),res);
  } catch (error) {
    next(error);
  }
});

datePaidViewController.post(DATE_PAID_URL, async (req: Request,res: Response,next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const {year, month, day} = req.body;
    const form = new GenericForm(new DatePaid(year,month,day));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form,res);
    } else {
      await saveClaimantResponse(claimId,form.model,claimantResponsePropertyName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id,DATE_PAID_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default datePaidViewController;

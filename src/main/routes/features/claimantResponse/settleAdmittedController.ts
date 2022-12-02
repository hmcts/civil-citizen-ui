import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_REJECTION_REASON_URL ,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {saveClaimantResponse} from '../../../services/features/claimantResponse/claimantResponseService';
import {YesNo} from '../../../common/form/models/yesNo';

const settleAdmittedController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-claim';

function renderView(form: GenericForm<GenericYesNo>, res: Response, admittedAmount: number): void {
  res.render(settleClaimViewPath, {form, admittedAmount});
}

let admittedAmount: number;

settleAdmittedController.get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    renderView(new GenericForm(claim.claimantResponse?.hasPartAdmittedBeenAccepted), res, claim.partialAdmissionPaymentAmount());
  } catch (error) {
    next(error);
  }
});

settleAdmittedController.post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res, admittedAmount);
    } else {
      await saveClaimantResponse(claimId, form.model, 'hasPartAdmittedBeenAccepted');
      if (form.model.option === YesNo.YES) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL ));
      }
    }
  } catch (error) {
    next(error);
  }

});

export default settleAdmittedController;

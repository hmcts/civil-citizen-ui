import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_DEBT_RESPITE_REFERENCE_NUMBER_URL,
  CLAIMANT_RESPONSE_DEBT_RESPITE_START_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {DebtRespiteScheme} from '../../../common/models/claimantResponse/debtRespiteScheme';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from '../../../services/features/claimantResponse/claimantResponseService';

const debtRespiteReferenceNumberController = Router();
const debtRespiteReferenceNumberViewPath = 'features/claimantResponse/debt-respite-reference-number';
const crPropertyName = 'debtRespiteScheme';

function renderView(form: GenericForm<DebtRespiteScheme>, res: Response): void {
  res.render(debtRespiteReferenceNumberViewPath, {form});
}

debtRespiteReferenceNumberController.get(CLAIMANT_RESPONSE_DEBT_RESPITE_REFERENCE_NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimantResponse = await getClaimantResponse(req.params.id);
    renderView(new GenericForm(claimantResponse.debtRespiteScheme), res);
  } catch (error) {
    next(error);
  }
});

debtRespiteReferenceNumberController.post(CLAIMANT_RESPONSE_DEBT_RESPITE_REFERENCE_NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const debtRespiteScheme = new GenericForm(new DebtRespiteScheme(req.body.referenceNumber));
    debtRespiteScheme.validateSync();

    if (debtRespiteScheme.hasErrors()) {
      renderView(debtRespiteScheme, res);
    } else {
      await saveClaimantResponse(claimId, debtRespiteScheme.model, crPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_DEBT_RESPITE_START_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default debtRespiteReferenceNumberController;

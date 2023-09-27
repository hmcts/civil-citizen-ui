import {NextFunction, Request, Response, Router} from 'express';
import {
  BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL,
  BREATHING_SPACE_RESPITE_START_DATE_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {DebtRespiteReferenceNumber} from '../../../common/models/breathingSpace/debtRespiteReferenceNumber';
import {getBreathingSpace, saveBreathingSpace} from '../../../services/features/breathingSpace/breathingSpaceService';
import {breathingSpacGuard} from 'routes/guards/breathingSpacGuard';

const debtRespiteReferenceNumberController = Router();
const debtRespiteReferenceNumberViewPath = 'features/breathingSpace/debt-respite-reference-number';
const bsPropertyName = 'debtRespiteReferenceNumber';

function renderView(form: GenericForm<DebtRespiteReferenceNumber>, res: Response): void {
  res.render(debtRespiteReferenceNumberViewPath, {form});
}

debtRespiteReferenceNumberController.get(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL, breathingSpacGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const breathingSpace = await getBreathingSpace(req.params.id);
    renderView(new GenericForm(breathingSpace.debtRespiteReferenceNumber), res);
  } catch (error) {
    next(error);
  }
});

debtRespiteReferenceNumberController.post(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL, breathingSpacGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const debtRespiteScheme = new GenericForm(new DebtRespiteReferenceNumber(req.body.referenceNumber));
    debtRespiteScheme.validateSync();

    if (debtRespiteScheme.hasErrors()) {
      renderView(debtRespiteScheme, res);
    } else {
      await saveBreathingSpace(claimId, debtRespiteScheme.model, bsPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_START_DATE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default debtRespiteReferenceNumberController;

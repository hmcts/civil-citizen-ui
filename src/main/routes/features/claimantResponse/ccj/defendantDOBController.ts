import {NextFunction, Request, Response, Router} from 'express';
import {
  CCJ_DEFENDANT_DOB_URL,
  CCJ_PAID_AMOUNT_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {ExpertCanStillExamine} from '../../../../common/models/directionsQuestionnaire/experts/expertCanStillExamine';
import {getClaimantResponse, saveClaimantResponse} from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {DefendantDOB} from '../../../../common/models/claimantResponse/ccj/defendantDOB';
import {DateOfBirth} from '../../../../common/models/claimantResponse/ccj/dateOfBirth';
import {getMaxDateforAge} from '../../../../common/utils/dateUtils';

const defendantDOBController = Router();
const defendantDOBViewPath = 'features/claimantResponse/ccj/defendant-dob';
const crPropertyName = 'defendantDOB';
const crParentName = 'ccjRequest';

function renderView(form: GenericForm<ExpertCanStillExamine>, res: Response): void {
  res.render(defendantDOBViewPath, {
    form,
    maxDateForAge18: getMaxDateforAge(18),
  });
}

defendantDOBController.get(CCJ_DEFENDANT_DOB_URL, async (req, res, next: NextFunction) => {
  try {
    const claimantReponse = await getClaimantResponse(req.params.id);
    const defendantDOB = claimantReponse.ccjRequest ?
      claimantReponse.ccjRequest.defendantDOB : new DefendantDOB();
    renderView(new GenericForm(defendantDOB), res);
  } catch (error) {
    next(error);
  }
});

defendantDOBController.post(CCJ_DEFENDANT_DOB_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const dateOfBirth = req.body.option === YesNo.YES ? req.body.dob : undefined;
    const defendantDOB = new GenericForm(new DefendantDOB(req.body.option, new DateOfBirth(dateOfBirth)));
    defendantDOB.validateSync();
    if (defendantDOB.hasErrors()) {
      renderView(defendantDOB, res);
    } else {
      await saveClaimantResponse(claimId, defendantDOB.model, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_PAID_AMOUNT_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default defendantDOBController;

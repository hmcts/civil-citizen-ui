import {NextFunction, Request, Response, Router} from 'express';
import {
  CCJ_DEFENDANT_DOB_URL,
  CCJ_PAID_AMOUNT_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ExpertCanStillExamine} from 'models/directionsQuestionnaire/experts/expertCanStillExamine';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {DefendantDOB} from 'models/claimantResponse/ccj/defendantDOB';
import {getDOBforAgeFromCurrentTime} from 'common/utils/dateUtils';
import {DateOfBirth} from 'models/claimantResponse/ccj/dateOfBirth';
import {getClaimById} from 'modules/utilityService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';

const defendantDOBController = Router();
const defendantDOBViewPath = 'features/claimantResponse/ccj/defendant-dob';
const crPropertyName = 'defendantDOB';
const crParentName = 'ccjRequest';

function renderView(form: GenericForm<ExpertCanStillExamine>, res: Response): void {
  res.render(defendantDOBViewPath, {
    form,
    maxDateForAge18: getDOBforAgeFromCurrentTime(18),
  });
}

defendantDOBController.get(CCJ_DEFENDANT_DOB_URL, async (req, res, next: NextFunction) => {
  try {
    await getClaimById(req.params.id, req, true);
    const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
    const defendantDOB = claimantResponse.ccjRequest ?
      claimantResponse.ccjRequest.defendantDOB : new DefendantDOB();
    renderView(new GenericForm(defendantDOB), res);
  } catch (error) {
    next(error);
  }
});

defendantDOBController.post(CCJ_DEFENDANT_DOB_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const defendantDOB = new GenericForm(new DefendantDOB(req.body.option, new DateOfBirth(req.body.dob)));
    defendantDOB.validateSync();
    if (defendantDOB.hasErrors()) {
      renderView(defendantDOB, res);
    } else {
      await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), defendantDOB.model, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_PAID_AMOUNT_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default defendantDOBController;

import {NextFunction, Request, Response, Router} from 'express';
import {
  DQ_EXPERT_REPORT_DETAILS_URL,
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {saveExpertRequiredValue} from 'services/features/directionsQuestionnaire/expertRequiredValueService';

const expertSmallClaimsController = Router();
const expertSmallClaimsViewPath = 'features/directionsQuestionnaire/experts/expert-small-claims';

expertSmallClaimsController.get(DQ_EXPERT_SMALL_CLAIMS_URL, async (req: Request, res: Response) => {
  res.render(expertSmallClaimsViewPath);
});

expertSmallClaimsController.post(DQ_EXPERT_SMALL_CLAIMS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const expertRequiredValue = req.body.expertYes ? true : false;
    const redirectUrl = req.body.expertYes ? DQ_EXPERT_REPORT_DETAILS_URL : DQ_GIVE_EVIDENCE_YOURSELF_URL;
    await saveExpertRequiredValue(claimId, expertRequiredValue);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  } catch (error) {
    next(error);
  }
});

export default expertSmallClaimsController;

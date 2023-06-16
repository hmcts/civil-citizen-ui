import {NextFunction, Request, Response, Router} from 'express';
import {
  DQ_EXPERT_REPORT_DETAILS_URL,
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {saveDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';

const expertSmallClaimsController = Router();
const expertSmallClaimsViewPath = 'features/directionsQuestionnaire/experts/expert-small-claims';
const dqPropertyName = 'expertRequired';
const dqParentName = 'experts';

expertSmallClaimsController.get(DQ_EXPERT_SMALL_CLAIMS_URL, async (req: Request, res: Response) => {
  res.render(expertSmallClaimsViewPath);
});

expertSmallClaimsController.post(DQ_EXPERT_SMALL_CLAIMS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const expertRequiredValue = req.body.expertYes ? true : false;
    const redirectUrl = req.body.expertYes ? DQ_EXPERT_REPORT_DETAILS_URL : DQ_GIVE_EVIDENCE_YOURSELF_URL;
    if(!expertRequiredValue) {
      await saveDirectionQuestionnaire(claimId, null, 'expertReportDetails', dqParentName);
      await saveDirectionQuestionnaire(claimId, null, 'permissionForExpert', dqParentName);
      await saveDirectionQuestionnaire(claimId, null, 'expertCanStillExamine', dqParentName);
      await saveDirectionQuestionnaire(claimId, null, 'expertDetailsList', dqParentName);
    }
    await saveDirectionQuestionnaire(claimId, expertRequiredValue, dqPropertyName, dqParentName);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  } catch (error) {
    next(error);
  }
});

export default expertSmallClaimsController;

import {NextFunction, Request, Response, Router} from 'express';
import {DQ_EXPERT_REPORT_DETAILS_URL, DQ_EXPERT_SMALL_CLAIMS_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {saveDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';

const expertSmallClaimsController = Router();
const expertSmallClaimsViewPath = 'features/directionsQuestionnaire/experts/expert-small-claims';
const dqPropertyName = 'expertNotRequired';
const dqParentName = 'experts';

expertSmallClaimsController.get(DQ_EXPERT_SMALL_CLAIMS_URL, async (req: Request, res: Response) => {
  const claimId = req.params.id;
  res.render(expertSmallClaimsViewPath,
    {
      reportWrittenByExpertScreenURL: constructResponseUrlWithIdParams(claimId, DQ_EXPERT_REPORT_DETAILS_URL),
    });
});

expertSmallClaimsController.post(DQ_EXPERT_SMALL_CLAIMS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await saveDirectionQuestionnaire(claimId, true, dqPropertyName, dqParentName);
    res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
  } catch (error) {
    next(error);
  }
});

export default expertSmallClaimsController;

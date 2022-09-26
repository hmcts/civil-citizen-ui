import * as express from 'express';
import {
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_EXPERT_REPORT_DETAILS_URL,
} from '../../urls';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const expertSmallClaimsController = express.Router();
const expertSmallClaimsViewPath = 'features/directionsQuestionnaire/expert-small-claims';

expertSmallClaimsController.get(DQ_EXPERT_SMALL_CLAIMS_URL, async (req:express.Request, res:express.Response) => {
  const claimId = req.params.id;
  res.render(expertSmallClaimsViewPath,
    {giveEvidenceYourselfScreenURL: constructResponseUrlWithIdParams(claimId,DQ_GIVE_EVIDENCE_YOURSELF_URL) , reportWrittenByExpertScreenURL: constructResponseUrlWithIdParams(claimId,DQ_EXPERT_REPORT_DETAILS_URL)});
});

export default expertSmallClaimsController;

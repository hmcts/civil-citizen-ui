import * as express from 'express';
import {
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_EXPERT_EXPORTS_URL,
} from '../../urls';

const expertSmallClaimsController = express.Router();
const expertSmallClaimsViewPath = 'features/public/eligibility/expert-small-claims';

expertSmallClaimsController.get(DQ_EXPERT_SMALL_CLAIMS_URL, async (req:express.Request, res:express.Response) => {
  res.render(expertSmallClaimsViewPath,
    {giveEvidenceYourselfScreenURL: DQ_GIVE_EVIDENCE_YOURSELF_URL , reportWrittenByExpertScreenURL: DQ_EXPERT_EXPORTS_URL});
});

export default expertSmallClaimsController;

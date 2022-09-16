import * as express from 'express';
import {
  DQ_EXPERT_SMALL_CLAIMS,
  DQ_GIVE_EVIDENCE_YOURSELF,
  DQ_HAVE_EXPERT_REPORT_URL,
} from '../../urls';

const expertSmallClaimsController = express.Router();
const expertSmallClaimsViewPath = 'features/public/eligibility/expert-small-claims';

expertSmallClaimsController.get(DQ_EXPERT_SMALL_CLAIMS, async (req:express.Request, res:express.Response) => {
  res.render(expertSmallClaimsViewPath,
    {giveEvidenceYourselfScreenURL: DQ_GIVE_EVIDENCE_YOURSELF , reportWrittenByExpertScreenURL: DQ_HAVE_EXPERT_REPORT_URL});
});

export default expertSmallClaimsController;

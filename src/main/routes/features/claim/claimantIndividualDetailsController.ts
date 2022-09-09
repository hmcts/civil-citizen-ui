import * as express from 'express';
import {CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, CLAIM_CLAIMANT_DOB} from '../../urls';

const claimantIndividualDetailsController = express.Router();
const claimantIndividualDetailsPath = 'features/claim/claimant-individual-details';

claimantIndividualDetailsController.get(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req:express.Request, res:express.Response) => {
  res.render(claimantIndividualDetailsPath,
    {urlNextView: CLAIM_CLAIMANT_DOB});
});

export default claimantIndividualDetailsController;

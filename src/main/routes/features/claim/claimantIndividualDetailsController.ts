import * as express from 'express';
import {CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, CLAIM_CLAIMANT_DOB} from '../../urls';
import {Respondent} from "models/respondent";
import {getRespondentInformation} from "../../../services/features/response/citizenDetails/citizenDetailsService";

const claimantIndividualDetailsController = express.Router();
const claimantIndividualDetailsPath = 'features/claim/claimant-individual-details';

function renderPage(res: express.Response, req: express.Request, respondent: Respondent): void {
  const type = respondent?.type;

  res.render(claimantIndividualDetailsPath, {
    respondent,
    type: type,
    urlNextView: CLAIM_CLAIMANT_DOB
  })
}

claimantIndividualDetailsController.get(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req:express.Request, res:express.Response, next: express.NextFunction) => {
  const respondent: Respondent = await getRespondentInformation(req.params.id);
  try {
    renderPage(res, req, respondent)
  } catch (error) {
    next(error);
  }
});

export default claimantIndividualDetailsController;

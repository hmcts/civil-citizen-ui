import * as express from 'express';
import config from 'config';
import {CLAIM_DETAILS_URL } from '../../../urls';
import { CivilServiceClient } from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';

const router = express.Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

let claim: Claim = new Claim();

function renderPage(res: express.Response, claimDetails: Claim): void {
  res.render('features/response/claim-details', {
    claim: claimDetails,
  });
}

// -- GET Claim Details
router.get(CLAIM_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');
  renderPage(res, claim);
});

export default router;

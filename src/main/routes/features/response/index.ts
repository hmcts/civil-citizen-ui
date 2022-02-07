import * as express from 'express';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {Claim} from '../../../common/models/claim';
import config from 'config';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: express.Response, claimDetails: Claim): void {
  res.render('features/response/claim-details', {
    claim: claimDetails,
  });
}

const router = express.Router();

router.get('/case/:id/response/claim-details', async function (req, res) {
  const claimDetails: Claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');
  renderPage(res, claimDetails);
});

export default router;

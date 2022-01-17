import * as express from 'express';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {Claim} from '../../../common/models/claim';

const civilServiceApiBaseUrl = 'http://localhost:8765';

const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: express.Response, claimsAsClaimant: Claim[], claimDraftSaved: boolean,
  claimsAsDefendant: Claim[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object): void {

  res.render('features/dashboard/dashboard', {
    claimsAsClaimant: claimsAsClaimant,
    claimDraftSaved: claimDraftSaved,
    claimsAsDefendant: claimsAsDefendant,
    responseDraftSaved: responseDraftSaved,
    paginationArgumentClaimant: paginationArgumentClaimant,
    paginationArgumentDefendant: paginationArgumentDefendant,
  });
}

const router = express.Router();

router.get('/dashboard', async function (req, res) {

  const claimDraftSaved = false;
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = undefined;
  const paginationArgumentDefendant: object = undefined;

  const claimsAsClaimant: Claim[] = [];
  const claimsAsDefendant: Claim[] = await civilServiceClient.retrieveByDefendantId();

  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);

});

router.get('/', (req, res) => {
  res.render('home');
});

export default router;

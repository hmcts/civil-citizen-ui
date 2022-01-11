import * as express from 'express';

import {CivilServiceClient} from '../../../app/client/civilServiceClient';

const civilServiceClient: CivilServiceClient = new CivilServiceClient();

function renderPage(res: express.Response, claimsAsClaimant: object[], claimDraftSaved: boolean,
  claimsAsDefendant: object[], responseDraftSaved: boolean,
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

  const claimsAsClaimant: object[] = [];
  const claimsAsDefendant: object[] = civilServiceClient.retrieveByDefendantId();

  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);

});

export default router;

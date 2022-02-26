import * as express from 'express';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: express.Response, claimsAsClaimant: Claim[], claimDraftSaved: boolean, responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object): void {

  res.render('features/dashboard/dashboard', {
    claimsAsClaimant: claimsAsClaimant,
    claimDraftSaved: claimDraftSaved,
    responseDraftSaved: responseDraftSaved,
    paginationArgumentClaimant: paginationArgumentClaimant,
    paginationArgumentDefendant: paginationArgumentDefendant,
  });
}

const router = express.Router();

router.get(DASHBOARD_URL, async function (req, res) {

  const claimsAsClaimant : Claim[]  = await civilServiceClient.retrieveByDefendantId(<AppRequest>req);

  const claimDraftSaved = false;
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};

  renderPage(res, claimsAsClaimant, claimDraftSaved, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
});

export default router;

import * as express from 'express';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
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

router.get(DASHBOARD_URL, async function (req, res) {
  civilServiceClient.retrieveByDefendantId(<AppRequest>req).then(claimsAsDefendant  => {
    console.log(claimsAsDefendant);
    const claimDraftSaved = false;
    const responseDraftSaved = false;
    const paginationArgumentClaimant: object = {};
    const paginationArgumentDefendant: object = {};
    const claimsAsClaimant: Claim[] = [];
    renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
  });
});

export default router;

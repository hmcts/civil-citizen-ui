import {Response, Router} from 'express';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {getOcmcDraftClaims} from '../../../app/client/legacyDraftStoreClient';
import {DashboardClaimantItem, DashboardDefendantItem} from '../../../common/models/dashboard/dashboardItem';
import {DashboardStatus} from 'common/models/dashboard/dashboardStatus';
import {t} from 'i18next';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const ocmcBaseUrl = config.get<string>('services.cmc.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: Response, claimsAsClaimant: DashboardClaimantItem[], claimDraftSaved: DashboardClaimantItem,
  claimsAsDefendant: DashboardDefendantItem[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object): void {
  res.render('features/dashboard/dashboard', {
    claimsAsClaimant,
    claimDraftSaved,
    claimsAsDefendant,
    responseDraftSaved,
    paginationArgumentClaimant,
    paginationArgumentDefendant,
    newOcmcClaimUrl: `${ocmcBaseUrl}/eligibility`,
  });
}

const dashboardController = Router();

dashboardController.get(DASHBOARD_URL, async function (req: AppRequest, res) {
  const user: UserDetails = req.session.user;
  /*This is a call to validate integration with legacy draft-store. This will have to be refined in the future
  to display the draft claims on the dashboard*/
  const claimsAsClaimant: DashboardClaimantItem[] = await civilServiceClient.getClaimsForClaimant(req);
  const claimsAsDefendant: DashboardDefendantItem[] = await civilServiceClient.getClaimsForDefendant(<AppRequest>req);
  const claimsAsDefendantWithStatus = updateStatus(claimsAsDefendant);
  const claimDraftSaved = await getOcmcDraftClaims(user?.accessToken);
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};
  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendantWithStatus, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
});

export default dashboardController;

// TODO: map to status
export const updateStatus = (claimsAsDefendant: DashboardDefendantItem[]): DashboardDefendantItem[] => {
  claimsAsDefendant.forEach(item => {
    switch (item.status) {
      case DashboardStatus.CLAIMANT_ACCEPTED_STATES_PAID:
        return t('PAGES.DASHBOARD.CLAIM_SETTLED');
      case DashboardStatus.PAID_IN_FULL_CCJ_CANCELLED:
      case DashboardStatus.PAID_IN_FULL_CCJ_SATISFIED:
        return t('PAGES.DASHBOARD.CONFIRMED_PAID', { claimantName: item.claimantName });
      case DashboardStatus.TRANSFERRED:
        return t('PAGES.DASHBOARD.CASE_SENT_COURT');
      case DashboardStatus.REDETERMINATION_BY_JUDGE:
        return t('PAGES.DASHBOARD.REQUESTED_CCJ', { claimantName: item.claimantName });
    }
  });
  return claimsAsDefendant;
};

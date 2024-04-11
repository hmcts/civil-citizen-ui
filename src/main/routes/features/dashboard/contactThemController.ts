import {NextFunction, Request, Response, Router} from 'express';
import {
  CITIZEN_CONTACT_THEM_URL,
  CLAIM_DETAILS_URL,
  DASHBOARD_URL,
} from '../../urls';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getAddress, getSolicitorName} from 'services/features/response/contactThem/contactThemService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {isCUIReleaseTwoEnabled, isDashboardServiceEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const citizenContactThemViewPathOld = 'features/dashboard/contact-them';
const citizenContactThemViewPathNew = 'features/dashboard/contact-them-new';
const contactThemController = Router();

async function renderView(res: Response, claim: Claim, claimId: string, claimantDetailsUrl: string, claimDetailsUrl: string, lng: string) {

  const party = claim?.isClaimant() ? claim?.respondent1 : claim?.applicant1;
  const otherPartyName = claim?.isClaimant() ? claim?.getDefendantFullName() : claim?.getClaimantFullName();
  const otherParty = claim?.isClaimant() ? t('PAGES.CONTACT_THEM.DEFENDANT', {lng}) : t('PAGES.CONTACT_THEM.CLAIMANT', {lng});
  const pageTitle = claim?.isClaimant() ? 'PAGES.CONTACT_THEM.PAGE_TITLE_DEFENDANT' : 'PAGES.CONTACT_THEM.PAGE_TITLE_CLAIMANT';

  const address = getAddress(party);

  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  const showInR1= !isReleaseTwoEnabled;
  const isDashboardEnabled = await isDashboardServiceEnabled();
  const citizenContactThemViewPath = isDashboardEnabled ? citizenContactThemViewPathNew : citizenContactThemViewPathOld;
  res.render(citizenContactThemViewPath, {
    claim,
    claimantDetailsUrl,
    claimDetailsUrl,
    address: address,
    solicitorName: getSolicitorName(claim),
    otherPartyName,
    otherParty,
    party,
    showInR1,
    pageCaption: 'PAGES.CONTACT_THEM.THE_CLAIM',
    pageTitle,
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
    dashboardUrl: DASHBOARD_URL,
  });
}

contactThemController.get(
  CITIZEN_CONTACT_THEM_URL, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claimId = req.params.id;
      const claim: Claim = await getClaimById(claimId, req, true);
      const claimantDetailsUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL);
      const claimDetailsUrl = constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL);
      renderView(res, claim, claimId, claimantDetailsUrl, claimDetailsUrl, lang);
    } catch (error) {
      next(error);
    }
  });

export default contactThemController;

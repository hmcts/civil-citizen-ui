import { NextFunction, Request, Response, Router } from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_DEFENDANT_INFO,
} from '../../urls';
import { Claim } from 'models/claim';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import {getAddress, getRespondentSolicitorAddress} from 'services/features/response/contactThem/contactThemService';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import {
  isDefendantNoCOnlineForCase,
} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
const viewDefendantInformation = 'features/dashboard/contact-them-new';
const viewDefendantInformationController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(res: Response, claim: Claim, claimId: string) {
  const pageTitle = 'PAGES.CONTACT_THEM.PAGE_TITLE_DEFENDANT';
  const isDefNoCOnlineForCase = await isDefendantNoCOnlineForCase(claim.submittedDate);
  const isLipvLrCase = isDefNoCOnlineForCase && claim.isLRDefendant();
  const defendantLRName = isLipvLrCase ? claim.respondentSolicitorDetails?.orgName : undefined;
  const otherPartyName = isLipvLrCase ? 'PAGES.CONTACT_THEM.DEFENDANT_LR' : claim?.getDefendantFullName();
  const party =  isLipvLrCase ? undefined : claim?.respondent1;
  const solicitorEmailId = isLipvLrCase ? claim?.respondentSolicitor1EmailAddress : undefined;

  res.render(viewDefendantInformation, {
    address: isLipvLrCase ? getRespondentSolicitorAddress(claim) : getAddress(party),
    party,
    otherPartyName,
    pageCaption: 'PAGES.CONTACT_THEM.THE_RESPONSE',
    pageTitle,
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
    solicitorEmailId,
    defendantLRName,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
}

viewDefendantInformationController.get(
  VIEW_DEFENDANT_INFO, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      await renderView(res, claim, claimId);
    } catch (error) {
      next(error);
    }
  });

export default viewDefendantInformationController;

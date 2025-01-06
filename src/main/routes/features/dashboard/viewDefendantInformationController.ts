import { NextFunction, Request, Response, Router } from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_DEFENDANT_INFO,
} from '../../urls';
import { Claim } from 'models/claim';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import {getAddress, getRespondentSolicitorAddress} from 'services/features/response/contactThem/contactThemService';
import { getClaimById } from 'modules/utilityService';
import { caseNumberPrettify } from 'common/utils/stringUtils';

const viewDefendantInformation = 'features/dashboard/contact-them-new';
const viewDefendantInformationController = Router();

async function renderView(res: Response, claim: Claim, claimId: string) {

  const pageTitle = 'PAGES.CONTACT_THEM.PAGE_TITLE_DEFENDANT';
  const defendantLRName = claim.isLRDefendant() ? claim.respondentSolicitorDetails?.orgName : undefined;
  const otherPartyName = claim.isLRDefendant() ? 'PAGES.CONTACT_THEM.DEFENDANT_LR' : claim?.getDefendantFullName();
  const party =  claim.isLRDefendant() ? undefined : claim?.respondent1;
  const solicitorEmailId = claim?.respondentSolicitor1EmailAddress;

  res.render(viewDefendantInformation, {
    address: claim.isLRDefendant() ? getRespondentSolicitorAddress(claim) : getAddress(party),
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
      const claim: Claim = await getClaimById(claimId, req, true);
      renderView(res, claim, claimId);
    } catch (error) {
      next(error);
    }
  });

export default viewDefendantInformationController;

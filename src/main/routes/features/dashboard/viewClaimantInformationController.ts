import { NextFunction, Request, Response, Router } from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_CLAIMANT_INFO,

} from '../../urls';
import { Claim } from 'models/claim';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { getAddress } from 'services/features/response/contactThem/contactThemService';
import { getClaimById } from 'modules/utilityService';
import { caseNumberPrettify } from 'common/utils/stringUtils';

const viewClaimantInformation = 'features/dashboard/contact-them-new';
const viewClaimantInformationController = Router();

async function renderView(res: Response, claim: Claim, claimId: string) {

  const pageTitle = 'PAGES.CONTACT_THEM.PAGE_TITLE_CLAIMANT';
  const otherPartyName = claim?.getClaimantFullName();
  const party = claim?.applicant1;

  res.render(viewClaimantInformation, {
    address: getAddress(party),
    party,
    otherPartyName,
    pageCaption: 'PAGES.CONTACT_THEM.THE_CLAIM',
    pageTitle,
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
}

viewClaimantInformationController.get(
  VIEW_CLAIMANT_INFO, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim: Claim = await getClaimById(claimId, req, true);
      renderView(res, claim, claimId);
    } catch (error) {
      next(error);
    }
  });

export default viewClaimantInformationController;

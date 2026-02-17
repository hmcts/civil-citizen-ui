import { NextFunction, Request, Response, Router } from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_CLAIMANT_INFO,

} from '../../urls';
import { Claim } from 'models/claim';
import { CCDClaim } from 'models/civilClaimResponse';
import { Email } from 'models/Email';
import { PartyPhone } from 'models/PartyPhone';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { getAddress } from 'services/features/response/contactThem/contactThemService';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const viewClaimantInformation = 'features/dashboard/contact-them-new';
const viewClaimantInformationController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(res: Response, claim: Claim, claimId: string) {

  const pageTitle = 'PAGES.CONTACT_THEM.PAGE_TITLE_CLAIMANT';
  const otherPartyName = claim?.getClaimantFullName();
  const party = claim?.applicant1;

  if (party) {
    if (!party.emailAddress?.emailAddress) {
      const claimantEmail = (claim as unknown as CCDClaim)?.claimantUserDetails?.email;
      if (claimantEmail) {
        party.emailAddress = new Email(claimantEmail);
      }
    }
    if (!party.partyPhone?.phone) {
      const claimantPhone = claim.contactNumberFromClaimantResponse;
      if (claimantPhone) {
        party.partyPhone = new PartyPhone(claimantPhone, true);
      }
    }
  }

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
      const claim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      renderView(res, claim, claimId);
    } catch (error) {
      next(error);
    }
  });

export default viewClaimantInformationController;

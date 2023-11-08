import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_CONTACT_THEM_URL, CLAIM_DETAILS_URL} from '../../urls';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getAddress, getSolicitorName} from 'services/features/response/contactThem/contactThemService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {isCUIReleaseTwoEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

const citizenContactThemViewPath = 'features/dashboard/contact-them';
const contactThemController = Router();

async function renderView(res: Response, claim: Claim, claimantDetailsUrl: string, claimDetailsUrl: string, lng: string) {

  const party = claim?.isClaimant() ? claim?.respondent1 : claim?.applicant1;
  const otherPartyName = claim?.isClaimant() ? claim?.getDefendantFullName() : claim?.getClaimantFullName();
  const otherParty = claim?.isClaimant() ? t('PAGES.CONTACT_THEM.DEFENDANT', {lng}) : t('PAGES.CONTACT_THEM.CLAIMANT', {lng});

  const address = getAddress(party);

  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  const showInR1= !isReleaseTwoEnabled;
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
      renderView(res, claim, claimantDetailsUrl, claimDetailsUrl, lang);
    } catch (error) {
      next(error);
    }
  });

export default contactThemController;

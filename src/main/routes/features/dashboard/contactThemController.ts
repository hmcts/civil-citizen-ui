import {NextFunction, Request, Response, Router} from 'express';
import { CITIZEN_CONTACT_THEM_URL } from '../../urls';
import {Claim} from 'models/claim';
import {getAddress, getSolicitorName} from 'services/features/response/contactThem/contactThemService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';

const citizenContactThemViewPath = 'features/dashboard/contact-them';
const contactThemController = Router();

async function renderView(res: Response, claim: Claim, lng: string) {

  const party = claim?.isClaimant() ? claim?.respondent1 : claim?.applicant1;
  const otherPartyName = claim?.isClaimant() ? claim?.getDefendantFullName() : claim?.getClaimantFullName();
  const otherParty = claim?.isClaimant() ? t('PAGES.CONTACT_THEM.DEFENDANT', { lng }) : t('PAGES.CONTACT_THEM.CLAIMANT', { lng });

  const address = getAddress(party);

  res.render(citizenContactThemViewPath, {
    claim,
    address: address,
    solicitorName: getSolicitorName(claim),
    otherPartyName,
    otherParty,
    party,
  });
}

contactThemController.get(
  CITIZEN_CONTACT_THEM_URL, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claimId = req.params.id;
      const claim: Claim = await getClaimById(claimId, req, true);
      renderView(res, claim, lang);
    } catch (error) {
      next(error);
    }
  });

export default contactThemController;

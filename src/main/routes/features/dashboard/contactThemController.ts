import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_CONTACT_THEM_URL, CLAIM_DETAILS_URL} from '../../urls';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {getAddress, getSolicitorName} from '../../../../main/services/features/response/contactThem/contactThemService';
import {getClaimById} from 'modules/utilityService';

const citizenContactThemViewPath = 'features/dashboard/contact-them';
const contactThemController = Router();

function renderView(res: Response, claim: Claim, claimantDetailsUrl: string, claimDetailsUrl: string): void {
  res.render(citizenContactThemViewPath, {
    claim,
    claimantDetailsUrl,
    claimDetailsUrl,
    address: getAddress(claim),
    solicitorName: getSolicitorName(claim),
  });
}

contactThemController.get(
  CITIZEN_CONTACT_THEM_URL, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim: Claim = await getClaimById(claimId, req, true);
      const claimantDetailsUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL);
      const claimDetailsUrl = constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL);
      renderView(res, claim, claimantDetailsUrl, claimDetailsUrl);
    } catch (error) {
      next(error);
    }
  });

export default contactThemController;

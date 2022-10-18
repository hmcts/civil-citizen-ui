import {NextFunction, Router} from 'express';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../urls';
import {getDraftClaimFromStore} from '../../../modules/draft-store/draftStoreService';

const freeTelephoneMediationController = Router();
const citizenFreeTelephoneMediationViewPath = 'features/mediation/free-telephone-mediation';

freeTelephoneMediationController.get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL, async (req, res, next: NextFunction) => {
  try {
    const civilClaim = await getDraftClaimFromStore(req.params.id);
    res.render(citizenFreeTelephoneMediationViewPath,
      {isBusiness: (civilClaim.case_data.respondent1.type === 'ORGANISATION' || civilClaim.case_data.respondent1.type === 'COMPANY')},
    );
  } catch (error) {
    next(error);
  }
});

export default freeTelephoneMediationController;

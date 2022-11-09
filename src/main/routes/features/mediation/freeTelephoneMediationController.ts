import {NextFunction, Router} from 'express';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';

const freeTelephoneMediationController = Router();
const citizenFreeTelephoneMediationViewPath = 'features/mediation/free-telephone-mediation';

freeTelephoneMediationController.get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL, async (req, res, next: NextFunction) => {
  try {
    const civilClaim = await getCaseDataFromStore(req.params.id);
    res.render(citizenFreeTelephoneMediationViewPath,
      {isBusiness: civilClaim?.isBusiness()},
    );
  } catch (error) {
    next(error);
  }
});

export default freeTelephoneMediationController;

import {NextFunction, RequestHandler, Router} from 'express';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';

const freeTelephoneMediationController = Router();
const citizenFreeTelephoneMediationViewPath = 'features/mediation/free-telephone-mediation';

freeTelephoneMediationController.get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const civilClaim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    res.render(citizenFreeTelephoneMediationViewPath,
      {isBusiness: isBusinessUser(civilClaim)},
    );
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const isBusinessUser=(claim: Claim): boolean => {
  if(claim.isClaimant()){
    return claim.isClaimantBusiness();
  }
  return claim?.isBusiness();
};

export default freeTelephoneMediationController;

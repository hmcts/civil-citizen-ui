import * as express from 'express';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../../urls';
import {getDraftClaimFromStore} from '../../../../modules/draft-store/draftStoreService';

const freeTelephoneMediationController = express.Router();
const citizenFreeTelephoneMediationViewPath = 'features/response/mediation/free-telephone-mediation';

freeTelephoneMediationController.get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL, async (req, res) => {
  try {
    const civilClaim = await getDraftClaimFromStore(req.params.id);
    res.render(citizenFreeTelephoneMediationViewPath,
      { isBusiness: (civilClaim.case_data.applicant1.type === 'ORGANISATION' || civilClaim.case_data.applicant1.type === 'COMPANY') },
    );
  }
  catch (error) {
    res.status(500).send({error: error.message});
  }

});

export default freeTelephoneMediationController;

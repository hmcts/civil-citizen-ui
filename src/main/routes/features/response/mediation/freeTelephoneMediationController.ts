import * as express from 'express';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../../urls';

const freeTelephoneMediationController = express.Router();
const citizenFreeTelephoneMediationViewPath = 'features/response/mediation/free-telephone-mediation';

freeTelephoneMediationController.get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL, (_req, res) => {
  res.render(citizenFreeTelephoneMediationViewPath);
});

export default freeTelephoneMediationController;

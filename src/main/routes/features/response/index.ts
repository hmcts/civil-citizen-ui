import * as express from 'express';
import {CLAIM_DETAILS_URL, CITIZEN_DETAILS_URL, CONFIRM_CITIZEN_DETAILS_URL} from '../../urls';
const confirmDetailsController = require('../../../controllers/features/response/confirm-details');
const router = express.Router();
router.get(CLAIM_DETAILS_URL, confirmDetailsController.getClaimDetails);
router.get(CITIZEN_DETAILS_URL, confirmDetailsController.getCitizenDetails);
router.post(CONFIRM_CITIZEN_DETAILS_URL, confirmDetailsController.formHandler);

export default router;

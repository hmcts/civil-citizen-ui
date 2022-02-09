import * as express from 'express';
const confirmDetailsController = require('../../../controllers/features/response/confirm-details');
const router = express.Router();
router.get('/case/:id/response/claim-details', confirmDetailsController.getClaimDetails);
router.get('/case/:id/response/your-details', confirmDetailsController.getCitizenDetails);
router.post('/confirm-your-details', confirmDetailsController.formHandler);

export default router;

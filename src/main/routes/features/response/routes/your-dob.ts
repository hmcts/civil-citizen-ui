import * as express from 'express';

const router = express.Router();
const confirmDetailsController = require('../../../../controllers/features/response/confirm-details');

function renderView (res: express.Response): void {
  res.render('features/response/routes/your-dob');
}
/* tslint:disable:no-default-export */
router.get('/your-dob', (req: express.Request, res: express.Response) => {
  renderView(res);
});
router.post('/confirm-your-dateOfBirth', confirmDetailsController.formDateHandler);
export default router;




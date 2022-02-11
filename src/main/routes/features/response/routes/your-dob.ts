import * as express from 'express';

//import { ErrorHandling } from 'common/errorHandling';
//import {Claim} from 'common/models/claim';

const router = express.Router();

function renderView (res: express.Response): void {
  res.render('features/response/routes/your-dob');
}
/* tslint:disable:no-default-export */
router.get('/your-dob', (req: express.Request, res: express.Response) => {
  renderView(res);
});

router.post('/your-dob',
  (req, res) => {
    renderView(res);
  });

export default router;




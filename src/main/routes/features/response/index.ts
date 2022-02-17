import * as express from 'express';
import {CitizenDob} from '../../../common/form/models/citizenDob';
import {Validator,ValidationError} from 'class-validator';


const router = express.Router();
let citizenDob = new CitizenDob();

function renderView (res: express.Response,form:CitizenDob, error?:ValidationError[]): void {
  if (error) {
    console.log('renderView: ', error.length);
  }
  res.render('features/response/your-dob', {form:form});
}
/* tslint:disable:no-default-export */
router.get('/your-dob', (req: express.Request, res: express.Response) => {
  renderView(res, citizenDob);
});

router.post('/your-dob',
  (req, res) => {

    console.info('response/index ... your-dob ---- DefendantDetailsDob model');
    console.log('REQ BODY', req.body);
    const birthdate: Date = new Date();
    birthdate.setFullYear(req.body.year,req.body.month,req.body.day);
    citizenDob = new CitizenDob(birthdate,req.body.year,req.body.month,req.body.day);
    console.log('birthdate: ', birthdate);

    const validator = new Validator();
    const error: ValidationError[] = validator.validateSync(citizenDob);

    if (error && error.length > 0){
      citizenDob.error=error;
      console.log('citizenDob: ', citizenDob);
      console.log('error: ', error);
      console.log('error.length: ', error.length);
      renderView(res, citizenDob, error);
    } else {
      // temporary to show error removed, should forward to next page in sequence
      //renderView(res, citizenDob, error);
    }
  });

export default router;

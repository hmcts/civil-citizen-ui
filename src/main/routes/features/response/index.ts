import * as express from 'express';
import {CitizenDob} from '../../../common/form/models/citizenDob';
import {Validator} from 'class-validator';
import {DOB_URL} from 'routes/urls';

const router = express.Router();
let citizenDob = new CitizenDob();

function renderView (res: express.Response,form:CitizenDob): void {
  res.render('features/response/your-dob', {form:form});
}

router.get(DOB_URL, (req: express.Request, res: express.Response) => {
  renderView(res, citizenDob);
});

router.post(DOB_URL,
  (req, res) => {

    const birthdate: Date = new Date();
    const day = Number(req.body.day);
    const month = Number(req.body.month);
    const year = Number(req.body.year);

    birthdate.setFullYear(year,month,day);
    citizenDob = new CitizenDob(birthdate,year,month,day);
    const validator = new Validator();
    citizenDob.error = validator.validateSync(citizenDob);

    if (citizenDob.error && citizenDob.error.length > 0){
      renderView(res, citizenDob);
    } else {
      res.redirect('/template');
    }
  });

export default router;

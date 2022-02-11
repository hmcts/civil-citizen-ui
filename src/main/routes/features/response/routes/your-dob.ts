import * as express from 'express';

//import { ErrorHandling } from 'common/errorHandling';
import {Claim} from 'common/models/claim';

function renderView (res: express.Response) {
  res.render('' );
}

/* tslint:disable:no-default-export */
export default express.Router()
  .get('', (req: express.Request, res: express.Response) => {
    if (Claim.name === undefined) {
      res.redirect('');
    }else{
      renderView(res);
    }
  });




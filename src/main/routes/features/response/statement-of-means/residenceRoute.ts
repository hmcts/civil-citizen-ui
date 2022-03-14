import express from 'express';
import assert from 'assert';
import {Residence} from '../../../../common/form/models/statement-of-means/residence';
import {DASHBOARD_URL, RESIDENCE_URL} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {DraftResponse} from '../../../../common/form/models/draftResponse';
import {ValidationError, Validator} from 'class-validator';
import {ResidenceType} from '../../../../common/form/models/statement-of-means/residenceType';

const residenceViewPath = 'features/response/statement-of-means/residence';

const residenceRoute = express.Router();
residenceRoute
  .get(
    RESIDENCE_URL,
    (req: express.Request, res: express.Response) => {
      let draftResponse: DraftResponse = undefined;
      req.app.locals.draftStoreClient.get('externalId').then((_object: string) => {

        let jsonData = undefined;
        if (_object) {
          jsonData = JSON.parse(_object);
        }
        draftResponse = Object.assign(new DraftResponse(), jsonData);
        assert(draftResponse);

        res.render(residenceViewPath, {
          form: new GenericForm(draftResponse.residence),
        });
      });
    })
  .post(
    RESIDENCE_URL,
    (req: express.Request, res: express.Response) => {
      const residence = new Residence(ResidenceType.valueOf(req.body.type), req.body.housingDetails);
      const form: GenericForm<Residence> = new GenericForm(residence);
      const validator = new Validator();
      const errors: ValidationError[] = validator.validateSync(form.model);
      if (errors && errors.length > 0) {
        form.errors = errors;
        res.render(residenceViewPath, {
          form: form,
        });
      } else {
        let draftResponse: DraftResponse = undefined;

        req.app.locals.draftStoreClient.get('externalId').then((_response: string) => {
          if (!_response) {
            draftResponse = new DraftResponse();
            draftResponse.externalId = 'externalId';
            draftResponse.residence = residence;
          } else {
            draftResponse = JSON.parse(_response);
          }
          assert(draftResponse);
          draftResponse.residence = residence;
          req.app.locals.draftStoreClient.set('externalId', JSON.stringify(draftResponse)).then(() => {
            // TODO: should redirect to Partner URL (/statement-of-means/partner/partner) once that page is built
            res.redirect(DASHBOARD_URL);
          });
        });
      }
    },
  );

export default residenceRoute;

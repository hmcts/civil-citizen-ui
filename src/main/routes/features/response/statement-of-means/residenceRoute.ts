import express from 'express';
import {Residence} from 'common/form/models/statement-of-means/residence';
import {DASHBOARD_URL, RESIDENCE_URL} from '../../../../routes/urls';
import {Form} from '../../../../common/form/models/form';
import {DraftResponse} from '../../../../common/form/models/draftResponse';

const residenceViewPath = 'features/response/statement-of-means/residence';

const residenceRoute = express.Router();
residenceRoute
  .get(
    RESIDENCE_URL,
    (req: express.Request, res: express.Response) => {
      let draftResponse: DraftResponse = undefined;
      (async () => {
        draftResponse = await req.app.locals.draftStoreClient.get('externalId');
      })();
      if (!draftResponse) {
        draftResponse = new DraftResponse();
      }
      res.render(residenceViewPath, {
        form: new Form(draftResponse.residence),
      });
    })
  .post(
    RESIDENCE_URL,
    (req: express.Request, res: express.Response) => {
      const form: Form<Residence> = req.body;
      if (form.hasErrors()) {
        res.render(residenceViewPath, {
          form: form,
        });
      } else {
        let draftResponse: DraftResponse = undefined;

        (async () => {
          draftResponse = await req.app.locals.draftStoreClient.get('externalId');
        })();

        draftResponse.residence = form.model;
        req.app.locals.draftStoreClient.set(draftResponse.externalId, JSON.stringify(draftResponse)).then(() => {
          // TODO: should redirect to Partner URL (/statement-of-means/partner/partner) once that page is built
          res.redirect(DASHBOARD_URL);
        });
      }
    },
  );

export default residenceRoute;

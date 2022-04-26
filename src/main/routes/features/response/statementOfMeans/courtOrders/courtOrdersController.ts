import express from 'express';
import {
  CITIZEN_COURT_ORDERS_URL,
  CITIZEN_DEBTS_URL,
} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import courtOrdersService from '../../../../../services/features/response/statementOfMeans/courtOrders/courtOrdersService';
import {CourtOrders} from '../../../../../common/form/models/statementOfMeans/courtOrders/courtOrders';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('courtOrdersController');
const residenceViewPath = 'features/response/statementOfMeans/courtOrders/court-orders';

const courtOrdersController = express.Router();
courtOrdersController
  .get(
    CITIZEN_COURT_ORDERS_URL,
    async (req: express.Request, res: express.Response) => {
      try {
        const courtOrders: CourtOrders = await courtOrdersService.getCourtOrders(req.params.id);
        res.render(residenceViewPath, {
          form: new GenericForm(courtOrders),
        });
      } catch (error) {
        logger.error(`${error.stack || error}`);
        res.status(500).send({errorMessage: error.message, errorStack: error.stack});
      }
    })
  .post(
    CITIZEN_COURT_ORDERS_URL,
    async (req: express.Request, res: express.Response) => {
      const courtOrders = courtOrdersService.buildCourtOrders(req.body);
      courtOrdersService.removeEmptyCourtOrders(courtOrders);
      const form = new GenericForm(courtOrders);
      form.validateSync();

      if (form.hasErrors()) {
        res.render(residenceViewPath, {
          form: form,
        });
      } else {
        try {
          await courtOrdersService.saveCourtOrders(req.params.id, courtOrders);
          res.redirect(CITIZEN_DEBTS_URL.replace(':id', req.params.id));
        } catch (error) {
          logger.error(`${error.stack || error}`);
          res.status(500).send({errorMessage: error.message, errorStack: error.stack});
        }
      }
    });

export default courtOrdersController;

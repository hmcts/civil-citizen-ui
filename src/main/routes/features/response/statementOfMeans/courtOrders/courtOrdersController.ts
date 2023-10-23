import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_PRIORITY_DEBTS_URL} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {courtOrdersService}
  from '../../../../../services/features/response/statementOfMeans/courtOrders/courtOrdersService';
import {CourtOrders} from '../../../../../common/form/models/statementOfMeans/courtOrders/courtOrders';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const residenceViewPath = 'features/response/statementOfMeans/courtOrders/court-orders';

const courtOrdersController = Router();
courtOrdersController
  .get(
    CITIZEN_COURT_ORDERS_URL,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const courtOrders: CourtOrders = await courtOrdersService.getCourtOrders(generateRedisKey(<AppRequest>req));
        res.render(residenceViewPath, {
          form: new GenericForm(courtOrders),
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_COURT_ORDERS_URL,
    async (req: Request, res: Response, next: NextFunction) => {
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
          await courtOrdersService.saveCourtOrders(generateRedisKey(<AppRequest>req), courtOrders);
          res.redirect(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', req.params.id));
        } catch (error) {
          next(error);
        }
      }
    });

export default courtOrdersController;

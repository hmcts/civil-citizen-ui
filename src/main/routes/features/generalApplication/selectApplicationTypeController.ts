import {NextFunction, RequestHandler, Response, Router} from 'express';
import {SELECT_APPLICATION_TYPE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';

const selectApplicationTypeController = Router();
const viewPath = 'features/generalApplication/select-application-type';

selectApplicationTypeController.get(SELECT_APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(null);
    res.render(viewPath, {form});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default selectApplicationTypeController;

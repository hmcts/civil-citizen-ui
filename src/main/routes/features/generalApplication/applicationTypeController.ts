import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {getGeneralApplication, saveApplicationType} from 'services/features/generalApplication/generalApplicationService';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const generalApplication = await getGeneralApplication(claimId);
    const form = new GenericForm(generalApplication.applicationType);
    const cancelUrl = 'test';
    const backLinkUrl = 'test';
    res.render(viewPath, {form, cancelUrl, backLinkUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applicationTypeController.post(APPLICATION_TYPE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const cancelUrl = 'test';
    const backLinkUrl = 'test';
    let applicationType = null;
    if (req.body.applicationType === ApplicationTypeOption.OTHER) {
      applicationType = new ApplicationType(req.body.applicationTypeOther);
    } else {
      applicationType = new ApplicationType(req.body.applicationType);
    }
    const form = new GenericForm(applicationType);

    await form.validate();
    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl });
    } else {
      await saveApplicationType(claimId, applicationType);
      res.redirect('test');
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationTypeController;

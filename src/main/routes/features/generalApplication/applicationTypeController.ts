import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {saveApplicationType} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';
const cancelUrl = 'test'; // TODO: add url
const backLinkUrl = 'test'; // TODO: add url

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applicationType = new ApplicationType(claim.generalApplication?.applicationType?.option);
    const form = new GenericForm(applicationType);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      isOtherSelected: applicationType.isOtherSelected(),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applicationTypeController.post(APPLICATION_TYPE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    let applicationType = null;
    
    if (req.body.option === ApplicationTypeOption.OTHER) {
      applicationType = new ApplicationType(req.body.optionOther);
    } else {
      applicationType = new ApplicationType(req.body.option);
    }

    const form = new GenericForm(applicationType);
    await form.validate();
    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl });
    } else {
      await saveApplicationType(redisKey, applicationType);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationTypeController;

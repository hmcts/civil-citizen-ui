import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {saveApplicationType} from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
// import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { getClaimById } from 'modules/utilityService';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';
const cancelUrl = 'test';
const backLinkUrl = 'test';

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    // const claimId = generateRedisKey(<AppRequest>req);

    const claim = await getClaimById(claimId, req, true);
    // const generalApplication = new GeneralApplication(claim.generalApplication.applicationType);
    // const generalApplication = await getGeneralApplication(redisKey);
    const applicationType = new ApplicationType(claim.generalApplication?.applicationType?.option)
    console.log('GA',claim.generalApplication);
    
    const form = new GenericForm(applicationType);
    console.log('form: ', form);

    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      isOtherSelected: applicationType.isOtherSelected()
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applicationTypeController.post(APPLICATION_TYPE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    // const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);

    let applicationType = null;
    console.log('body: ', req.body);

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
    console.log('save: ', applicationType);

      await saveApplicationType(redisKey, applicationType);
      res.redirect('test');
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationTypeController;

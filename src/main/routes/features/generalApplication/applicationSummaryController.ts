import config from 'config';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { GA_APPLICATION_SUMMARY_URL } from 'routes/urls';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { GeneralApplicationClient } from 'client/generalApplicationClient';
// import { t } from 'i18next';
// import { ApplicationTypeOption, selectedApplicationType } from 'common/models/generalApplication/applicationType';

const applicationSummaryController = Router();
const viewPath = 'features/generalApplication/applications-summary';

const civilServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const civilServiceClient: GeneralApplicationClient = new GeneralApplicationClient(civilServiceApiBaseUrl);

applicationSummaryController.get(GA_APPLICATION_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    // const lng = req.query.lang || req.cookies.lang;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = 'test'; // TODO: add url
    const applications = await civilServiceClient.getApplications(req);
    console.log('applications: ', applications);

    const applicationsRows: any[] = [];
    applications.forEach(application => {
      
      // const types = application.generalAppType.types.map((type: ApplicationTypeOption) => {
      //     return t(selectedApplicationType[type], {lng})
      // });
      // console.log('types: ', types);


      applicationsRows.push({
        status: application.state,
        types: application.applicationTypes,
        id: application.id,
        createdDate: application.createdDate,
      })
    });
    
    res.render(viewPath, {
      cancelUrl,
      backLinkUrl,
      applicationsRows,
    });
  } catch (error) {
    next(error);
  }
});

export default applicationSummaryController;

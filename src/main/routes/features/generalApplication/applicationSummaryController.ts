import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { GA_APPLICATION_SUMMARY_URL } from 'routes/urls';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import config from 'config';
import { GeneralApplicationClient } from 'client/generalApplicationClient';
// import { Claim } from 'common/models/claim';

const applicationSummaryController = Router();
const viewPath = 'features/generalApplication/application-summary';

const civilServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const civilServiceClient: GeneralApplicationClient = new GeneralApplicationClient(civilServiceApiBaseUrl);

applicationSummaryController.get(GA_APPLICATION_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    // const lang = req.query.lang || req.cookies.lang;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = 'test'; // TODO: add url
    const applications = civilServiceClient.getApplications(req);
    console.log('applications: ', applications);
    
    res.render(viewPath, {
      cancelUrl,
      backLinkUrl,
    });
  } catch (error) {
    next(error);
  }
});

// applicationSummaryController.post(GA_APPLICATION_SUMMARY_URL, (async (req: AppRequest<RespondentAgreement>, res: Response, next: NextFunction) => {
//   try {
//     const { option, reasonForDisagreement } = req.body;
//     const respondentAgreement = new RespondentAgreement(option, reasonForDisagreement);
//     const form = new GenericForm(respondentAgreement);
//     await form.validate();
//     if (form.hasErrors()) {
//       const claimId = req.params.id;
//       const redisKey = generateRedisKey(req);
//       const claim = await getCaseDataFromStore(redisKey);
//       // const lang = req.query.lang || req.cookies.lang;
//       return await renderView(claimId, claim, res);
//     }
//     await saveRespondentAgreement(generateRedisKey(req), respondentAgreement);
//     res.redirect('test'); // TODO: add url
//   } catch (error) {
//     next(error);
//   }
// }) as RequestHandler);

export default applicationSummaryController;

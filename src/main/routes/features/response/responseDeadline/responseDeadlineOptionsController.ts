import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  AGREED_TO_MORE_TIME_URL,
  RESPONSE_TASK_LIST_URL,
  REQUEST_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL, APPLICATION_TYPE_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {GenericForm} from 'form/models/genericForm';
import {ResponseDeadline, ResponseOptions} from 'form/models/responseDeadline';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {deadLineGuard} from 'routes/guards/deadLineGuard';
import {AppRequest} from 'common/models/AppRequest';
import {isCuiGaNroEnabled, isCUIReleaseTwoEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'app/client/civilServiceClient';
import config from 'config';

const responseDeadlineOptionsController = Router();
const responseDeadlineOptionsViewPath = 'features/response/response-deadline-options';
const responseDeadlineService = new ResponseDeadlineService();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('responseDeadlineOptionsController');

async function renderView(res: Response, form: GenericForm<ResponseDeadline>, claim: Claim, language: string, claimId: string): Promise<void> {
  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  const isGaNroEnabled = await isCuiGaNroEnabled();
  res.render(responseDeadlineOptionsViewPath, {
    form,
    responseDate: claim.formattedResponseDeadline(language),
    claimantName: claim.getClaimantFullName(),
    isReleaseTwoEnabled,
    applyGaApplication: constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL),
    isGaNroEnabled,
  });
}

const getDeadlineTime = (value?: Date | string): number | undefined => {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
};

const syncDeadlineFromClaimStore = async (req: AppRequest, claim: Claim, redisKey: string): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claimFromCivilService = await civilServiceClient.retrieveClaimDetails(claimId, req);
    const storeDeadline = getDeadlineTime(claimFromCivilService?.respondent1ResponseDeadline);
    const redisDeadline = getDeadlineTime(claim?.respondent1ResponseDeadline);

    if (storeDeadline && storeDeadline !== redisDeadline) {
      claim.respondent1ResponseDeadline = claimFromCivilService.respondent1ResponseDeadline;
      await saveDraftClaim(redisKey, claim, true);
    }
  } catch (error) {
    logger.error(`Error when syncing response deadline from claim store - ${error.message}`);
  }
  return claim;
};

responseDeadlineOptionsController.get(RESPONSE_DEADLINE_OPTIONS_URL, deadLineGuard,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim = await getCaseDataFromStore(redisKey);
      const syncedClaim = await syncDeadlineFromClaimStore(<AppRequest>req, claim, redisKey);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      renderView(res, new GenericForm(new ResponseDeadline(syncedClaim.responseDeadline?.option)), syncedClaim, lang, req.params.id);
    } catch (error) {
      logger.error(`Error when GET : response deadline options - ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

responseDeadlineOptionsController.post(RESPONSE_DEADLINE_OPTIONS_URL, deadLineGuard,
  ( async (req: Request, res: Response, next: NextFunction) => {
    try {
      let responseOption;
      let redirectUrl;
      const claimId = req.params.id;
      const redisKey = generateRedisKey(<AppRequest>req);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(redisKey);
      const syncedClaim = await syncDeadlineFromClaimStore(<AppRequest>req, claim, redisKey);
      switch (req.body['option']) {
        case 'already-agreed':
          responseOption = ResponseOptions.ALREADY_AGREED;
          redirectUrl = constructResponseUrlWithIdParams(claimId, AGREED_TO_MORE_TIME_URL);
          break;
        case 'no':
          responseOption = ResponseOptions.NO;
          redirectUrl = constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL);
          break;
        case 'request-refused':
          responseOption = ResponseOptions.REQUEST_REFUSED;
          redirectUrl = constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL);
          break;
        case 'yes':
          responseOption = ResponseOptions.YES;
          redirectUrl = constructResponseUrlWithIdParams(claimId, REQUEST_MORE_TIME_URL);
          break;
        default:
          responseOption = undefined;
      }
      const form = new GenericForm(new ResponseDeadline(responseOption));
      await form.validate();
      if (form.hasErrors()) {
        logger.info(`form has error - ${form.hasErrors()}`);
        renderView(res, form, syncedClaim, lang, claimId);
      } else {
        await responseDeadlineService.saveDeadlineResponse(redisKey, responseOption);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      logger.error(`Error when POST : response deadline options - ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

export default responseDeadlineOptionsController;

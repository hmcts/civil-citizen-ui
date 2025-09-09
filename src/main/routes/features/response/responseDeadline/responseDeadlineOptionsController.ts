import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  AGREED_TO_MORE_TIME_URL,
  RESPONSE_TASK_LIST_URL,
  REQUEST_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL, APPLICATION_TYPE_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {GenericForm} from 'form/models/genericForm';
import {ResponseDeadline, ResponseOptions} from 'form/models/responseDeadline';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {deadLineGuard} from 'routes/guards/deadLineGuard';
import {AppRequest} from 'common/models/AppRequest';
import {isCuiGaNroEnabled, isCUIReleaseTwoEnabled} from 'app/auth/launchdarkly/launchDarklyClient';

const responseDeadlineOptionsController = Router();
const responseDeadlineOptionsViewPath = 'features/response/response-deadline-options';
const responseDeadlineService = new ResponseDeadlineService();

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

responseDeadlineOptionsController.get(RESPONSE_DEADLINE_OPTIONS_URL, deadLineGuard,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      renderView(res, new GenericForm(new ResponseDeadline(claim.responseDeadline?.option)), claim, lang, req.params.id);
    } catch (error) {
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
        renderView(res, form, claim, lang, claimId);
      } else {
        await responseDeadlineService.saveDeadlineResponse(redisKey, responseOption);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default responseDeadlineOptionsController;

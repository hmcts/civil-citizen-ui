import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {RESPONSE_TASK_LIST_URL, REQUEST_MORE_TIME_URL, APPLICATION_TYPE_URL} from '../../urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {AdditionalTime, AdditionalTimeOptions} from 'form/models/additionalTime';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {deadLineGuard} from 'routes/guards/deadLineGuard';
import {AppRequest} from 'common/models/AppRequest';
import {isCuiGaNroEnabled, isCUIReleaseTwoEnabled} from 'app/auth/launchdarkly/launchDarklyClient';

const requestMoreTimeController = Router();
const requestMoreTimeViewPath = 'features/response/request-more-time';
const responseDeadlineService = new ResponseDeadlineService();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('requestMoreTimeController');

async function renderView(res: Response, form: GenericForm<AdditionalTime>, claim: Claim, language: string, claimId: string): Promise<void> {
  const isReleaseTwoEnabled = await isCUIReleaseTwoEnabled();
  const isGaNroEnabled = await isCuiGaNroEnabled();
  res.render(requestMoreTimeViewPath, {
    additionalTimeOptions: AdditionalTimeOptions,
    form,
    responseDate: claim.formattedResponseDeadline(language),
    claimantName: claim.getClaimantFullName(),
    isReleaseTwoEnabled,
    applyGaApplication: constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL),
    isGaNroEnabled,
  });
}

requestMoreTimeController.get(REQUEST_MORE_TIME_URL, deadLineGuard,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const language = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      renderView(res, new GenericForm(new AdditionalTime(claim.responseDeadline?.additionalTime)), claim, language, req.params.id);
    } catch (error) {
      logger.error(`Error when getting request more time -  ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

requestMoreTimeController.post(REQUEST_MORE_TIME_URL, deadLineGuard,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const language = req.query.lang ? req.query.lang : req.cookies.lang;
      const selectedOption = responseDeadlineService.getAdditionalTime(req.body.option);
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(redisKey);
      const form = new GenericForm(new AdditionalTime(selectedOption));
      await form.validate();
      if (form.hasErrors()) {
        renderView(res, form, claim, language, claimId);
      } else {
        await responseDeadlineService.saveAdditionalTime(redisKey, selectedOption);
        res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      }
    } catch (error) {
      logger.error(`Error when posting request more time -  ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

export default requestMoreTimeController;

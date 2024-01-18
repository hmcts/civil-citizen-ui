import config from 'config';
import {NextFunction, Request, RequestHandler, Response} from 'express';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseConfirmationGuard');

export const claimantResponseConfirmationGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
    const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
    const claim = await civilServiceClient.retrieveClaimDetails(req.params?.id, <AppRequest>req);
    if (claim.isClaimantIntentionPending() && ((!claim.claimantBilingualLanguagePreference) || claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.ENGLISH)) {
      logger.info('Redirecting to claimant response task list from ', req.url);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_TASK_LIST_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;

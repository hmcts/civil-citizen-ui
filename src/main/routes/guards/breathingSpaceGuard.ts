import {NextFunction, Request, RequestHandler, Response} from 'express';
import {AppRequest} from '../../common/models/AppRequest';
import {CivilServiceClient} from '../../app/client/civilServiceClient';
import {DASHBOARD_URL} from '../urls';
import config from 'config';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('breathingSpaceGuard');

export const breathingSpaceGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
    const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
    const claim = await civilServiceClient.retrieveClaimDetails(req.params?.id, <AppRequest>req);
    if (claim?.enterBreathing?.type) {
      logger.info('Redirecting to dashboard from ', req.url);
      res.redirect(DASHBOARD_URL);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;

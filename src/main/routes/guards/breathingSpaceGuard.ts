import {NextFunction, Request, RequestHandler, Response} from 'express';
import {AppRequest} from '../../common/models/AppRequest';
import {CivilServiceClient} from '../../app/client/civilServiceClient';
import {DASHBOARD_URL} from '../urls';
import config from 'config';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('breathingSpaceGuard');
const LiftUrl = '/breathing-space/respite-lifted';

export const breathingSpaceGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
    const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
    const claim = await civilServiceClient.retrieveClaimDetails(req.params?.id, <AppRequest>req);
    const isEnteringAllowed = !!claim.enterBreathing?.type;
    const isLiftAllowed = req.originalUrl.includes(LiftUrl);
    const isDashBoardUrlAllowed = (isEnteringAllowed && !isLiftAllowed) || (!isEnteringAllowed && isLiftAllowed);
    if (isDashBoardUrlAllowed) {
      logger.info('Redirecting to dashboard from ', req.url);
      res.redirect(DASHBOARD_URL);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;

import {NextFunction, Request, Response} from 'express';
import {AppRequest} from '../../common/models/AppRequest';
import {CivilServiceClient} from '../../app/client/civilServiceClient';
import {DASHBOARD_URL} from '../../routes/urls';
import config from 'config';

export const responseSubmitDateGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
    const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
    const submittedClaim = await civilServiceClient.retrieveClaimDetails(req.params?.id, <AppRequest>req);
    return submittedClaim?.respondent1ResponseDate
      ? next()
      : res.redirect(DASHBOARD_URL);
  } catch (error) {
    next(error);
  }
};

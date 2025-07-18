import {isQueryManagementEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {QM_START_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {CaseState} from 'form/models/claimDetails';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const contactUsGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const isClaimOffLine = [CaseState.PENDING_CASE_ISSUED, CaseState.CASE_DISMISSED, CaseState.PROCEEDS_IN_HERITAGE_SYSTEM];
  const whitelist = ['/eligibility', '/first-contact', '/testing-support', '/claim'];
  const isWhitelisted = whitelist.some((item) => req.path.startsWith(item));
  if (isWhitelisted) {
    return next();
  }

  const pathId = req.path.split('/').filter(Boolean)[1] || undefined; // get claim id

  const requestId = /^\d+$/.test(pathId) ? pathId : undefined;

  if(requestId){
    req.params.id = requestId; // ensure req.params.id is set for further processing
    const caseData: Claim = await civilServiceClient.retrieveClaimDetails(requestId, <AppRequest>req);
    if (caseData || !caseData.isEmpty()) {
      const isQMFlagEnabled = await isQueryManagementEnabled(caseData?.submittedDate);
      delete req.params.id ; // remove params.id to avoid confusion in the next middleware
      if(isQMFlagEnabled && !isClaimOffLine.includes(caseData.ccdState)) {
        res.locals.showCreateQuery = true;
        res.locals.isQMFlagEnabled = true;
        res.locals.disableSendMessage = true;
        res.locals.qmStartUrl = constructResponseUrlWithIdParams(requestId, QM_START_URL)+'?linkFrom=start';
      }
    }
  }
  next();
};


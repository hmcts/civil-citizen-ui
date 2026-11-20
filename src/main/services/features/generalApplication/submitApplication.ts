import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {
  translateCoScApplicationToCCD,
  translateDraftApplicationToCCD,
} from 'services/translation/generalApplication/ccdTranslation';
import {getClaimById} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import { Claim } from 'common/models/claim';
import {YesNo} from 'form/models/yesNo';
import {InformOtherParties} from 'models/generalApplication/informOtherParties';
import {assertValidApplicationTypes} from 'models/generalApplication/applicationType';
import {normalizeRouteParam as normaliseRouteParam, RouteParam} from 'common/utils/routeParamUtils';
import {deleteFieldDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {deleteDurableApplicationDraft} from 'modules/draft-store/generalApplication/generalApplicationDraftSync';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const clearSubmittedApplicationDraft = async (req: AppRequest, caseId: string): Promise<void> => {
  const redisKey = generateRedisKey(req);
  const draftClaim = await getCaseDataFromStore(redisKey, true);
  if (draftClaim?.generalApplication) {
    await deleteFieldDraftClaimFromStore(redisKey, draftClaim, 'generalApplication', req.session?.user?.id);
  }
  await deleteDurableApplicationDraft(req, caseId);
};

const logSubmitApplicationError = (err: unknown, claimId: RouteParam, eventName: string): void => {
  const error = err as Error & { response?: { status?: number } };
  logger.error(`General application submit failed (event=${eventName}, claimId=${normaliseRouteParam(claimId)}, status=${error.response?.status}, message=${error.message})`);
};

export const submitApplication = async (req: AppRequest): Promise<Claim> => {
  const claimId = req.params.id;
  try {
    const claim = await getClaimById(claimId, req, true);
    assertValidApplicationTypes(claim.generalApplication?.applicationTypes);
    const ccdApplication = translateDraftApplicationToCCD(claim.generalApplication);
    const submittedClaim = await civilServiceClient.submitInitiateGeneralApplicationEvent(claimId, ccdApplication, req);
    await clearSubmittedApplicationDraft(req, normaliseRouteParam(claimId));
    return submittedClaim;
  } catch (err) {
    logSubmitApplicationError(err, claimId, 'INITIATE_GENERAL_APPLICATION');
    throw err;
  }
};

export const submitCoScApplication = async (req: AppRequest): Promise<Claim> => {
  const claimId = req.params.id;
  try {
    const claim = await getClaimById(claimId, req, true);
    assertValidApplicationTypes(claim.generalApplication?.applicationTypes);
    //dummuy value for cosc app
    claim.generalApplication.agreementFromOtherParty = YesNo.NO;
    //without notice for cosc app
    const informOtherParties = new InformOtherParties('No', 'DummyVal');
    claim.generalApplication.informOtherParties = informOtherParties;
    const ccdApplication = translateCoScApplicationToCCD(claim.generalApplication);
    const submittedClaim = await civilServiceClient.submitInitiateGeneralApplicationEventForCosc(claimId, ccdApplication, req);
    await clearSubmittedApplicationDraft(req, normaliseRouteParam(claimId));
    return submittedClaim;
  } catch (err) {
    logSubmitApplicationError(err, claimId, 'INITIATE_GENERAL_APPLICATION_COSC');
    throw err;
  }
};

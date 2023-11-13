import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getViewOptionsBeforeDeadlineTask} from 'common/utils/taskList/tasks/viewOptionsBeforeDeadline';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {toCCDRespondentResponseLanguage} from 'services/translation/response/convertToCCDRespondentLiPResponse';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const getClaimWithExtendedResponseDeadline = async (req: AppRequest): Promise<Claim> => {
  try {
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    if (!claim.responseDeadline?.agreedResponseDeadline) {
      throw new Error('No extended response deadline found');
    }
    claim.responseDeadline.calculatedResponseDeadline = await civilServiceClient.calculateExtendedResponseDeadline(claim.responseDeadline?.agreedResponseDeadline, 0, req);
    await saveDraftClaim(redisKey, claim);
    return claim;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const submitExtendedResponseDeadline = async (req: AppRequest) => {
  try {
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(claim, req.params.id, 'en');
    if (viewOptionsBeforeDeadlineTask.status === TaskStatus.INCOMPLETE) {
      await civilServiceClient.submitAgreedResponseExtensionDateEvent(req.params.id, {
        respondentSolicitor1AgreedDeadlineExtension:
        claim.responseDeadline.calculatedResponseDeadline,
        respondent1LiPResponse: {
          respondent1ResponseLanguage: toCCDRespondentResponseLanguage(claim.claimBilingualLanguagePreference),
        }}, req);
      claim.respondent1ResponseDeadline = claim.responseDeadline.calculatedResponseDeadline;
      claim.respondentSolicitor1AgreedDeadlineExtension = claim.responseDeadline.calculatedResponseDeadline;
      await saveDraftClaim(redisKey, claim);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
};


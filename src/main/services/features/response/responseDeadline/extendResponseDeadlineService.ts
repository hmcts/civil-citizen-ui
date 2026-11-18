import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getViewOptionsBeforeDeadlineTask} from 'common/utils/taskList/tasks/viewOptionsBeforeDeadline';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {toCCDRespondentResponseLanguage} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {getRouteParam} from 'common/utils/routeParamUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('extendResponseDeadlineService');

async function loadDraftClaim(req: AppRequest) {
  const caseId = getRouteParam(req, 'id');
  const draftResult = await getResponseDraft(req, caseId);
  if (!draftResult) {
    throw new Error('[extendResponseDeadlineService] no response draft found');
  }
  const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
  const draftId = draftResult.rawResponse?.draftId;
  return {caseId, claim, draftId, draftResult};
}

const getClaimWithExtendedResponseDeadline = async (req: AppRequest): Promise<Claim> => {
  try {
    const {caseId, claim, draftId, draftResult} = await loadDraftClaim(req);

    if (!claim.responseDeadline?.agreedResponseDeadline) {
      throw new Error('No extended response deadline found');
    }
    claim.responseDeadline.calculatedResponseDeadline = await civilServiceClient.calculateExtendedResponseDeadline(claim.responseDeadline?.agreedResponseDeadline, 0, req);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
    return claim;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const submitExtendedResponseDeadline = async (req: AppRequest) => {
  try {
    const {caseId, claim, draftId, draftResult} = await loadDraftClaim(req);

    const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(claim, caseId, 'en');
    if (viewOptionsBeforeDeadlineTask.status === TaskStatus.INCOMPLETE) {
      await civilServiceClient.submitAgreedResponseExtensionDateEvent(caseId, {
        respondentSolicitor1AgreedDeadlineExtension:
        claim.responseDeadline.calculatedResponseDeadline,
        respondent1LiPResponse: {
          respondent1ResponseLanguage: toCCDRespondentResponseLanguage(claim.claimBilingualLanguagePreference),
        }}, req);
      claim.respondent1ResponseDeadline = claim.responseDeadline.calculatedResponseDeadline;
      claim.respondentSolicitor1AgreedDeadlineExtension = claim.responseDeadline.calculatedResponseDeadline;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
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

import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {AppRequest} from '../../../../common/models/AppRequest';
import {Claim} from '../../../../common/models/claim';
import {getViewOptionsBeforeDeadlineTask} from '../../../../common/utils/taskList/tasks/viewOptionsBeforeDeadline';
import {TaskStatus} from '../../../../common/models/taskList/TaskStatus';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const getClaimWithExtendedResponseDeadline = async (req: AppRequest): Promise<Claim> => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    if (!claim.responseDeadline?.agreedResponseDeadline) {
      throw new Error('No extended response deadline found');
    }
    claim.responseDeadline.calculatedResponseDeadline = await civilServiceClient.calculateExtendedResponseDeadline(claim.responseDeadline?.agreedResponseDeadline, req);
    await saveDraftClaim(req.params.id, claim);
    return claim;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const submitExtendedResponseDeadline = async (req: AppRequest) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(claim, req.params.id, 'en');
    if (viewOptionsBeforeDeadlineTask.status === TaskStatus.INCOMPLETE) {
      await civilServiceClient.submitAgreedResponseExtensionDateEvent(req.params.id, {respondentSolicitor1AgreedDeadlineExtension: claim.responseDeadline.calculatedResponseDeadline}, req);
      claim.respondent1ResponseDeadline = claim.responseDeadline.calculatedResponseDeadline;
      claim.respondentSolicitor1AgreedDeadlineExtension = claim.responseDeadline.calculatedResponseDeadline;
      await saveDraftClaim(req.params.id, claim);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const submitResponseDeadlineExtension = async (claimId: string, req:AppRequest) => {
  try{
    const claim  = await getCaseDataFromStore(claimId);
    const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(claim, claimId, 'en');
    if(viewOptionsBeforeDeadlineTask.status === TaskStatus.INCOMPLETE){
      await civilServiceClient.submitResponseDeadlineExtensionEvent(claimId, {respondentSolicitor1AgreedDeadlineExtension: claim.responseDeadline.calculatedResponseDeadline}, req);
      claim.respondent1ResponseDeadline = claim.responseDeadline.calculatedResponseDeadline;
      claim.respondentSolicitor1AgreedDeadlineExtension = claim.responseDeadline.calculatedResponseDeadline;
      await saveDraftClaim(claimId, claim);
    }
  }catch(error) {
    logger.error(error);
    throw error;
  }
};

export {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
  submitResponseDeadlineExtension,
};


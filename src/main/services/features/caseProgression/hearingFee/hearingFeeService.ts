import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {translateDraftClaimToCCD} from 'services/translation/claim/ccdTranslation';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const triggerNotifyEvent = async (claimId: string, req:any, redisClaimId: string): Promise<void> => {
  const claim: Claim = await getCaseDataFromStore(redisClaimId);
  const ccdClaim = translateDraftClaimToCCD(claim, req);
  await civilServiceClient.submitEvent(CaseEvent.NOTIFY_CLAIMANT_LIP_HELP_WITH_FEES, claimId, ccdClaim, req);
};

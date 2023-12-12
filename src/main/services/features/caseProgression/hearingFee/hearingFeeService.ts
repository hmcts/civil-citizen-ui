import {Claim} from 'models/claim';
import {translateDraftClaimToCCD} from 'services/translation/claim/ccdTranslation';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const triggerNotifyEvent = async (claimId: string, req:any, claim: Claim): Promise<void> => {
  if (claim.respondent1) {
    claim.respondent1.dateOfBirth = undefined;
  }
  claim.claimAmountBreakup = undefined;
  const ccdClaim = translateDraftClaimToCCD(claim, req);
  await civilServiceClient.submitEvent(CaseEvent.NOTIFY_CLAIMANT_LIP_HELP_WITH_FEES, claimId, ccdClaim, req);
};

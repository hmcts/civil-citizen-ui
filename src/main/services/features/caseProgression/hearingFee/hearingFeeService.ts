import {Claim} from 'models/claim';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  convertHearingFeeHelpWithFeesToCCD,
} from 'services/translation/caseProgression/hearingFee/convertHearingFeeHelpWithFeesToCCD';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const triggerNotifyEvent = async (claimId: string, req:any, claim: Claim): Promise<void> => {
  const ccdClaim = convertHearingFeeHelpWithFeesToCCD(claim);
  await civilServiceClient.submitEvent(CaseEvent.NOTIFY_CLAIMANT_LIP_HELP_WITH_FEES, claimId, ccdClaim, req);
};

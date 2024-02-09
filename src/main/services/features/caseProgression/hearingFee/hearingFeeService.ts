import {Claim} from 'models/claim';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CCDClaim} from 'models/civilClaimResponse';
import { CCDHelpWithFeeDetails } from 'common/form/models/claimDetails';
import { FeeType } from 'common/form/models/helpWithFees/feeType';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const triggerNotifyEvent = async (claimId: string, req:any, claim: Claim): Promise<void> => {
  const ccdClaim = translateReferenceNumberToCCD(claim);
  await civilServiceClient.submitEvent(CaseEvent.APPLY_HELP_WITH_HEARING_FEE, claimId, ccdClaim, req);
};

const translateReferenceNumberToCCD = (claim: Claim): CCDClaim => {
  return {
    hwFeesDetails: toCCDHelpWithFeeHearing(claim.caseProgression?.helpFeeReferenceNumberForm?.referenceNumber),
    hearingHelpFeesReferenceNumber : claim.caseProgression?.helpFeeReferenceNumberForm?.referenceNumber,
  };
};

const toCCDHelpWithFeeHearing = (referenceNumber: string): CCDHelpWithFeeDetails => {
  if (referenceNumber) {
    return { hwfFeeType: FeeType.HEARING };
  }
}
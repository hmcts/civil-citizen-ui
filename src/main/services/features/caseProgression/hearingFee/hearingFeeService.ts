import {Claim} from 'models/claim';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CCDClaim} from 'models/civilClaimResponse';
import {AppRequest} from 'models/AppRequest';
import {Request} from 'express';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const triggerNotifyEvent = async (claimId: string, req:AppRequest | Request, claim: Claim): Promise<void> => {
  const ccdClaim = translateReferenceNumberToCCD(claim);
  await civilServiceClient.submitEvent(CaseEvent.APPLY_HELP_WITH_HEARING_FEE, claimId, ccdClaim,<AppRequest> req);
};

const translateReferenceNumberToCCD = (claim: Claim): CCDClaim => {
  return {
    hearingHelpFeesReferenceNumber : claim.caseProgression?.helpFeeReferenceNumberForm?.referenceNumber,
  };
};

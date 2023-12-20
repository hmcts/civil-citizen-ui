import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {YesNo} from 'form/models/yesNo';
import {toCCDHelpWithFees} from 'services/translation/response/convertToCCDHelpWithFees';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';

export const convertHearingFeeHelpWithFeesToCCD = (claim: Claim): CCDClaim => {
  const option = claim?.caseProgression?.helpFeeReferenceNumberForm?.option;
  const referenceNumber = claim?.caseProgression?.helpFeeReferenceNumberForm?.referenceNumber;

  if (option) {
    return {
      hearingFeeHelpWithFees: toCCDHelpWithFees(new HelpWithFees(option.toLowerCase() as YesNo, referenceNumber)),
    };
  } else {
    return {
      hearingFeeHelpWithFees: undefined,
    };
  }
};

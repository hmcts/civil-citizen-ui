import { FeeType } from 'common/form/models/helpWithFees/feeType';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import { CCDHelpWithFeeDetails, CCDHelpWithFees } from 'form/models/claimDetails';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';

export const toCCDHelpWithFees = (helpWithFees: HelpWithFees | undefined): CCDHelpWithFees => {
  if (!helpWithFees) return undefined;
  return {
    helpWithFee: toCCDYesNo(helpWithFees.option),
    helpWithFeesReferenceNumber: helpWithFees.referenceNumber,
  };
};

export const toCCDHelpWithClaimFee = (helpWithFees: HelpWithFees | undefined): CCDHelpWithFeeDetails => {
  if (helpWithFees?.referenceNumber) {
    return {
      hwfFeeType: FeeType.CLAIMISSUED,
    };
  }
};
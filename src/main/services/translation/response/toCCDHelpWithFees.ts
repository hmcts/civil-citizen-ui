import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {CCDHelpWithFees} from 'form/models/claimDetails';

export const toCCDHelpWithFees = (helpWithFees: HelpWithFees | undefined): CCDHelpWithFees => {
  return {
    helpWithFee: helpWithFees.option,
    helpWithFeesReferenceNumber: helpWithFees.referenceNumber,
  };
};

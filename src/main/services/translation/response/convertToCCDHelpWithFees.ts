import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {CCDHelpWithFees} from 'form/models/claimDetails';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';

export const toCCDHelpWithFees = (helpWithFees: HelpWithFees | undefined): CCDHelpWithFees => {
  if (!helpWithFees) return undefined;
  return {
    helpWithFee: toCCDYesNo(helpWithFees.option),
    helpWithFeesReferenceNumber: helpWithFees.referenceNumber,
  };
};

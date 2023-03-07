import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {StatementOfMeans} from 'models/statementOfMeans';
import {toCCDYesNoFromBoolean} from 'services/translation/response/convertToCCDYesNo';

export const toCCDSelfEmploymentDetails = (statementOfMeans: StatementOfMeans): CCDSelfEmploymentDetails => {
  return {
    jobTitle: statementOfMeans?.selfEmployedAs?.jobTitle,
    annualTurnover: statementOfMeans?.selfEmployedAs?.annualTurnover,
    isBehindOnTaxPayment: toCCDYesNoFromBoolean(statementOfMeans?.taxPayments?.owed),
    amountOwed: statementOfMeans?.taxPayments?.amountOwed,
    reason: statementOfMeans?.taxPayments?.reason,
  };
};

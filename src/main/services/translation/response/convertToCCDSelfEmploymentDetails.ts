import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {StatementOfMeans} from 'models/statementOfMeans';
import {toCCDYesNoFromBoolean} from 'services/translation/response/convertToCCDYesNo';

export const toCCDSelfEmploymentDetails = (statementOfMeans: StatementOfMeans): CCDSelfEmploymentDetails => {
  return {
    jobTitle: statementOfMeans?.selfEmployedAs?.jobTitle,
    annualTurnover: statementOfMeans?.selfEmployedAs?.annualTurnover ? statementOfMeans.selfEmployedAs.annualTurnover*100 : undefined,
    isBehindOnTaxPayment: toCCDYesNoFromBoolean(statementOfMeans?.taxPayments?.owed),
    amountOwed: statementOfMeans?.taxPayments?.amountOwed ? statementOfMeans.taxPayments.amountOwed*100 : undefined,
    reason: statementOfMeans?.taxPayments?.reason,
  };
};

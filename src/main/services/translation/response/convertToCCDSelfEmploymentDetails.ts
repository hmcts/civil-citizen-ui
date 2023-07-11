import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {StatementOfMeans} from 'models/statementOfMeans';
import {toCCDYesNoFromBoolean} from 'services/translation/response/convertToCCDYesNo';
import {convertToPence} from 'services/translation/claim/moneyConversation';

export const toCCDSelfEmploymentDetails = (statementOfMeans: StatementOfMeans): CCDSelfEmploymentDetails => {
  return {
    jobTitle: statementOfMeans?.selfEmployedAs?.jobTitle,
    annualTurnover: convertToPence(statementOfMeans?.selfEmployedAs?.annualTurnover),
    isBehindOnTaxPayment: toCCDYesNoFromBoolean(statementOfMeans?.taxPayments?.owed),
    amountOwed: convertToPence(statementOfMeans?.taxPayments?.amountOwed),
    reason: statementOfMeans?.taxPayments?.reason,
  };
};

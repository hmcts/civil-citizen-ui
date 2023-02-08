import {CCDSelfEmploymentDetails} from "models/ccdResponse/ccdSelfEmploymentDetails";
import {StatementOfMeans} from "models/statementOfMeans";
import {YesNoUpperCamelCase} from "form/models/yesNo";

export const toCCDSelfEmploymentDetails = (statementOfMeans: StatementOfMeans): CCDSelfEmploymentDetails => {
  return {
    jobTitle: statementOfMeans?.selfEmployedAs?.jobTitle,
    annualTurnover: statementOfMeans?.selfEmployedAs?.annualTurnover,
    isBehindOnTaxPayment: statementOfMeans?.taxPayments?.owed ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    amountOwed: statementOfMeans?.taxPayments?.amountOwed,
    reason: statementOfMeans?.taxPayments?.reason,
  };
}

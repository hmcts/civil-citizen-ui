import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {TaxPayments} from 'models/taxPayments';
import {toCUIBoolean} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUISelfEmploymentTaxPayment = (selfEmploymentDetails: CCDSelfEmploymentDetails): TaxPayments => {
  if (selfEmploymentDetails)
  {
    return {
      owed: toCUIBoolean(selfEmploymentDetails.isBehindOnTaxPayment),
      amountOwed: selfEmploymentDetails.amountOwed,
      reason: selfEmploymentDetails.reason,
    };
  }
};


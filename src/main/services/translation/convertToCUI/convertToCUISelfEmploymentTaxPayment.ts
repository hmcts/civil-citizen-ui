import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {TaxPayments} from 'models/taxPayments';
import {toCUIBoolean} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {convertToPound} from 'services/translation/claim/moneyConversation';

export const toCUISelfEmploymentTaxPayment = (selfEmploymentDetails: CCDSelfEmploymentDetails): TaxPayments => {
  if (selfEmploymentDetails)
  {
    return {
      owed: toCUIBoolean(selfEmploymentDetails.isBehindOnTaxPayment),
      amountOwed: convertToPound(selfEmploymentDetails.amountOwed),
      reason: selfEmploymentDetails.reason,
    };
  }
};


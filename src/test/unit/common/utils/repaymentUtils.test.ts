// import { HowMuchDoYouOwe } from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
// import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
// import {ResponseType} from 'common/form/models/responseType';
// import { TransactionSchedule } from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
// import {FullAdmission} from 'common/models/fullAdmission';
// import {PartialAdmission} from 'common/models/partialAdmission';
// import {Party} from 'common/models/party';
// import {addDaysToDate, addMonths, formatDateToFullDate} from 'common/utils/dateUtils';
// import {getFinalPaymentDate, isRepaymentPlanFullOrPartAdmit} from 'common/utils/repaymentUtils';
// import {createClaimWithBasicRespondentDetails} from '../../../utils/mockClaimForCheckAnswers';

import {TransactionSchedule} from "common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule";
import {convertFrequencyToText} from "common/utils/repaymentUtils";
import {t} from "i18next";

describe('repaymentUtils', () => {

  describe('convertFrequencyToText', () => {
    it('should translate frequency weekly to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.WEEK, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.WEEKLY'));
    });
    it('should translate frequency each two week to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.TWO_WEEKS, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.TWO_WEEKS'));
    });
    it('should translate frequency monthly to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.MONTH, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.MONTHLY'));
    });
  });

});

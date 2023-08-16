import { toCCDDJPaymentFrequency } from 'services/translation/response/convertToCCDDJPaymentFrequency';
import { toCCDDJPaymentOption } from 'services/translation/claimantResponse/convertToCCDDJPaymentOption';
import { translateDraftClaimToCCD } from '../../../../../main/services/translation/claimantResponse/ccdTranslation';
import { toCCDParty } from '../../../../../main/services/translation/response/convertToCCDParty';
import { toCCDYesNo } from '../../../../../main/services/translation/response/convertToCCDYesNo';
import { AppRequest } from 'common/models/AppRequest';
import { YesNo, YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';

jest.mock(
  '../../../../../main/services/translation/response/convertToCCDParty',
  () => ({
    toCCDParty: jest.fn(),
  })
);

jest.mock(
  '../../../../../main/services/translation/response/convertToCCDYesNo',
  () => ({
    toCCDYesNo: jest.fn(),
  })
);

jest.mock(
  'services/translation/claimantResponse/convertToCCDDJPaymentOption',
  () => ({
    toCCDDJPaymentOption: jest.fn(),
  })
);

jest.mock(
  'services/translation/response/convertToCCDDJPaymentFrequency',
  () => ({
    toCCDDJPaymentFrequency: jest.fn(),
  })
);

describe('translateDraftClaimToCCD', () => {
  it('translates draft claim to CCDClaim', () => {
    // Given
    const claim = {
      applicant1: {},
      respondent1: {},
      totalClaimAmount: 100,
      claimantResponse: {
        ccjRequest: {
          paidAmount: {
            option: YesNo.YES,
            amount: 50,
            totalAmount: 100,
          },
          ccjPaymentOption: {
            type: PaymentOptionType.BY_SET_DATE,
          },
          defendantPaymentDate: {
            date: '2022-01-01',
          },
        },
      },
    };

    const req = {} as AppRequest;

    const mockToCCDParty = jest.fn();
    toCCDParty.mockImplementation(mockToCCDParty);

    const mockToCCDYesNo = jest.fn();
    toCCDYesNo.mockImplementation(mockToCCDYesNo);

    const mockToCCDDJPaymentOption = jest.fn();
    toCCDDJPaymentOption.mockImplementation(mockToCCDDJPaymentOption);

    const mockToCCDDJPaymentFrequency = jest.fn();
    toCCDDJPaymentFrequency.mockImplementation(mockToCCDDJPaymentFrequency);

    // When
    const result = translateDraftClaimToCCD(claim, req);

    // Then
    expect(mockToCCDParty).toHaveBeenCalledTimes(2); // Called twice for applicant1 and respondent1
    expect(mockToCCDYesNo).toHaveBeenCalledTimes(2); // Called for partialPayment and repaymentDue
    expect(mockToCCDDJPaymentOption).toHaveBeenCalledTimes(1); // Called for paymentTypeSelection
    expect(mockToCCDDJPaymentFrequency).toHaveBeenCalledTimes(1); // Called for repaymentFrequency

    expect(result).toEqual({
      applicant1: {},
      respondent1: {},
      applicant1Represented: YesNoUpperCamelCase.NO,
      totalClaimAmount: 100,
      partialPayment: toCCDYesNo(YesNo.YES),
      partialPaymentAmount: '50',
      paymentTypeSelection: {},
      paymentSetDate: '2022-01-01',
      repaymentFrequency: undefined,
      repaymentDue: '50',
      repaymentSuggestion: undefined,
    });
  });
});

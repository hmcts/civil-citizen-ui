import {Claim} from 'models/claim';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getGaPaymentSuccessfulBodyContent,
  getGaPaymentSuccessfulPanelContent,
} from 'services/features/generalApplication/applicationFeePaymentConfirmationContent';

describe('Application fee payment confirmation content', () => {
  const claim = new Claim();
  const paidApplication = {
    case_data: {
      generalAppPBADetails: {
        fee: {calculatedAmountInPence: 1400},
        paymentDetails: {status: 'SUCCESS', reference: 'REF-123-123'},
      },
    },
  } as unknown as ApplicationResponse;

  it('should put the payment reference on the panel when a fee was paid', () => {
    const panel = getGaPaymentSuccessfulPanelContent(claim, false, false, 'en', paidApplication);

    expect(JSON.stringify(panel)).toContain('REF-123-123');
  });

  it.each([
    {isAdditionalFee: true, expectedReference: 'ADDITIONAL-456', otherReference: 'REF-123-123'},
    {isAdditionalFee: false, expectedReference: 'REF-123-123', otherReference: 'ADDITIONAL-456'},
  ])('renders $expectedReference when isAdditionalFee is $isAdditionalFee', ({isAdditionalFee, expectedReference, otherReference}) => {
    const application = {
      ...paidApplication,
      case_data: {
        ...paidApplication.case_data,
        generalAppPBADetails: {
          ...paidApplication.case_data.generalAppPBADetails,
          additionalPaymentDetails: {status: 'SUCCESS', reference: 'ADDITIONAL-456'},
        },
      },
    };

    const panel = getGaPaymentSuccessfulPanelContent(claim, false, isAdditionalFee, 'en', application);

    expect(panel).toHaveLength(1);
    expect(panel[0].data.html).toContain(`<strong>${expectedReference}</strong>`);
    expect(panel[0].data.html).not.toContain(otherReference);
  });

  it('should use the submitted confirmation panel when there is no fee', () => {
    const panel = getGaPaymentSuccessfulPanelContent(claim, true, false, 'en', undefined);

    expect(JSON.stringify(panel)).toContain('govuk-!-font-size-36');
  });

  it('should include what happens next after a successful payment', () => {
    const body = getGaPaymentSuccessfulBodyContent(claim, '1400', false, false, false, 'en');

    expect(JSON.stringify(body)).toContain('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT');
  });
});

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

  it('should use the submitted confirmation panel when there is no fee', () => {
    const panel = getGaPaymentSuccessfulPanelContent(claim, true, false, 'en', undefined);

    expect(JSON.stringify(panel)).toContain('govuk-!-font-size-36');
  });

  it('should include what happens next after a successful payment', () => {
    const body = getGaPaymentSuccessfulBodyContent(claim, '1400', false, false, false, 'en');

    expect(JSON.stringify(body)).toContain('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT');
  });
});

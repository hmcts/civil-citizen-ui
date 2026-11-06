import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {
  getPaymentSuccessfulPanelContent,
  getPaymentSuccessfulBodyContent,
} from 'services/features/claim/payment/claimFeePaymentConfirmationContent';

jest.mock('../../../../../../main/modules/i18n');

describe('claim fee payment confirmation', () => {
  it('uses the claim payment reference and converts the fee from pence', () => {
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = new PaymentInformation();
    claim.claimDetails.claimFeePayment.paymentReference = 'CLAIM-REFERENCE-123';
    claim.claimFee = {calculatedAmountInPence: 2500} as Claim['claimFee'];

    const panel = getPaymentSuccessfulPanelContent(claim, 'en');
    const body = getPaymentSuccessfulBodyContent(claim, 'en');

    expect(panel[0].data.html).toContain('<strong>CLAIM-REFERENCE-123</strong>');
    expect(body[2].data.html).toContain('<dd class="govuk-summary-list__value">£25</dd>');
  });
});

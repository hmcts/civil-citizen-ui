import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {DocumentType} from 'models/document/documentType';
import {Party} from 'models/party';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {FullAdmission} from 'common/models/fullAdmission';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {
  buildNextStepsSection,
  buildPanelSection,
} from 'services/features/settlementAgreement/settlementAgreementConfirmationBuilder/confirmationContentBuilder';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

const claimId = '12345';

const buildClaim = (decision: YesNoUpperCamelCase): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.respondentSignSettlementAgreement = decision;
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = {partyName: 'Jane Claimant'};
  return claim;
};

describe('settlement agreement confirmationContentBuilder', () => {
  describe('buildPanelSection', () => {
    it('should include a settlement agreement download link when the document exists', () => {
      const claim = buildClaim(YesNoUpperCamelCase.YES);
      claim.systemGeneratedCaseDocuments = [{
        id: '1',
        value: {
          createdBy: 'Civil',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/settlement-doc',
            document_filename: 'settlement.pdf',
            document_binary_url: 'http://dm-store:8080/documents/settlement-doc/binary',
          },
          documentName: 'settlement.pdf',
          documentSize: 100,
          documentType: DocumentType.SETTLEMENT_AGREEMENT,
          createdDatetime: new Date('2022-06-21'),
        },
      }];

      const panel = buildPanelSection(claim, 'en');

      expect(panel[0].data.html).toContain(
        CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', 'settlement-doc'),
      );
      expect(panel[0].data.html).toContain(
        'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.DOWNLOAD_SETTLEMENT_AGREEMENT_LINK_TEXT',
      );
    });

    it('should show unavailable text when the settlement agreement document is missing', () => {
      const claim = buildClaim(YesNoUpperCamelCase.YES);
      claim.systemGeneratedCaseDocuments = [];

      const panel = buildPanelSection(claim, 'en');

      expect(panel[0].data.html).toContain('COMMON.DOCUMENT_NOT_AVAILABLE_YET');
      expect(panel[0].data.html).not.toContain('href=');
    });

    it('should build the rejected confirmation panel', () => {
      const claim = buildClaim(YesNoUpperCamelCase.NO);

      const panel = buildPanelSection(claim, 'en');

      expect(panel[0].data.title).toContain(
        'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.REJECTED_SETTLEMENT_AGREEMENT_TITLE',
      );
    });

    it('should return undefined when settlement agreement response is missing', () => {
      expect(buildPanelSection(new Claim(), 'en')).toBeUndefined();
    });
  });

  describe('buildNextStepsSection', () => {
    it('should build accept next steps', () => {
      const claim = buildClaim(YesNoUpperCamelCase.YES);

      const nextSteps = buildNextStepsSection(claim, 'en');

      expect(nextSteps.some((section) =>
        section.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.WHAT_HAPPENS_NEXT',
      )).toBe(true);
    });

    it('should include pay-by date when court accepted immediate claimant plan', () => {
      const claim = buildClaim(YesNoUpperCamelCase.YES);
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      claim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date('2024-07-01');

      const nextSteps = buildNextStepsSection(claim, 'en');

      expect(nextSteps.some((section) =>
        section.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY',
      )).toBe(true);
    });

    it('should include pay-by date when court accepted set-date claimant plan', () => {
      const claim = buildClaim(YesNoUpperCamelCase.YES);
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date('2024-08-01') as never;

      const nextSteps = buildNextStepsSection(claim, 'en');

      expect(nextSteps.some((section) =>
        section.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY',
      )).toBe(true);
    });

    it('should include pay-by date for full admission by set date', () => {
      const claim = buildClaim(YesNoUpperCamelCase.YES);
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2024-09-01');

      const nextSteps = buildNextStepsSection(claim, 'en');

      expect(nextSteps.some((section) =>
        section.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY',
      )).toBe(true);
    });

    it('should build reject next steps', () => {
      const claim = buildClaim(YesNoUpperCamelCase.NO);

      const nextSteps = buildNextStepsSection(claim, 'en');

      expect(nextSteps.some((section) =>
        section.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.CAN_REQUEST_CCJ',
      )).toBe(true);
    });
  });
});

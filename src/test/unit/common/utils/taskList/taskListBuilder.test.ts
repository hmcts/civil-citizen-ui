import { AlreadyPaid } from '../../../../../main/common/form/models/admission/partialAdmission/alreadyPaid';
import { HowMuchDoYouOwe } from '../../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import { PaymentIntention } from '../../../../../main/common/form/models/admission/partialAdmission/paymentIntention';
import { WhyDoYouDisagree } from '../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import PaymentOptionType from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import { ResponseType } from '../../../../../main/common/form/models/responseType';
import { YesNo } from '../../../../../main/common/form/models/yesNo';
import { Claim } from '../../../../../main/common/models/claim';
import { PartialAdmission } from '../../../../../main/common/models/partialAdmission';
import { Respondent } from '../../../../../main/common/models/respondent';
import { buildResolvingTheClaimSection, buildRespondToClaimSection, buildYourHearingRequirementsSection } from '../../../../../main/common/utils/taskList/taskListBuilder';

describe('Task List Builder', () => {
  const claimId = '5129';
  const lang = 'en';

  describe('test buildRespondToClaimSection', () => {

    describe('test FULL_ADMISSION', () => {

      it('should have chooseAResponseTask', () => {
        const claim = new Claim();
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(1);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
      });

      it('should have chooseAResponseTask and whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;

        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(2);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/full-admission/payment-option');
      });

      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask and shareFinancialDetailsTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.paymentOption = PaymentOptionType.BY_SET_DATE;

        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(3);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/full-admission/payment-option');
        expect(respondToClaimSection.tasks[2].url).toEqual('/case/5129/response/statement-of-means/intro');
      });

      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask, shareFinancialDetailsTask and repaymentPlanTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.paymentOption = PaymentOptionType.INSTALMENTS;

        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(4);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/full-admission/payment-option');
        expect(respondToClaimSection.tasks[2].url).toEqual('/case/5129/response/statement-of-means/intro');
        expect(respondToClaimSection.tasks[3].url).toEqual('/case/5129/response/full-admission/payment-plan');
      });

    });

    describe('test PART_ADMISSION', () => {

      it('should have chooseAResponseTask and whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(2);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/partial-admission/why-do-you-disagree');
      });

      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask and howMuchHaveYouPaidTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new AlreadyPaid(YesNo.YES);
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(3);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/partial-admission/how-much-have-you-paid');
        expect(respondToClaimSection.tasks[2].url).toEqual('/case/5129/response/partial-admission/why-do-you-disagree');
      });

      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask, whenWillYouPayTask and howMuchMoneyAdmitOweTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new AlreadyPaid(YesNo.NO);
        claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
        claim.partialAdmission.howMuchDoYouOwe.amount = 1;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(4);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/partial-admission/how-much-do-you-owe');
        expect(respondToClaimSection.tasks[2].url).toEqual('/case/5129/response/partial-admission/payment-option');
        expect(respondToClaimSection.tasks[3].url).toEqual('/case/5129/response/partial-admission/why-do-you-disagree');
      });

      it('should have chooseAResponseTask, shareFinancialDetailsTask and whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.paymentIntention = new PaymentIntention();
        claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
        claim.partialAdmission.paymentIntention.paymentDate = new Date();
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(3);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/statement-of-means/intro');
        expect(respondToClaimSection.tasks[2].url).toEqual('/case/5129/response/partial-admission/why-do-you-disagree');
      });

      it('should have chooseAResponseTask, shareFinancialDetailsTask, repaymentPlanTaskand whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.paymentIntention = new PaymentIntention();
        claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
        claim.partialAdmission.paymentIntention.paymentDate = new Date();
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks).toHaveLength(4);
        expect(respondToClaimSection.tasks[0].url).toEqual('/case/5129/response/response-type');
        expect(respondToClaimSection.tasks[1].url).toEqual('/case/5129/response/statement-of-means/intro');
        expect(respondToClaimSection.tasks[2].url).toEqual('/case/5129/response/full-admission/payment-plan');
        expect(respondToClaimSection.tasks[3].url).toEqual('/case/5129/response/partial-admission/why-do-you-disagree');
      });

    });
  });

  describe('test buildResolvingTheClaimSection', () => {
    it('should be empty', () => {
      const claim = new Claim();
      const respondToClaimSection = buildResolvingTheClaimSection(claim, claimId, lang);
      expect(respondToClaimSection.tasks).toHaveLength(0);
    });

    it('should have freeTelephoneMediationTask', () => {
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree();
      claim.partialAdmission.whyDoYouDisagree.text = 'test';
      const resolvingTheClaimSection = buildResolvingTheClaimSection(claim, claimId, lang);
      expect(resolvingTheClaimSection.tasks).toHaveLength(1);
      expect(resolvingTheClaimSection.tasks[0].url).toEqual('/case/5129/mediation/free-telephone-mediation');
    });

  });


  describe('test buildYourHearingRequirementsSection', () => {
    it('should be empty', () => {
      const claim = new Claim();
      const respondToClaimSection = buildYourHearingRequirementsSection(claim, claimId, lang);
      expect(respondToClaimSection.tasks).toHaveLength(0);
    });

    it('should have freeTelephoneMediationTask', () => {
      const claim = new Claim();
      claim.respondent1 = new Respondent();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;

      const yourHearingRequirementsSection = buildYourHearingRequirementsSection(claim, claimId, lang);
      expect(yourHearingRequirementsSection.tasks).toHaveLength(1);
      expect(yourHearingRequirementsSection.tasks[0].url).toEqual('/case/5129/directions-questionnaire/support-required');
    });

  });


});


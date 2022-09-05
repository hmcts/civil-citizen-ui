// import {getSubmitConfirmationContent} from '../../../../../../main/services/features/response/submitConfirmation/submitConfirmationService';
// import {CorrespondenceAddress} from '../../../../../../main/common/models/correspondenceAddress';
import {Claim} from '../../../../../../main/common/models/claim';
// import {getDescription, getTaskLists, getTitle} from '../../../../../../main/services/features/response/taskListService';
// import {getSubmitConfirmationContent} from '../../../../../../main/services/features/response/submitConfirmation/submitConfirmationService';
// import {
//   buildPrepareYourResponseSection,
//   buildRespondToClaimSection,
//   buildSubmitSection,
// } from '../../../../../../main/common/utils/taskList/taskListBuilder';
import {
  buildSubmitStatus,
  buildNextStepsSection,
} from '../../../../../../main/services/features/response/submitConfirmation/submitConfirmationBuilder/submitConfirmationBuilder';
import {getNextStepsTitle} from '../../../../../../main/services/features/response/submitConfirmation/submitConfirmationBuilder/admissionSubmitConfirmationContent';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';
// import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
// import {deepCopy} from '../../../../../utils/deepCopy';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {Respondent} from '../../../../../../main/common/models/respondent';
import PaymentOptionType from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Submit Confirmation service', () => {
  // const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const mockClaimId = '5129';
  const lang = 'en';

  describe('Full admission pay immediately scenario', () => {
    const claim = new Claim();
    claim.paymentOption = PaymentOptionType.IMMEDIATELY;
    claim.respondent1 = new Respondent();
    claim.applicant1 = {
      partyName: 'Some Very Important Company Ltd',
      type: CounterpartyType.COMPANY,
    };
    claim.respondent1.partyName = 'Version 1';    
    claim.respondent1.type = CounterpartyType.ORGANISATION;
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    it('should display submit status', () => {
      const submitStatusSection = buildSubmitStatus(mockClaimId, claim, lang);
      expect(submitStatusSection[0].data.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    });

    it('should display what happens next title', () => {
      const nextStepsTitle = getNextStepsTitle();
      expect(nextStepsTitle[0].data.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');      
    });

    it('should display next steps section', () => {
      const nextStepsSection = buildNextStepsSection(mockClaimId, claim, lang);
      expect(nextStepsSection[0].data.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.MAKE_SURE_THAT');
      expect(nextStepsSection[0].data.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CAN_REQUEST_CCJ');
      expect(nextStepsSection[0].data.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.BANK_TRANSFERS_CLEAR_IN_THEIR_ACC');
      expect(nextStepsSection[0].data.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS');
      expect(nextStepsSection[0].data.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.THEY_CALL_COURT_FOR_YOU_PAID');
      expect(nextStepsSection[1].data.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.CONTACT_CLAIMANT');
      expect(nextStepsSection[1].data?.textAfter).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.IF_NEED_THEIR_DETAILS');
      expect(nextStepsSection[1].data?.href).toEqual('/dashboard/5129/contact-them');
    });    
  });
});


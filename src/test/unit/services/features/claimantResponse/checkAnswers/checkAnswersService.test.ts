import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {Claim} from 'models/claim';
import {CLAIM_ID} from '../../../../../utils/checkAnswersConstants';
import {ClaimantResponse} from 'models/claimantResponse';
import { getSummarySections, saveStatementOfTruth } from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import { ResponseType } from 'common/form/models/responseType';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { YesNo } from 'common/form/models/yesNo';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {Mediation} from 'models/mediation/mediation';
import {CanWeUse} from 'models/mediation/canWeUse';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Check Answers service', () => {
  describe('Get Data from Draft', () => {

    it('should throw error when retrieving data from draft store fails', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, true))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should retrieve data from draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.claimantStatementOfTruth = new StatementOfTruthForm(false, SignatureType.BASIC, true, false);
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, true))).toBeTruthy();
    });
  });
  describe('Build check answers for part admit immediately', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim();
      claim.respondent1 = { responseType: ResponseType.PART_ADMISSION };
      claim.applicant1=new Party();
      claim.applicant1.partyDetails=new PartyDetails({});
      claim.applicant1.partyDetails.contactPerson='John Smith';
      claim.partialAdmission = { paymentIntention: { paymentOption: PaymentOptionType.IMMEDIATELY } };
    });


    it('should check answers for part admit pay immediately for no option', () => {

      claim.respondent1.responseType=ResponseType.PART_ADMISSION;
      claim.claimantResponse = { hasPartAdmittedBeenAccepted: { option: YesNo.NO } } as ClaimantResponse;
      claim.claimantResponse.mediation=new Mediation();
      claim.claimantResponse.mediation.canWeUse=new class implements CanWeUse {};
      claim.claimantResponse.mediation.canWeUse.option=YesNo.YES;
      const result = getSummarySections('12345', claim, 'en');
      expect(result.sections).toHaveLength(3);
    });
  });

});


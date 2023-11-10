import nock from 'nock';
import config from 'config';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import * as ccdTranslationService from '../../../../../main/services/translation/claimantResponse/claimantResponseCCDTranslation';
import * as ccdCCJTranslationService from '../../../../../main/services/translation/claimantResponse/ccdRequestJudgementTranslation';
import {Claim} from '../../../../../main/common/models/claim';
import * as requestModels from '../../../../../main/common/models/AppRequest';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {submitClaimantResponse} from 'services/features/claimantResponse/submitClaimantResponse';
import {YesNo} from 'common/form/models/yesNo';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {Party} from 'models/party';
import {CivilServiceClient} from 'client/civilServiceClient';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PartialAdmission} from 'models/partialAdmission';
import {ResponseType} from 'form/models/responseType';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/translation/claimantResponse/claimantResponseCCDTranslation');
jest.spyOn(CivilServiceClient.prototype, 'getClaimAmountFee').mockImplementation(() => Promise.resolve(0));

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};

const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Submit claimant response to ccd', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
  it('should submit claimant response successfully when there are no errors', async () => {
    //Given
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(200, {});
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateClaimantResponseToCCD');
    //When
    await submitClaimantResponse(mockedAppRequest);
    //Then
    expect(spyOnTranslation).toHaveBeenCalled();
    if (!nock.isDone()) {
      nock.cleanAll();
      fail('did not submit event to civil service');
    }
  });
  it('should rethrow error when there is an error with redis', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(submitClaimantResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
  it('should rethrow error when civil service returns 500', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(500, {error: 'error'});
    //Then
    await expect(submitClaimantResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REQUEST_FAILED);
  });
  describe('Submit claimant response to ccd', () => {
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
    claim.respondent1 = new Party();
    it('should submit claimant response with ccj data successfully when there are no errors', async () => {
      //Given
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/undefined/event')
        .reply(200, {});
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateClaimantResponseToCCD');
      const spyOnCCJTranslation = jest.spyOn(ccdCCJTranslationService, 'translateClaimantResponseRequestDefaultJudgementToCCD');
      //When
      await submitClaimantResponse(mockedAppRequest);
      //Then
      expect(spyOnTranslation).toHaveBeenCalled();
      expect(spyOnCCJTranslation).toHaveBeenCalled();
      if (!nock.isDone()) {
        nock.cleanAll();
        fail('did not submit event to civil service');
      }
    });
    it('should submit claimant response with ccj data successfully when there are no errors', async () => {
      //Given
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/undefined/event')
        .reply(200, {});
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateClaimantResponseToCCD');
      const spyOnCCJTranslation = jest.spyOn(ccdCCJTranslationService, 'translateClaimantResponseRequestDefaultJudgementToCCD');
      //When
      await submitClaimantResponse(mockedAppRequest);
      //Then
      expect(spyOnTranslation).toHaveBeenCalled();
      expect(spyOnCCJTranslation).toHaveBeenCalled();
      if (!nock.isDone()) {
        nock.cleanAll();
        fail('did not submit event to civil service');
      }
    });
    it('should submit claimant response with ccj data successfully when there are no errors', async () => {
      //Given
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.partialAdmission = null;
      claim.fullAdmission = new PartialAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/undefined/event')
        .reply(200, {});
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateClaimantResponseToCCD');
      const spyOnCCJTranslation = jest.spyOn(ccdCCJTranslationService, 'translateClaimantResponseRequestDefaultJudgementToCCD');
      //When
      await submitClaimantResponse(mockedAppRequest);
      //Then
      expect(spyOnTranslation).toHaveBeenCalled();
      expect(spyOnCCJTranslation).toHaveBeenCalled();
      if (!nock.isDone()) {
        nock.cleanAll();
        fail('did not submit event to civil service');
      }
    });
    it('should submit claimant response with ccj data successfully when there are no errors', async () => {
      //Given
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.partialAdmission = null;
      claim.fullAdmission = new PartialAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/undefined/event')
        .reply(200, {});
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateClaimantResponseToCCD');
      const spyOnCCJTranslation = jest.spyOn(ccdCCJTranslationService, 'translateClaimantResponseRequestDefaultJudgementToCCD');
      //When
      await submitClaimantResponse(mockedAppRequest);
      //Then
      expect(spyOnTranslation).toHaveBeenCalled();
      expect(spyOnCCJTranslation).toHaveBeenCalled();
      if (!nock.isDone()) {
        nock.cleanAll();
        fail('did not submit event to civil service');
      }
    });
  });
});

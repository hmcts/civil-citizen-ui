import {submitClaim} from 'services/features/claim/submission/submitClaim';
import {AppRequest} from 'common/models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as ccdTranslationService from 'services/translation/claim/ccdTranslation';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {req} from '../../../../../utils/UserDetails';

jest.mock('modules/draft-store');

const claim = new Claim();
claim.claimFee = {
  calculatedAmountInPence: 1000,
  code: 'FEE202',
  version: 1,
};
afterEach(() => {
  jest.clearAllMocks();
});
describe('Submit claim to ccd', () => {

  it('should submit claim successfully when there are no errors', async () => {
    //Given
    const draftStoreServiceMock = jest
      .spyOn(draftStoreService, 'getCaseDataFromStore')
      .mockReturnValue(
        new Promise((resolve, reject) => resolve(claim),
        ),
      );

    const ccdTranslationServiceMock = jest
      .spyOn(ccdTranslationService, 'translateDraftClaimToCCD');

    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitDraftClaim')
      .mockReturnValue(
        new Promise((resolve, reject) => resolve(claim),
        ),
      );

    //When
    const result = await submitClaim(req as AppRequest);

    //then
    expect(result).toBe(claim);
    expect(draftStoreServiceMock).toBeCalled();
    expect(ccdTranslationServiceMock).toBeCalled();
    expect(CivilServiceClientServiceMock).toBeCalled();
  });

  it('should throw an error', async () => {
    //Given
    jest.spyOn(draftStoreService, 'getCaseDataFromStore')
      .mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
    //when then
    await expect(submitClaim(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });

  it('should preserve the journey parties when the e2e submit adapter adds submitted case data', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'e2eTest';
    const draftClaim = new Claim();
    draftClaim.applicant1 = {partyName: 'Journey claimant'} as Claim['applicant1'];
    draftClaim.respondent1 = {partyName: 'Journey defendant'} as Claim['respondent1'];
    const submittedClaim = new Claim();
    submittedClaim.id = '1111222233334444';
    submittedClaim.applicant1 = {partyName: 'Static claimant'} as Claim['applicant1'];
    submittedClaim.respondent1 = {partyName: 'Static defendant'} as Claim['respondent1'];
    jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(draftClaim);
    jest.spyOn(CivilServiceClient.prototype, 'submitDraftClaim').mockResolvedValue(submittedClaim);
    const saveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim').mockResolvedValue();

    try {
      const result = await submitClaim(req as AppRequest);
      expect(result.applicant1?.partyName).toBe('Journey claimant');
      expect(result.respondent1?.partyName).toBe('Journey defendant');
      expect(saveDraftClaim).toHaveBeenCalledWith(
        `1111222233334444${req.session.user?.id}`,
        result,
        true,
        req.session.user?.id,
      );
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

});

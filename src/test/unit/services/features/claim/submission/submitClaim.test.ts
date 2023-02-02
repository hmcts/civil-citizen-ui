import {submitClaim} from 'services/features/claim/submission/submitClaim';
import {AppRequest, UserDetails} from "common/models/AppRequest";
import {CivilServiceClient} from "client/civilServiceClient";
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as ccdTranslationService from 'services/translation/claim/ccdTranslation';
import {Claim} from "models/claim";
import {TestMessages} from "../../../../../utils/errorMessageTestConstants";

jest.mock('modules/draft-store');

const userInfo: UserDetails = {
  accessToken: "accessToken",
  id: "1",
  email: "email@email.com",
  givenName: "givenName",
  familyName: "familyName",
  roles: []
};

const req = {
  session: {
    user: userInfo,
  },
};

const claim = new Claim();

afterEach(() => {
  jest.clearAllMocks();
});
describe('Submit claim to ccd', () => {

  it('should submit claim successfully when there are no errors', async () => {
    //Given
    const draftStoreServiceMock = jest
      .spyOn(draftStoreService, 'getCaseDataFromStore')
      .mockReturnValue(
        new Promise((resolve, reject) => resolve(claim)
        )
    );

    const ccdTranslationServiceMock = jest
      .spyOn(ccdTranslationService, 'translateDraftClaimToCCD');

    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitDraftClaim')
      .mockReturnValue(
        new Promise((resolve, reject) => resolve(claim)
        )
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

});

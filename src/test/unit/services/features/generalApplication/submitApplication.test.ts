import {app} from '../../../../../main/app';
import request from 'supertest';
import {Claim} from 'models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import * as utilityService from 'modules/utilityService';
import * as ccdTranslationService from 'services/translation/generalApplication/ccdTranslation';
import {req} from '../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';
import {submitApplication, submitCoScApplication} from 'services/features/generalApplication/submitApplication';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');

const mockGetClaim = utilityService.getClaimById as jest.Mock;
request(app);

describe('Submit application to ccd', () => {
  const claim = new Claim();

  beforeEach(() => {
    mockGetClaim.mockImplementation(() => {
      claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT));
      return claim;
    });
  });

  it('should submit claim successfully when there are no errors', async () => {
    const ccdTranslationServiceMock = jest
      .spyOn(ccdTranslationService, 'translateDraftApplicationToCCD');

    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitInitiateGeneralApplicationEvent')
      .mockReturnValue(
        new Promise((resolve) => resolve(claim),
        ),
      );
    (req as AppRequest).params = {id: '123'};

    //When
    const result = await submitApplication(req as AppRequest);

    //then
    expect(result).toBe(claim);
    expect(ccdTranslationServiceMock).toBeCalled();
    expect(CivilServiceClientServiceMock).toBeCalled();
  });

  it('should return http 500 when has error in the get method', async () => {
    mockGetClaim.mockImplementation(() => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await expect(submitApplication(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
describe('Submit CoSc general application to ccd', () => {
  const claim = new Claim();

  beforeEach(() => {
    mockGetClaim.mockImplementation(() => {
      claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID));
      return claim;
    });
  });

  it('should submit claim successfully when there are no errors', async () => {
    const ccdTranslationServiceMock = jest
      .spyOn(ccdTranslationService, 'translateCoScApplicationToCCD');

    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitInitiateGeneralApplicationEventForCosc')
      .mockReturnValue(
        new Promise((resolve) => resolve(claim),
        ),
      );
    (req as AppRequest).params = {id: '123'};

    //When
    const result = await submitCoScApplication(req as AppRequest);

    //then
    expect(result).toBe(claim);
    expect(ccdTranslationServiceMock).toBeCalled();
    expect(CivilServiceClientServiceMock).toBeCalled();
  });

  it('should return http 500 when has error in the get method', async () => {
    mockGetClaim.mockImplementation(() => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await expect(submitCoScApplication(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});


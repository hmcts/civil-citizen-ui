import {app} from '../../../../../main/app';
import request from 'supertest';
import {Claim} from 'models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import * as utilityService from 'modules/utilityService';
import * as ccdTranslationService from 'services/translation/generalApplication/ccdTranslation';
import {req} from '../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';
import {GaServiceClient} from 'client/gaServiceClient';
import {Application} from 'models/application';
import {submitApplication} from 'services/features/generalApplication/submitApplication';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/utilityService');

const mockGetClaim = utilityService.getClaimById as jest.Mock;
const application = new Application();
request(app);

describe('Submit application to ccd', () => {

  beforeEach(() => {
    mockGetClaim.mockImplementation(() => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT));
      return claim;
    });
  });

  it('should submit claim successfully when there are no errors', async () => {
    const ccdTranslationServiceMock = jest
      .spyOn(ccdTranslationService, 'translateDraftApplicationToCCD');

    const GaServiceClientServiceMock = jest
      .spyOn(GaServiceClient.prototype, 'submitDraftApplication')
      .mockReturnValue(
        new Promise((resolve) => resolve(application),
        ),
      );
    (req as AppRequest).params = {id: '123'};

    //When
    const result = await submitApplication(req as AppRequest);

    //then
    expect(result).toBe(application);
    expect(ccdTranslationServiceMock).toBeCalled();
    expect(GaServiceClientServiceMock).toBeCalled();

  });
  it('should return http 500 when has error in the get method', async () => {
    mockGetClaim.mockImplementation(() => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await expect(submitApplication(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});

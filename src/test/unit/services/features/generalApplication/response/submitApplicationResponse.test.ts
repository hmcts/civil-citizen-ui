import {app} from '../../../../../../main/app';
import request from 'supertest';
import {Claim} from 'models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import * as utilityService from 'modules/utilityService';
import {req} from '../../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';
import {submitApplicationResponse} from 'services/features/generalApplication/response/submitApplicationResponse';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {GaServiceClient} from 'client/gaServiceClient';
import { ApplicationResponse } from 'common/models/generalApplication/applicationResponse';
import { CCDGeneralApplication } from 'common/models/gaEvents/eventDto';
import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { CcdGeneralApplicationHearingDetails } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import * as CcdTraslation from 'services/translation/generalApplication/ccdTranslation';
import { CcdGeneralApplicationRespondentResponse } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationRespondentResponse';
import { configureSpy } from '../../../../../utils/spyConfiguration';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/utilityService');

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
    const generalApplication: Partial<CCDGeneralApplication> = {
      generalAppType: {types: [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]},
      generalAppRespondentAgreement: { hasAgreed: YesNoUpperCamelCase.NO },
      generalAppInformOtherParty: { isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: ''},
      respondentsResponses: [],
    };
    const ccdResponse: CcdGeneralApplicationRespondentResponse = {value: {
      generalAppRespondent1Representative: YesNoUpperCamelCase.NO,
      gaHearingDetails: {} as CcdGeneralApplicationHearingDetails,
      gaRespondentDetails: 'a1b2-c3d4-e5f6',
      gaRespondentResponseReason: 'reason',
    }};

    const ccdTranslationServiceMock = configureSpy(CcdTraslation, 'toCcdGeneralApplicationRespondentResponse')
      .mockReturnValue(ccdResponse);

    const submitRespondToApplicationEventMock = configureSpy(GaServiceClient.prototype, 'submitRespondToApplicationEvent')
      .mockResolvedValue(claim);
    
    const getApplicationMock = configureSpy(GaServiceClient.prototype, 'getApplication');
    getApplicationMock.mockResolvedValue(new ApplicationResponse('567', generalApplication as CCDGeneralApplication));
    (req as AppRequest).params = { id: '123'};
    req.session.user ={...req.session?.user, id: 'a1b2'};

    //When
    const result = await submitApplicationResponse(req as AppRequest);

    //then
    expect(result).toBe(claim);
    expect(ccdTranslationServiceMock).toBeCalledWith(claim.generalApplication, 'a1b2');
    expect(submitRespondToApplicationEventMock).toBeCalledWith(
      '567', {
        ...generalApplication, 
        respondentsResponses: [ccdResponse],
      }, req);
  });

  it('should return http 500 when has error in the get method', async () => {
    mockGetClaim.mockImplementation(() => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await expect(submitApplicationResponse(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});

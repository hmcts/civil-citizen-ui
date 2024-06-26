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
import { CcdGeneralApplicationStatementOfTruth } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationStatementOfTruth';
import { CCDHelpWithFees } from 'common/form/models/claimDetails';
import { Application } from 'common/models/generalApplication/application';

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
    const generalApplication: CCDGeneralApplication = {
      generalAppType: {types: [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]},
      generalAppRespondentAgreement: { hasAgreed: YesNoUpperCamelCase.NO },
      generalAppInformOtherParty: { isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: ''},
      generalAppAskForCosts: YesNoUpperCamelCase.NO,
      generalAppDetailsOfOrder: '',
      generalAppReasonsOfOrder: '',
      generalAppEvidenceDocument: [],
      generalAppHearingDetails: {} as CcdGeneralApplicationHearingDetails,
      generalAppStatementOfTruth: {} as CcdGeneralApplicationStatementOfTruth,
      generalAppHelpWithFees: {} as CCDHelpWithFees,
      respondentsResponses: [],
    };
    // const ccdTranslationServiceMock = jest
    //   .spyOn(ccdTranslationService, 'toCcdGeneralApplicationRespondentResponse')
    //   .mockReturnValue(generalApplication);

    const submitRespondToApplicationEventMock = jest
      .spyOn(GaServiceClient.prototype, 'submitRespondToApplicationEvent')
      .mockResolvedValue(new Application());
    
    const getLatestGaMock = jest.spyOn(GaServiceClient.prototype, 'getLatestCcdApplication');
    getLatestGaMock.mockResolvedValue(new ApplicationResponse('567', generalApplication));
    (req as AppRequest).params = {id: '123'};

    //When
    await submitApplicationResponse(req as AppRequest);

    //then
    //expect(result).toBe({});
    //expect(ccdTranslationServiceMock).toBeCalled();
    expect(submitRespondToApplicationEventMock).toBeCalled();
  });

  it('should return http 500 when has error in the get method', async () => {
    mockGetClaim.mockImplementation(() => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await expect(submitApplicationResponse(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});

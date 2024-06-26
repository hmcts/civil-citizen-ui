import {app} from '../../../../../../main/app';
import request from 'supertest';
import {Claim} from 'models/claim';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {req} from '../../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';
import {submitApplicationResponse} from 'services/features/generalApplication/response/submitApplicationResponse';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {GaServiceClient} from 'client/gaServiceClient';
import { ApplicationResponse, CCDApplication } from 'common/models/generalApplication/applicationResponse';
import { CCDGeneralApplication, CCDRespondToApplication } from 'common/models/gaEvents/eventDto';
import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { CcdGARespondentDebtorOfferGAspec, CcdGeneralApplicationHearingDetails } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import * as CcdTraslation from 'services/translation/generalApplication/ccdTranslation';
import { configureSpy } from '../../../../../utils/spyConfiguration';
import * as GeneralApplicationResponseStoreService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/utilityService');
jest.mock('../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService');

const mockGetDraftGARespondentResponse = GeneralApplicationResponseStoreService.getDraftGARespondentResponse as jest.Mock;
const ccdTranslationServiceMock = configureSpy(CcdTraslation, 'toCcdGeneralApplicationWithResponse');
request(app);

describe('Submit application to ccd', () => {
  const claim = new Claim();

  afterAll(() => jest.clearAllMocks());

  it('should submit claim successfully when there are no errors', async () => {
    const ccdGeneralApplication: Partial<CCDApplication> = {
      generalAppType: {types: [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]},
      generalAppRespondentAgreement: { hasAgreed: YesNoUpperCamelCase.NO },
      generalAppInformOtherParty: { isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: ''},
    };
    const ccdGaWithResponse: Partial<CCDRespondToApplication> = {
      ...ccdGeneralApplication, 
      hearingDetailsResp: {} as CcdGeneralApplicationHearingDetails,
      gaRespondentDebtorOffer: {} as CcdGARespondentDebtorOfferGAspec,
    };

    ccdTranslationServiceMock.mockReturnValue(ccdGaWithResponse as CCDGeneralApplication);

    const submitRespondToApplicationEventMock = configureSpy(GaServiceClient.prototype, 'submitRespondToApplicationEvent')
      .mockResolvedValue({id: '17012012' });
    
    configureSpy(GaServiceClient.prototype, 'getApplication')
      .mockResolvedValue(new ApplicationResponse('17012012', ccdGeneralApplication as CCDApplication));
    (req as AppRequest).params = { id: '123', appId: '17012012'};
    req.session.user ={...req.session?.user, id: 'a1b2'};

    //When
    const result = await submitApplicationResponse(req as AppRequest);

    //then
    expect(result).toMatchObject({id: '17012012' });
    expect(ccdTranslationServiceMock).toBeCalledWith(ccdGeneralApplication, claim.generalApplication);
    expect(submitRespondToApplicationEventMock).toHaveBeenCalled();
    expect(submitRespondToApplicationEventMock).toBeCalledWith(
      '17012012', ccdGaWithResponse, req);
  });

  it('should return http 500 when has error in the get method', async () => {
    mockGetDraftGARespondentResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));

    await expect(submitApplicationResponse(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});

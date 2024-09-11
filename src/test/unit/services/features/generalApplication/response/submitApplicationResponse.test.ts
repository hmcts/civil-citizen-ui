import {app} from '../../../../../../main/app';
import request from 'supertest';
import {Claim} from 'models/claim';
import {req} from '../../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';
import {submitApplicationResponse} from 'services/features/generalApplication/response/submitApplicationResponse';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {GaServiceClient} from 'client/gaServiceClient';
import {CCDGeneralApplication, CCDRespondToApplication} from 'common/models/gaEvents/eventDto';
import {
  CcdGARespondentDebtorOfferGAspec,
  CcdGeneralApplicationHearingDetails,
} from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import * as CcdTraslation from 'services/translation/generalApplication/ccdTranslation';
import {configureSpy} from '../../../../../utils/spyConfiguration';
import * as GeneralApplicationResponseStoreService
  from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

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
    const ccdGaWithResponse: Partial<CCDRespondToApplication> = {
      hearingDetailsResp: {} as CcdGeneralApplicationHearingDetails,
      gaRespondentDebtorOffer: {} as CcdGARespondentDebtorOfferGAspec,
    };

    ccdTranslationServiceMock.mockReturnValue(ccdGaWithResponse as CCDGeneralApplication);

    const submitRespondToApplicationEventMock = configureSpy(GaServiceClient.prototype, 'submitRespondToApplicationEvent')
      .mockResolvedValue({id: '17012012' });

    (req as AppRequest).params = { id: '123', appId: '17012012'};
    req.session.user ={...req.session?.user, id: 'a1b2'};

    //When
    const result = await submitApplicationResponse(req as AppRequest);

    //then
    expect(result).toMatchObject({id: '17012012' });
    expect(ccdTranslationServiceMock).toBeCalledWith(claim.generalApplication);
    expect(submitRespondToApplicationEventMock).toHaveBeenCalled();
    expect(submitRespondToApplicationEventMock).toBeCalledWith(
      '17012012', ccdGaWithResponse, req);
  });

  it('should submit claim successfully for urgent cases', async () => {
    const ccdGaWithResponse: Partial<CCDRespondToApplication> = {
      hearingDetailsResp: {} as CcdGeneralApplicationHearingDetails,
      gaRespondentDebtorOffer: {} as CcdGARespondentDebtorOfferGAspec,
    };

    ccdTranslationServiceMock.mockReturnValue(ccdGaWithResponse as CCDGeneralApplication);
    const gaResponse = new GaResponse();
    gaResponse.generalAppUrgencyRequirement = {
      generalAppUrgency: YesNoUpperCamelCase.YES,
      urgentAppConsiderationDate: '2025-10-10',
    };
    mockGetDraftGARespondentResponse.mockResolvedValue(gaResponse);
    const submitRespondToApplicationEventForUrgentEventMock = configureSpy(GaServiceClient.prototype, 'submitRespondToApplicationEventForUrgent')
      .mockResolvedValue({id: '17012012'});

    (req as AppRequest).params = {id: '123', appId: '17012012'};
    req.session.user = {...req.session?.user, id: 'a1b2'};

    //When
    const result = await submitApplicationResponse(req as AppRequest);

    //then
    expect(result).toMatchObject({id: '17012012'});
    expect(ccdTranslationServiceMock).toBeCalledWith(claim.generalApplication);
    expect(submitRespondToApplicationEventForUrgentEventMock).toHaveBeenCalled();
    expect(submitRespondToApplicationEventForUrgentEventMock).toBeCalledWith(
      '17012012', ccdGaWithResponse, req);
  });

  it('should return http 500 when has error in the get method', async () => {
    mockGetDraftGARespondentResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));

    await expect(submitApplicationResponse(req as AppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});

import {AppRequest} from 'models/AppRequest';
import {req} from '../../../../utils/UserDetails';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {Claim} from 'models/claim';
import axios, {AxiosInstance} from 'axios';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import * as DraftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl: string = config.get('baseUrl');
const appReq = <AppRequest>req;
appReq.params = {id: '12345'};

describe('Response Deadline Agreed Service', () => {

  describe('saveDeadlineResponse', () => {
    it('should save successfully if deadline response object is defined', async () => {
      //Given
      const responseDeadlineDate = new Date(2023, 6, 22);
      const mockGet = jest.fn().mockResolvedValue({data: responseDeadlineDate});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const deadlineDate= await civilServiceClient.getAgreedDeadlineResponseDate('1', appReq);

      const claim = new Claim();
      claim.respondent1ResponseDeadline = deadlineDate;

      jest.spyOn(CivilServiceClient.prototype, 'getAgreedDeadlineResponseDate').mockResolvedValueOnce(deadlineDate);
      jest.spyOn(DraftStoreService, 'saveDraftClaim').mockReturnValueOnce(Promise.resolve());
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      await setResponseDeadline(claim, appReq);
    });
  });
});

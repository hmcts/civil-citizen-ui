import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {AppRequest} from 'common/models/AppRequest';
import {req} from '../../../utils/UserDetails';
import {GeneralApplicationClient} from 'client/generalApplicationClient';
import {CIVIL_GENERAL_APPLICATIONS_URL, GA_GET_APPLICATION_URL} from 'client/generalApplicationUrls';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl: string = config.get('baseUrl');
const appReq = <AppRequest>req;
appReq.params = {id: '12345'};
appReq.session = {
  user: {
    accessToken: '54321',
    id: '1',
    email: 'test@user.com',
    givenName: 'Test',
    familyName: 'User',
    roles: undefined,
  },
  id: 'id',
  cookie: undefined,
  regenerate: undefined,
  reload: undefined,
  resetMaxAge: undefined,
  save: undefined,
  touch: undefined,
  destroy: undefined,
  lang: undefined,
  previousUrl: undefined,
  claimId: '12345',
  taskLists: undefined,
  assignClaimURL: undefined,
  claimIssueTasklist: false,
  firstContact: undefined,
  fileUpload: undefined,
  issuedAt: 150,
  dashboard: undefined,
};

describe('GeneralApplication Client', () => {
  describe('get GA Applications', () => {
    it('should return GAs successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/generalApplicationsMock.json');
      const mockPost = jest.fn().mockResolvedValue({data: data});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const generalApplicationClient = new GeneralApplicationClient(baseUrl);

      //When
      const claimantDashboardItems = await generalApplicationClient.getApplications(appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toContain(CIVIL_GENERAL_APPLICATIONS_URL);
      expect(claimantDashboardItems.length).toEqual(1);
    });
  });

  describe('get GA Application', () => {
    it('should return GAs successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/applicationMock.json');
      const mockGet = jest.fn().mockResolvedValue({data: data});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const generalApplicationClient = new GeneralApplicationClient(baseUrl);

      //When
      const application = await generalApplicationClient.getApplication(appReq, '1718105701451856');
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockGet.mock.calls[0][0]).toContain(GA_GET_APPLICATION_URL.replace(':caseId','1718105701451856'));
      expect(application.id).toBe(1718105701451856);
    });
  });
});

import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {req} from '../../../utils/UserDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {GaServiceClient} from 'client/gaServiceClient';
import { GA_GET_APPLICATION_URL, GA_SERVICE_CASES_URL } from 'client/gaServiceUrls';
import { Application } from 'common/models/generalApplication/application';

jest.mock('../../../../main/services/features/generalApplication/generalApplicationService');

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

describe('GA Service Client', () => {
  describe('submitEvent', () => {
    it('should submit Event', async () => {
      //Given
      const result = new Application();
      const mockPost = jest.fn().mockResolvedValue({data: result});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);
      //When
      const response = await gaServiceClient.submitEvent(null, '123', null, appReq);
      //Then
      expect(response).toEqual(result);
    });
    it('should throw error on submitEvent', async () => {
      //Given
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);
      //Then
      await expect(gaServiceClient.submitEvent(null, '123', null, appReq)).rejects.toThrow('error');
    });
  });

  describe('getGaFeePaymentRedirectInformation', () => {
    const claimId = '1';
    it('should get payment redirect information', async () => {
      const mockHearingFeePaymentRedirectInfo = {
        status: 'initiated',
        nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      };
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockHearingFeePaymentRedirectInfo});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);

      //When
      const paymentInformationResponse: PaymentInformation = await gaServiceClient.getGaFeePaymentRedirectInformation(claimId,'en', appReq);

      //Then
      expect(paymentInformationResponse).toEqual(mockHearingFeePaymentRedirectInfo);
    });

    it('should throw error on get hearing fee redirect information', async () => {
      //Given
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);

      //Then
      await expect(gaServiceClient.getGaFeePaymentRedirectInformation(claimId,'en', appReq)).rejects.toThrow('error');
    });
  });

  describe('getGaFeePaymentStatus', () => {
    const mockHearingFeePaymentRedirectInfo = {
      status: 'Success',
      nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      externalReference: 'lbh2ogknloh9p3b4lchngdfg63',
      paymentReference: 'RC-1701-0909-0602-0418',
    };
    it('should get payment status info', async () => {
      //Given
      const mockGet = jest.fn().mockResolvedValue({data: mockHearingFeePaymentRedirectInfo});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);

      //When
      const paymentInformationResponse: PaymentInformation = await gaServiceClient.getGaFeePaymentStatus('1', mockHearingFeePaymentRedirectInfo.paymentReference, appReq);

      //Then
      expect(paymentInformationResponse).toEqual(mockHearingFeePaymentRedirectInfo);
    });

    it('should throw error on get hearing fee redirect information', async () => {
      //Given
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);

      //Then
      await expect(gaServiceClient.getGaFeePaymentStatus('1', mockHearingFeePaymentRedirectInfo.paymentReference, appReq)).rejects.toThrow('error');
    });
  });
  describe('get dashboard GA', () => {
    it('should return GAs successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/generalApplicationsMock.json');
      const mockPost = jest.fn().mockResolvedValue({data: data});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);

      //When
      const claimantDashboardItems = await gaServiceClient.getApplications(appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toContain(GA_SERVICE_CASES_URL);
      expect(claimantDashboardItems.length).toEqual(1);
    });
    it('should throw error on getApplications', async () => {
      //Given
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);
      //Then
      await expect(gaServiceClient.getApplications(appReq)).rejects.toThrow('error');
    });
  });

  describe('get GA Applications', () => {
    it('should return GAs successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/generalApplicationsMock.json');
      const mockPost = jest.fn().mockResolvedValue({data: data});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const generalApplicationClient = new GaServiceClient(baseUrl);

      //When
      const claimantDashboardItems = await generalApplicationClient.getApplications(appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toContain(GA_SERVICE_CASES_URL);
      expect(claimantDashboardItems.length).toEqual(1);
    });
  });

  describe('get GA Application', () => {
    it('should return GAs successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/applicationMock.json');
      const mockGet = jest.fn().mockResolvedValue({data: data});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const generalApplicationClient = new GaServiceClient(baseUrl);

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

  describe('getApplication', () => {
    it('should return application', async () => {
      const mockData = require('../../../utils/mocks/generalApplicationsMock.json');
      const mockGet = jest.fn().mockResolvedValue({data: mockData.cases[0]});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const gaServiceClient = new GaServiceClient(baseUrl);

      const application = await gaServiceClient.getApplication(appReq, '1645882162449409');

      expect(application).toMatchObject(mockData.cases[0]);
      expect(mockGet).toBeCalledWith('/cases/1645882162449409',
        { headers: { Authorization: 'Bearer 54321', 'Content-Type': 'application/json'} as AxiosRequestConfig});
    });
  });
});


import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {req} from '../../../utils/UserDetails';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {GaServiceClient} from 'client/gaServiceClient';

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
};

describe('GA Service Client', () => {
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
      const paymentInformationResponse: PaymentInformation = await gaServiceClient.getGaFeePaymentRedirectInformation(claimId, appReq);

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
      await expect(gaServiceClient.getGaFeePaymentRedirectInformation(claimId, appReq)).rejects.toThrow('error');
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
});

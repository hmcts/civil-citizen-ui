import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';
import axios, {AxiosInstance} from 'axios';
import {Claim} from '../../../../main/common/models/claim';
import * as requestModels from '../../../../main/common/models/AppRequest';
import {CivilClaimResponse} from '../../../../main/common/models/civilClaimResponse';
import config from 'config';
import {
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
} from '../../../../main/app/client/civilServiceUrls';
import {CounterpartyType} from '../../../../main/common/models/counterpartyType';
import {mockClaim} from '../../../utils/mockClaim';
import {TestMessages} from '../../../utils/errorMessageTestConstants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl:string = config.get('baseUrl');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;

describe('Civil Service Client', () => {
  describe('retrieveByDefendantId', ()=>{
    it('should retrieve cases successfully', async () => {
      //Given
      const claim = new Claim();
      claim.legacyCaseReference = '000MC003';
      claim.applicant1 =
        {
          individualTitle: 'Mrs',
          individualLastName: 'Clark',
          individualFirstName: 'Jane',
          type : CounterpartyType.INDIVIDUAL,
        };
      claim.totalClaimAmount = 1500;

      const mockResponse: CivilClaimResponse = {
        id:'1',
        case_data: claim,
      };

      const mockPost = jest.fn().mockResolvedValue({data: {cases: [mockResponse]}});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const actualClaims: CivilClaimResponse[] = await civilServiceClient.retrieveByDefendantId(mockedAppRequest);

      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_CASES_URL);
      expect(actualClaims.length).toEqual(1);
      expect(actualClaims[0].case_data.legacyCaseReference).toEqual('000MC003');
      expect(actualClaims[0].case_data.applicant1?.individualFirstName).toEqual('Jane');
      expect(actualClaims[0].case_data.applicant1?.individualLastName).toEqual('Clark');
    });
  });
  describe('getFeeRanges', ()=>{
    it('should return fee ranges successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/feeRangesMock.json');
      const mockGet = jest.fn().mockResolvedValue({data: data});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const feeRanges = await civilServiceClient.getFeeRanges(mockedAppRequest);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockGet.mock.calls[0][0]).toEqual(CIVIL_SERVICE_FEES_RANGES);
      expect(feeRanges.value.length).toEqual(15);
      expect(feeRanges.value[0].minRange).toEqual(data[0].min_range);
      expect(feeRanges.value[0].maxRange).toEqual(data[0].max_range);
    });
  });
  describe('retrieveDocument', () => {
    it('should download document successfully', async () => {
      const mockDocumentDetails = mockClaim.systemGeneratedCaseDocuments[0].value;
      const mockResponse = '<Buffer 25 50 44 73 5b 20 32 20 30 20 52 20 20 34 20 30 20 52 20>';
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //When
      const actualPdfDocument: Buffer = await civilServiceClient.retrieveDocument(mockDocumentDetails, mockedAppRequest);
      //Then
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL);
      expect(actualPdfDocument.length).toEqual(mockResponse.length);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
        responseEncoding: 'binary',
        responseType: 'arraybuffer',
      });
    });
    it('should return error', async () => {
      const mockDocumentDetails = mockClaim.systemGeneratedCaseDocuments[0].value;
      const mockPost = jest.fn().mockResolvedValue({status: 500});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      await expect(civilServiceClient.retrieveDocument(mockDocumentDetails, mockedAppRequest)).rejects.toThrow(TestMessages.DOCUMENT_NOT_AVAILABLE);
    });
  });
});

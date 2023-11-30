import axios, {AxiosInstance} from 'axios';
import * as requestModels from 'common/models/AppRequest';
import {CCDClaim, CivilClaimResponse, ClaimFeeData} from 'common/models/civilClaimResponse';
import config from 'config';
import {
  CIVIL_SERVICE_CALCULATE_DEADLINE,
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_CLAIMANT, CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_SUBMIT_EVENT,
  CIVIL_SERVICE_UPLOAD_DOCUMENT_URL,
} from 'client/civilServiceUrls';
import {PartyType} from 'common/models/partyType';
import {mockClaim} from '../../../utils/mockClaim';

import {CaseState} from 'common/form/models/claimDetails';
import {CourtLocation} from 'common/models/courts/courtLocations';
import {TestMessages} from '../../../utils/errorMessageTestConstants';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'models/document/caseDocument';

import {FileUpload} from 'models/caseProgression/fileUpload';
import {FileResponse} from 'models/FileResponse';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {CCDClaimantProposedPlan} from 'models/claimantResponse/ClaimantProposedPlan';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl: string = config.get('baseUrl');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
const ccdClaim : CCDClaim = {
  legacyCaseReference : '000MC003',
  applicant1 : {
    companyName: undefined,
    individualDateOfBirth: undefined,
    organisationName: undefined,
    partyEmail: undefined,
    partyPhone: undefined,
    primaryAddress: undefined,
    soleTraderDateOfBirth: undefined,
    soleTraderFirstName: undefined,
    soleTraderLastName: undefined,
    soleTraderTitle: undefined,
    soleTraderTradingAs: undefined,
    individualTitle: 'Mrs',
    individualLastName: 'Clark',
    individualFirstName: 'Jane',
    type: PartyType.INDIVIDUAL,
  },
  claimantUserDetails: {
    email: 'email',
    id: '1',
  },
};

const ccdClaimTrialArrangements : CCDClaim = {
  legacyCaseReference : '000MC003',
  trialReadyRespondent1: YesNoUpperCamelCase.YES,
  respondent1HearingOtherComments: {hearingOtherComments: 'Other comments'},
  respondent1RevisedHearingRequirements: {revisedHearingRequirements: YesNoUpperCamelCase.YES, revisedHearingComments: 'revised'},
};

describe('Civil Service Client', () => {
  describe('get dashboard claims for claimant', () => {
    it('should return claimant claims successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/claimantClaimsMock.json');
      const mockGet = jest.fn().mockResolvedValue({data: data});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const claimantDashboardItems = await civilServiceClient.getClaimsForClaimant(mockedAppRequest);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockGet.mock.calls[0][0]).toContain(CIVIL_SERVICE_CLAIMANT);
      expect(claimantDashboardItems.claims.length).toEqual(1);
      expect(claimantDashboardItems.claims[0].claimNumber).toEqual(data.claims[0].claimNumber);
      expect(claimantDashboardItems.claims[0].claimantName).toEqual(data.claims[0].claimantName);
      expect(claimantDashboardItems.claims[0].defendantName).toEqual(data.claims[0].defendantName);
      expect(claimantDashboardItems.claims[0].claimAmount).toEqual(data.claims[0].claimAmount);
      expect(claimantDashboardItems.claims[0].responseDeadline).toEqual(data.claims[0].responseDeadline);
    });
  });
  describe('retrieveByDefendantId', () => {
    it('should retrieve cases successfully', async () => {
      //Given
      const mockResponse: CivilClaimResponse = {
        id: '1',
        case_data: ccdClaim,
        last_modified: new Date(),
        state: CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT,
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
  describe('getFeeRanges', () => {
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
      expect(feeRanges.value.length).toBeLessThan(data.length);
      expect(feeRanges.value[0].minRange).toEqual(data[0].min_range);
      expect(feeRanges.value[0].maxRange).toEqual(data[0].max_range);
    });
  });
  describe('uploadDocument', () => {
    const mockBuffer = Buffer.from('<Buffer 25 50 44 73 5b 20 32 20 30 20 52 20 20 34 20 30 20 52 20>');
    const mockFile : FileUpload = {  fieldname: 'field',
      originalname: 'name',
      mimetype: 'mimetype',
      buffer: mockBuffer,
      size: 12345,
    };

    it('should upload document successfully', async () => {
      //Given
      const mockCaseDocument: CaseDocument = <CaseDocument>{  createdBy: 'test',
        documentLink: {document_url: '', document_binary_url:'', document_filename:''},
        documentName: 'name',
        documentType: null,
        documentSize: 12345,
        createdDatetime: new Date()};

      const mockPost = jest.fn().mockResolvedValue({data: mockCaseDocument});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //When
      const actualCaseDocument: CaseDocument = await civilServiceClient.uploadDocument(mockedAppRequest, mockFile);
      //Then
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_UPLOAD_DOCUMENT_URL);
      expect(actualCaseDocument.documentName).toEqual(mockCaseDocument.documentName);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
        responseEncoding: 'binary',
        responseType: 'arraybuffer',
      });
    });
    it('should upload document successfully when response is utf-8', async () => {
      //Given
      const encoder = new TextEncoder();
      const mockCaseDocument: CaseDocument = <CaseDocument>{  createdBy: 'test',
        documentLink: {document_url: '', document_binary_url:'', document_filename:''},
        documentName: 'name',
        documentType: null,
        documentSize: 12345,
        createdDatetime: new Date()};
      const mockPostUTF8 = jest.fn().mockResolvedValue({data: encoder.encode(JSON.stringify(mockCaseDocument))});
      mockedAxios.create.mockReturnValueOnce({post: mockPostUTF8} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //When
      const actualCaseDocument: CaseDocument = await civilServiceClient.uploadDocument(mockedAppRequest, mockFile);
      //Then
      expect(mockPostUTF8.mock.calls[0][0]).toEqual(CIVIL_SERVICE_UPLOAD_DOCUMENT_URL);
      expect(actualCaseDocument.documentName).toEqual(mockCaseDocument.documentName);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
        responseEncoding: 'binary',
        responseType: 'arraybuffer',
      });
    });
    it('should return error', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({status: 500});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //Then
      await expect(civilServiceClient.uploadDocument(mockedAppRequest, mockFile)).rejects.toThrow(TestMessages.DOCUMENT_UPLOAD_UNSUCCESSFUL);
    });
  });
  describe('retrieveDocument', () => {
    it('should download document successfully', async () => {
      //Given
      const mockDocumentDetails = mockClaim.systemGeneratedCaseDocuments[0].value;
      const mockResponse = Buffer.from('test');
      const mockData = {
        data: mockResponse,
        headers: {
          'content-type': 'application/json',
          'original-file-name': 'example.json',
        }};

      const mockGet = jest.fn().mockResolvedValue(mockData);

      const documentId: string = documentIdExtractor(mockDocumentDetails.documentLink.document_binary_url);

      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);

      const { data: byteArrayMock, headers: { 'content-type': contentType, 'original-file-name': originalFilename } } = mockData;
      const fileResponseExpected = new FileResponse(
        contentType,
        originalFilename,
        byteArrayMock,
      );

      //When
      const fileResponse: FileResponse = await civilServiceClient.retrieveDocument(mockedAppRequest, documentId);

      //Then
      expect(mockGet.mock.calls[0][0]).toEqual(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL.replace(':documentId', documentId));
      expect(fileResponse).toEqual(fileResponseExpected);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
        responseEncoding: 'binary',
        responseType: 'arraybuffer',
      });
    });

    it('should return error', async () => {
      //Given
      const mockDocumentDetails = mockClaim.systemGeneratedCaseDocuments[0].value;
      const documentId: string = documentIdExtractor(mockDocumentDetails.documentLink.document_binary_url);
      const mockGet = jest.fn().mockRejectedValueOnce({ status: 404 });

      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //Then
      await expect(civilServiceClient.retrieveDocument(mockedAppRequest, documentId)).rejects.toEqual({'status': 404});
    });
  });
  describe('submitDefendantResponseEvent', () => {
    it('should submit defendant response successfully', async () => {
      //Given
      const mockResponse = new CivilClaimResponse();
      mockResponse.id = '1';
      mockResponse.case_data = ccdClaim;
      mockResponse.state = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;

      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitDefendantResponseEvent('123', {}, mockedAppRequest);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', 'undefined')
        .replace(':caseId', '123'));
      expect(claim.applicant1.partyDetails.individualTitle).toEqual(mockClaim.applicant1.partyDetails.individualTitle);
      expect(claim.applicant1.partyDetails.individualFirstName).toEqual(mockClaim.applicant1.partyDetails.individualFirstName);
      expect(claim.applicant1.partyDetails.individualLastName).toEqual(mockClaim.applicant1.partyDetails.individualLastName);
    });
    it('should throw error when there is an error with api', async () => {
      //Given
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.submitDefendantResponseEvent('123', {}, mockedAppRequest)).rejects.toThrow('error');
    });
  });

  describe('getClaimsForDefendant', () => {
    it('should return claims for defendant successfully', async () => {
      //Given
      const data = require('../../../utils/mocks/defendantClaimsMock.json');
      const mockGet = jest.fn().mockResolvedValue({ data: { claims: data, totalPages: 1 } });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const defendantDashboardItems = await civilServiceClient.getClaimsForDefendant(mockedAppRequest);

      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(defendantDashboardItems.claims.length).toEqual(1);
      expect(defendantDashboardItems.claims[0].defendantName).toEqual(data[0].defendantName);
      expect(defendantDashboardItems.claims[0].claimantName).toEqual(data[0].claimantName);
      expect(defendantDashboardItems.claims[0].claimNumber).toEqual(data[0].claimNumber);
    });
  });
  describe('calculateExtendedResponseDeadline', () => {
    it('should return calculated deadline date successfully', async () => {
      //Given
      const responseDeadlineDate = new Date(2022, 10, 31);
      const mockPost = jest.fn().mockResolvedValue({data: responseDeadlineDate});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const calculatedDeadlineDate = await civilServiceClient.calculateExtendedResponseDeadline(responseDeadlineDate,5, mockedAppRequest);

      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_CALCULATE_DEADLINE);
      expect(calculatedDeadlineDate).toEqual(responseDeadlineDate);
    });
    it('should throw error when there is an error with api call', async () => {
      //Given
      const responseDeadlineDate = new Date(2022, 10, 31);
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.calculateExtendedResponseDeadline(responseDeadlineDate, 5, mockedAppRequest)).rejects.toThrow('error');
    });
  });
  describe('getCourtLocations test', () => {
    it('should return court locations successfully', async () => {
      //Given
      const courtLocations = [new CourtLocation('1', 'location1'), new CourtLocation('2', 'location2')];
      const mockGet = jest.fn().mockResolvedValue({data: courtLocations});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const locations = await civilServiceClient.getCourtLocations(mockedAppRequest);
      //Then
      expect(locations.length).toBe(2);
      expect(locations[0].label).toBe(courtLocations[0].label);
      expect(locations[0].code).toBe(courtLocations[0].code);
      expect(locations[1].label).toBe(courtLocations[1].label);
      expect(locations[1].code).toBe(courtLocations[1].code);
    });
  });
  describe('assignDefendantToClaim', ()=> {
    it('should call civil service api to assign a logged in user to a claim successfully', async () => {
      //Given
      const claimId = '1';
      const mockPost = jest.fn().mockResolvedValue({data:{}});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      await civilServiceClient.assignDefendantToClaim(claimId, mockedAppRequest);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
    });
    it('should throw error when there is an error calling civil service to assign logged in user to a claim', async () => {
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.assignDefendantToClaim('1', mockedAppRequest)).rejects.toThrow('error');
    });
  });

  describe('getResponseDeadlineDate', () => {
    it('should return response deadline date successfully', async () => {
      //Given
      const responseDeadlineDate = new Date(2023, 6, 22);
      const mockGet = jest.fn().mockResolvedValue({data: responseDeadlineDate});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const deadlineDate= await civilServiceClient.getAgreedDeadlineResponseDate('1', mockedAppRequest);
      //Then
      expect(deadlineDate).toStrictEqual(responseDeadlineDate);
    });
    it('should throw error when there is an error calling civil service getting the deadline date', async () => {
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.getAgreedDeadlineResponseDate('1', mockedAppRequest)).rejects.toThrow('error');
    });
  });

  describe('getUserCaseRoles', () => {
    it('should return User Case Roles successfully', async () => {
      //Given
      const caseRoleExpected = [CaseRole.RESPONDENTSOLICITORTWO];
      const mockGet = jest.fn().mockResolvedValue({data: caseRoleExpected});
      mockedAxios.create.mockReturnValueOnce({get: mockGet, defaults: {
        baseURL: baseUrl,
      }} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const caseRoleResult = await civilServiceClient.getUserCaseRoles('1', mockedAppRequest);
      //Then
      expect(caseRoleResult).toStrictEqual(caseRoleExpected[0]);
    });

    it('should throw error when there is an error calling civil service getting User roles', async () => {
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet, defaults: {
        baseURL: baseUrl,
      }} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.getUserCaseRoles('1', mockedAppRequest)).rejects.toThrow('error');
    });
  });
  describe('submitDefendantResponseEvent', () => {
    it('should submit defendant response successfully', async () => {
      //Given
      const date = new Date();
      const data = new Claim();
      data.issueDate = date;
      data.respondent1ResponseDeadline = date;

      const mockResponse = new CivilClaimResponse();
      mockResponse.id = '1';
      mockResponse.case_data = {
        respondent1ResponseDeadline : date,
        issueDate: date,
      };
      mockResponse.state = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;

      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitClaimAfterPayment('123', data, mockedAppRequest);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', 'undefined')
        .replace(':caseId', '123'));
      expect(claim.issueDate).toEqual(date);
      expect(claim.respondent1ResponseDeadline).toEqual(date);
    });
    it('should throw error when there is an error with api', async () => {
      //Given
      const date = new Date();
      const data = new Claim();
      data.issueDate = date;
      data.respondent1ResponseDeadline = date;

      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.submitClaimAfterPayment('123', data, mockedAppRequest)).rejects.toThrow('error');
    });
  });

  describe('submitDefendantTrialArrangements', () => {
    it('should submit defendant trial arrangement successfully', async () => {
      //Given
      const mockResponse = new CivilClaimResponse();
      mockResponse.id = '1';
      mockResponse.case_data = ccdClaimTrialArrangements;

      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitDefendantTrialArrangement('123', {}, mockedAppRequest);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', 'undefined')
        .replace(':caseId', '123'));
      expect(claim.caseProgression.defendantTrialArrangements.isCaseReady).toEqual('yes');
      expect(claim.caseProgression.defendantTrialArrangements.otherTrialInformation).toEqual('Other comments');
      expect(claim.caseProgression.defendantTrialArrangements.hasAnythingChanged.textArea).toEqual('revised');
      expect(claim.caseProgression.defendantTrialArrangements.hasAnythingChanged.option).toEqual('yes');

    });

    describe('get court decision event', () => {
      it('should get court decision', async () => {
        //Given
        const mockResponse= RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;

        const mockClaimantIntention: CCDClaimantProposedPlan = {
          repaymentPlanLRspec: undefined,
          proposedRepaymentType: CCDPaymentOption.IMMEDIATELY,
          repaymentByDate: undefined,
        };

        const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
        mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
        const civilServiceClient = new CivilServiceClient(baseUrl);

        //When
        const courtDecision: RepaymentDecisionType = await civilServiceClient.getCalculatedDecisionOnClaimantProposedRepaymentPlan('111', mockedAppRequest, mockClaimantIntention);

        //Then
        expect(mockedAxios.create).toHaveBeenCalledWith({
          baseURL: baseUrl,
        });
        expect(courtDecision).toEqual(RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT);

      });
      it('should throw error when there is an error with api', async () => {
        //Given
        const mockClaimantIntention: CCDClaimantProposedPlan = {
          repaymentPlanLRspec: undefined,
          proposedRepaymentType: CCDPaymentOption.IMMEDIATELY,
          repaymentByDate: undefined,
        };

        const mockPost = jest.fn().mockImplementation(() => {
          throw new Error('error');
        });
        mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
        const civilServiceClient = new CivilServiceClient(baseUrl);
        //Then
        await expect(civilServiceClient.getCalculatedDecisionOnClaimantProposedRepaymentPlan('111', mockedAppRequest, mockClaimantIntention)).rejects.toThrow('error');
      });
    });

    it('should throw error when there is an error with api', async () => {
      //Given
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.submitDefendantTrialArrangement('123', {}, mockedAppRequest)).rejects.toThrow('error');
    });
  });
  describe('getClaimFeeData', () => {
    const mockData = {
      calculatedAmountInPence: 123,
      code: 'code',
      version: 1,
    };

    it('should get claim fee data', async () => {
      //Given
      const mockGet = jest.fn().mockResolvedValue({data: mockData});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);

      //When
      const feeResponse: ClaimFeeData = await civilServiceClient.getClaimFeeData(100, mockedAppRequest);

      //Then
      expect(feeResponse).toEqual(mockData);
    });

    it('should get claim fee amount', async () => {
      //Given
      const mockGet = jest.fn().mockResolvedValue({data: mockData});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);

      //When
      const feeAmount: number = await civilServiceClient.getClaimAmountFee(100, mockedAppRequest);

      //Then
      expect(feeAmount).toEqual(mockData.calculatedAmountInPence / 100);
    });

    it('should throw error on get claim fee data', async () => {
      //Given
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);

      //Then
      await expect(civilServiceClient.getClaimAmountFee(100, mockedAppRequest)).rejects.toThrow('error');
    });
  });
});

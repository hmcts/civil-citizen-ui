import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {CCDClaim, CivilClaimResponse, ClaimFeeData} from 'common/models/civilClaimResponse';
import config from 'config';
import {
  CIVIL_SERVICE_CALCULATE_DEADLINE,
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_CLAIMANT, CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL, CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_FEES_RANGES, CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL,
  CIVIL_SERVICE_SUBMIT_EVENT, CIVIL_SERVICE_UPDATE_TASK_STATUS_URL,
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
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {AppRequest} from 'common/models/AppRequest';
import {req} from '../../../utils/UserDetails';
import { ApplicationTypeOption } from 'models/generalApplication/applicationType';
import {ClaimUpdate} from 'models/events/eventDto';
import {CCDGeneralApplication} from 'models/gaEvents/eventDto';

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
  qmShareConfirmed: false,
};
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
      const claimantDashboardItems = await civilServiceClient.getClaimsForClaimant(appReq);
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
      const actualClaims: CivilClaimResponse[] = await civilServiceClient.retrieveByDefendantId(appReq);

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
      const feeRanges = await civilServiceClient.getFeeRanges(appReq);
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
      const actualCaseDocument: CaseDocument = await civilServiceClient.uploadDocument(appReq, mockFile);
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
      const actualCaseDocument: CaseDocument = await civilServiceClient.uploadDocument(appReq, mockFile);
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
      await expect(civilServiceClient.uploadDocument(appReq, mockFile)).rejects.toThrow(TestMessages.DOCUMENT_UPLOAD_UNSUCCESSFUL);
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
      const fileResponse: FileResponse = await civilServiceClient.retrieveDocument(appReq, documentId);

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
      await expect(civilServiceClient.retrieveDocument(appReq, documentId)).rejects.toEqual({'status': 404});
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
      const claim = await civilServiceClient.submitDefendantResponseEvent('123', {}, appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
        .replace(':caseId', '123'));
      expect(claim.applicant1.partyDetails.title).toEqual(mockClaim.applicant1.partyDetails.title);
      expect(claim.applicant1.partyDetails.firstName).toEqual(mockClaim.applicant1.partyDetails.firstName);
      expect(claim.applicant1.partyDetails.lastName).toEqual(mockClaim.applicant1.partyDetails.lastName);
    });
    it('should throw error when there is an error with api', async () => {
      //Given
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.submitDefendantResponseEvent('123', {}, appReq)).rejects.toThrow('error');
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
      const defendantDashboardItems = await civilServiceClient.getClaimsForDefendant(appReq);

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
      const calculatedDeadlineDate = await civilServiceClient.calculateExtendedResponseDeadline(responseDeadlineDate,5, appReq);

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
      await expect(civilServiceClient.calculateExtendedResponseDeadline(responseDeadlineDate, 5, appReq)).rejects.toThrow('error');
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
      const locations = await civilServiceClient.getCourtLocations(appReq);
      //Then
      expect(locations.length).toBe(2);
      expect(locations[0].label).toBe(courtLocations[0].label);
      expect(locations[0].code).toBe(courtLocations[0].code);
      expect(locations[1].label).toBe(courtLocations[1].label);
      expect(locations[1].code).toBe(courtLocations[1].code);
    });
    it('should return error', async () => {
      //Given
      const mockGet = jest.fn().mockRejectedValueOnce({ status: 404 });

      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //Then
      await expect(civilServiceClient.getCourtLocations(appReq)).rejects.toEqual({'status': 404});
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
      await civilServiceClient.assignDefendantToClaim(claimId, appReq, '123');
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
      await expect(civilServiceClient.assignDefendantToClaim('1', appReq, '123')).rejects.toThrow('error');
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
      const deadlineDate= await civilServiceClient.getAgreedDeadlineResponseDate('1', appReq);
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
      await expect(civilServiceClient.getAgreedDeadlineResponseDate('1', appReq)).rejects.toThrow('error');
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
      const caseRoleResult = await civilServiceClient.getUserCaseRoles('1', appReq);
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
      await expect(civilServiceClient.getUserCaseRoles('1', appReq)).rejects.toThrow('error');
    });
  });
  describe('submitDefendantResponseEvent', () => {
    const date = new Date();
    const data = new Claim();
    data.issueDate = date;
    data.respondent1ResponseDeadline = date;
    const claimUpdate:ClaimUpdate =  {issueDate: date, respondent1ResponseDeadline: date};
    const ccdGApp:CCDGeneralApplication =  {generalAppInformOtherParty: undefined, generalAppAskForCosts: undefined
      , generalAppType: undefined, generalAppRespondentAgreement: undefined, generalAppDetailsOfOrder: undefined
      , generalAppReasonsOfOrder: undefined, generalAppHearingDetails: undefined, generalAppStatementOfTruth: undefined
      , generalAppEvidenceDocument: undefined};

    const mockResponse = new CivilClaimResponse();
    mockResponse.id = '1';
    mockResponse.case_data = {
      respondent1ResponseDeadline : date,
      issueDate: date,
    };
    mockResponse.state = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    it('should submit defendant response successfully', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitClaimAfterPayment('123', data, appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
        .replace(':caseId', '123'));
      expect(claim.issueDate).toEqual(date);
      expect(claim.respondent1ResponseDeadline).toEqual(date);
    });
    it('should submit submitDraftClaim successfully', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitDraftClaim(claimUpdate, appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
        .replace(':caseId', 'draft'));
      expect(claim.issueDate).toEqual(date);
      expect(claim.respondent1ResponseDeadline).toEqual(date);
    });
    it('should submit submitClaimSettled successfully', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitClaimSettled('123',claimUpdate, appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
        .replace(':caseId', '123'));
      expect(claim.issueDate).toEqual(date);
      expect(claim.respondent1ResponseDeadline).toEqual(date);
    });
    it('should submit submitCreateServiceRequestEvent successfully', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitCreateServiceRequestEvent('123', appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
        .replace(':caseId', '123'));
      expect(claim.issueDate).toEqual(date);
      expect(claim.respondent1ResponseDeadline).toEqual(date);
    });
    it('should submit submitJudgmentPaidInFull successfully', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitJudgmentPaidInFull('123', claimUpdate,appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
        .replace(':caseId', '123'));
      expect(claim.issueDate).toEqual(date);
      expect(claim.respondent1ResponseDeadline).toEqual(date);
    });
    it('should submit submitInitiateGeneralApplicationEvent successfully', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitInitiateGeneralApplicationEvent('123', ccdGApp,appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
        .replace(':caseId', '123'));
      expect(claim.issueDate).toEqual(date);
      expect(claim.respondent1ResponseDeadline).toEqual(date);
    });

    it('should submit submitInitiateGeneralApplicationForCOSCEvent successfully', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      const claim = await civilServiceClient.submitInitiateGeneralApplicationEventForCosc('123', ccdGApp,appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
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
      await expect(civilServiceClient.submitClaimAfterPayment('123', data, appReq)).rejects.toThrow('error');
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
      const claim = await civilServiceClient.submitTrialArrangement('123', {}, appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId', '1')
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
        const courtDecision: RepaymentDecisionType = await civilServiceClient.getCalculatedDecisionOnClaimantProposedRepaymentPlan('111', appReq, mockClaimantIntention);

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
        await expect(civilServiceClient.getCalculatedDecisionOnClaimantProposedRepaymentPlan('111', appReq, mockClaimantIntention)).rejects.toThrow('error');
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
      await expect(civilServiceClient.submitTrialArrangement('123', {}, appReq)).rejects.toThrow('error');
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
      const feeResponse: ClaimFeeData = await civilServiceClient.getClaimFeeData(100, appReq);

      //Then
      expect(feeResponse).toEqual(mockData);
    });

    it('should get claim fee amount', async () => {
      //Given
      const mockGet = jest.fn().mockResolvedValue({data: mockData});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);

      //When
      const feeAmount: number = await civilServiceClient.getClaimAmountFee(100, appReq);

      //Then
      expect(feeAmount).toEqual(mockData.calculatedAmountInPence / 100);
    });
    describe('getAirlines', () => {
      const mockData = [
        {airline: 'airline 1', epimsID: '1'},
        {airline: 'airline 2', epimsID: '2'},
      ];
      it('should get airline list', async () => {
        //Given
        const mockGet = jest.fn().mockResolvedValue({data: mockData});
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        const civilServiceClient = new CivilServiceClient(baseUrl, true);
        //When
        const airlines = await civilServiceClient.getAirlines(appReq);
        //Then
        expect(airlines).toEqual(mockData);
      });
      it('should throw error when there is an error with api', async () => {
        //Given
        const mockGet = jest.fn().mockImplementation(() => {
          throw new Error('error');
        });
        mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
        const civilServiceClient = new CivilServiceClient(baseUrl);
        //Then
        await expect(civilServiceClient.getAirlines(appReq)).rejects.toThrow('error');
      });
    });
    it('should throw error on get claim fee data', async () => {
      //Given
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);

      //Then
      await expect(civilServiceClient.getClaimAmountFee(100, appReq)).rejects.toThrow('error');
    });
  });
  describe('getGeneralApplicationFeeData', () => {
    const mockData = {
      calculatedAmountInPence: 123,
      code: 'code',
      version: 1,
    };

    it('should get ga app fee amount', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({ data: mockData });
      mockedAxios.create.mockReturnValueOnce({ post: mockPost } as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //When
      const feeAmount = await civilServiceClient.getGeneralApplicationFee({ applicationTypes: [ApplicationTypeOption.STRIKE_OUT], withConsent: false, withNotice: true, hearingDate: null }, appReq);
      //Then
      expect(feeAmount).toEqual(mockData);
    });

    it('should throw error on get ga app fee data', async () => {
      //Given
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({ post: mockGet } as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //Then
      await expect(civilServiceClient.getGeneralApplicationFee({ applicationTypes: undefined, withConsent: undefined, withNotice: true, hearingDate: null }, appReq)).rejects.toThrow('error');
    });
  });
  describe('verifyOcmcPin', () => {

    it('should get redirectUrl for OCMC claimSummary', async () => {
      const mockResponse: AxiosResponse = {
        config: undefined, headers: undefined, statusText: 'OK',
        status: 200,
        data: 'https://redirectUrl',
      };
      //Given
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const redirectUrl: string = await civilServiceClient.verifyOcmcPin('100010000', '604JE498');

      //Then
      expect(redirectUrl).toEqual('https://redirectUrl');
    });
    it('should get null for undefined data', async () => {
      const mockResponse: AxiosResponse = {
        config: undefined, headers: undefined, statusText: 'OK',
        status: 200,
        data: undefined,
      };
      //Given
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const redirectUrl: string = await civilServiceClient.verifyOcmcPin('100010000', '604JE498');

      //Then
      expect(redirectUrl).toEqual(null);
    });
    it('should get new Claim for undefined data', async () => {
      const mockResponse: AxiosResponse = {
        config: undefined, headers: undefined, statusText: 'OK',
        status: 200,
        data: undefined,
      };
      //Given
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const claim = await civilServiceClient.verifyPin(appReq, '604JE498','100010000');

      //Then
      expect(claim).toEqual(new Claim());
    });
  });
  describe('calculateClaimInterest', () => {
    it('should get calculate claim interest', async () => {
      //Given
      const mockData = 0.02;
      const mockPost = jest.fn().mockResolvedValue({ data: mockData });
      mockedAxios.create.mockReturnValueOnce({ post: mockPost } as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //When
      const interest = await civilServiceClient.calculateClaimInterest({});
      //Then
      expect(interest).toEqual(mockData);
    });

    it('should throw error on calculate claim interest', async () => {
      //Given
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({ post: mockGet } as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //Then
      await expect(civilServiceClient.calculateClaimInterest({})).rejects.toThrow('error');
    });
  });

  describe('calculateClaimTotalAmount', () => {
    it('should get calculate claim total', async () => {
      //Given
      const mockData = 100;
      const mockPost = jest.fn().mockResolvedValue({ data: mockData });
      mockedAxios.create.mockReturnValueOnce({ post: mockPost } as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //When
      const claimTotal = await civilServiceClient.calculateClaimTotalAmount({});
      //Then
      expect(claimTotal).toEqual(mockData);
    });

    it('should throw error on calculate claim total', async () => {
      //Given
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({ post: mockGet } as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl, true);
      //Then
      await expect(civilServiceClient.calculateClaimTotalAmount({})).rejects.toThrow('error');
    });
  });

  describe('getFeePaymentRedirectInformation', () => {
    const claimId = '1';
    it('should get payment redirect information', async () => {
      const mockHearingFeePaymentRedirectInfo = {
        status: 'initiated',
        nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      };
      //Given
      const mockPost = jest.fn().mockResolvedValue({data: mockHearingFeePaymentRedirectInfo});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const paymentInformationResponse: PaymentInformation = await civilServiceClient.getFeePaymentRedirectInformation(claimId, FeeType.HEARING, appReq);

      //Then
      expect(paymentInformationResponse).toEqual(mockHearingFeePaymentRedirectInfo);
    });

    it('should throw error on get hearing fee redirect information', async () => {
      //Given
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //Then
      await expect(civilServiceClient.getFeePaymentRedirectInformation(claimId,  FeeType.HEARING , appReq)).rejects.toThrow('error');
    });
  });

  describe('getFeePaymentStatus', () => {
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
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const paymentInformationResponse: PaymentInformation = await civilServiceClient.getFeePaymentStatus('1', mockHearingFeePaymentRedirectInfo.paymentReference, FeeType.HEARING, appReq);

      //Then
      expect(paymentInformationResponse).toEqual(mockHearingFeePaymentRedirectInfo);
    });

    it('should throw error on get hearing fee redirect information', async () => {
      //Given
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //Then
      await expect(civilServiceClient.getFeePaymentStatus('1', mockHearingFeePaymentRedirectInfo.paymentReference,  FeeType.HEARING , appReq)).rejects.toThrow('error');
    });
  });

  describe('getDashboard', () => {
    const mockNotificationInfo = [
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
        'titleEn': 'title_en',
        'titleCy': 'title_cy',
        'descriptionEn': 'description_en',
        'descriptionCy': 'description_cy',
        'notificationAction': undefined,
        'timeToLive': undefined,
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'undefined',
        'notificationAction': {
          'id': 1,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User',
          'createdAt': new Date(100000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'Click',
        'notificationAction': {
          'id': 2,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User',
          'createdAt': new Date(100000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'Session',
        'notificationAction': {
          'id': 3,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User',
          'createdAt': new Date(100000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'Session',
        'notificationAction': {
          'id': 4,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User',
          'createdAt': new Date(200000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'Session',
        'notificationAction': {
          'id': 5,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User 2',
          'createdAt': new Date(100000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
    ];
    const mockNotificationInfoExpected = [
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
        'titleEn': 'title_en',
        'titleCy': 'title_cy',
        'descriptionEn': 'description_en',
        'descriptionCy': 'description_cy',
        'notificationAction': undefined,
        'timeToLive': undefined,
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'undefined',
        'notificationAction': {
          'id': 1,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User',
          'createdAt': new Date(100000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'Session',
        'notificationAction': {
          'id': 4,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User',
          'createdAt': new Date(200000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'Session',
        'notificationAction': {
          'id': 5,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User 2',
          'createdAt': new Date(100000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
    ];
    const mockGaNotificationInfo = {
      '123': [
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'titleEn': 'title_en',
          'titleCy': 'title_cy',
          'descriptionEn': 'description_en',
          'descriptionCy': 'description_cy',
          'notificationAction': undefined,
          'timeToLive': undefined,
          'createdAt': 'createdAt',
          'deadline': 'deadline',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
          'timeToLive': 'undefined',
          'notificationAction': {
            'id': 1,
            'reference': '123456',
            'actionPerformed': 'Click',
            'createdBy': 'Test User',
            'createdAt': new Date(100000),
          },
          'createdAt': 'createdAt',
          'deadline': 'deadline',
        },
      ],
      '456': [
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
          'timeToLive': 'Click',
          'notificationAction': {
            'id': 2,
            'reference': '123456',
            'actionPerformed': 'Click',
            'createdBy': 'Test User',
            'createdAt': new Date(100000),
          },
          'createdAt': 'createdAt',
          'deadline': 'deadline',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'titleEn': 'title_en_2',
          'titleCy': 'title_cy_2',
          'descriptionEn': 'description_en_2',
          'descriptionCy': 'description_cy_2',
          'timeToLive': 'Session',
          'notificationAction': {
            'id': 3,
            'reference': '123456',
            'actionPerformed': 'Click',
            'createdBy': 'Test User',
            'createdAt': new Date(100000),
          },
          'createdAt': 'createdAt',
          'deadline': 'deadline',
        },
      ],
    };
    const mockGa1NotificationInfoExpected = [
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
        'titleEn': 'title_en',
        'titleCy': 'title_cy',
        'descriptionEn': 'description_en',
        'descriptionCy': 'description_cy',
        'notificationAction': undefined,
        'timeToLive': undefined,
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'titleEn': 'title_en_2',
        'titleCy': 'title_cy_2',
        'descriptionEn': 'description_en_2',
        'descriptionCy': 'description_cy_2',
        'timeToLive': 'undefined',
        'notificationAction': {
          'id': 1,
          'reference': '123456',
          'actionPerformed': 'Click',
          'createdBy': 'Test User',
          'createdAt': new Date(100000),
        },
        'createdAt': 'createdAt',
        'deadline': 'deadline',
      },
    ];

    const mockExpectedDashboardInfo=
      [{
        'categoryEn': 'Hearing',
        'categoryCy': 'Hearing Welsh',
        tasks: [{
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
          'statusCy': 'Action needed in Welsh',
          'statusEn': 'Action needed',
          'statusColour' : 'govuk-tag--red',
          'taskNameEn': 'task_name_en',
          'hintTextEn': 'hint_text_en',
          'taskNameCy': 'task_name_cy',
          'hintTextCy': 'hint_text_cy',
        }, {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
          'statusCy': 'Action needed in Welsh',
          'statusEn': 'Action needed',
          'statusColour' : 'govuk-tag--red',
          'taskNameEn': 'task_name_en',
          'hintTextEn': 'hint_text_en',
          'taskNameCy': 'task_name_cy',
          'hintTextCy': 'hint_text_cy',
        }],
      },{
        'categoryEn': 'Claim',
        'categoryCy': 'Claim Welsh',
        tasks:[{
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
          'statusCy': 'Action needed in Welsh',
          'statusEn': 'Action needed',
          'statusColour' : 'govuk-tag--red',
          'taskNameEn': 'task_name_en2',
          'hintTextEn': 'hint_text_en2',
          'taskNameCy': 'task_name_cy2',
          'hintTextCy': 'hint_text_cy2',
        },
        {
          'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
          'statusCy': 'Action needed in Welsh',
          'statusEn': 'Action needed',
          'statusColour' : 'govuk-tag--red',
          'taskNameEn': 'task_name_en2',
          'hintTextEn': 'hint_text_en2',
          'taskNameCy': 'task_name_cy2',
          'hintTextCy': 'hint_text_cy2',
        }],
      }];
    const mockDashboardInfo =[
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
        'reference': '123',
        'currentStatusEn': 'Action needed',
        'currentStatusCy': 'Action needed in Welsh',
        'taskNameEn': 'task_name_en',
        'hintTextEn': 'hint_text_en',
        'taskNameCy': 'task_name_cy',
        'hintTextCy': 'hint_text_cy',
        'updatedBy': 'Test',
        'categoryEn': 'Hearing',
        'categoryCy': 'Hearing Welsh',
        'role': 'claimant',
        'taskOrder': 10,
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
        'reference': '123',
        'currentStatusEn': 'Action needed',
        'currentStatusCy': 'Action needed in Welsh',
        'taskNameEn': 'task_name_en',
        'hintTextEn': 'hint_text_en',
        'taskNameCy': 'task_name_cy',
        'hintTextCy': 'hint_text_cy',
        'updatedBy': 'Test',
        'categoryEn': 'Hearing',
        'categoryCy': 'Hearing Welsh',
        'role': 'claimant',
        'taskOrder': 10,
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
        'reference': '123',
        'currentStatusEn': 'Action needed',
        'currentStatusCy': 'Action needed in Welsh',
        'taskNameEn': 'task_name_en2',
        'hintTextEn': 'hint_text_en2',
        'taskNameCy': 'task_name_cy2',
        'hintTextCy': 'hint_text_cy2',
        'updatedBy': 'Test2',
        'categoryEn': 'Claim',
        'categoryCy': 'Claim Welsh',
        'role': 'claimant',
        'taskOrder': 10,
      },
      {
        'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
        'reference': '123',
        'currentStatusEn': 'Action needed',
        'currentStatusCy': 'Action needed in Welsh',
        'taskNameEn': 'task_name_en2',
        'hintTextEn': 'hint_text_en2',
        'taskNameCy': 'task_name_cy2',
        'hintTextCy': 'hint_text_cy2',
        'updatedBy': 'Test2',
        'categoryEn': 'Claim',
        'categoryCy': 'Claim Welsh',
        'role': 'claimant',
        'taskOrder': 10,
      },
    ];
    it('should get notification List', async () => {
      //Given
      const mockGet = jest.fn().mockResolvedValue({data: mockNotificationInfo});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const notificationResponse = await civilServiceClient.retrieveNotification('123','claimant', appReq);

      //Then
      expect(notificationResponse.items).toEqual(mockNotificationInfoExpected);
    });

    it('should get ga notification Map', async () => {
      //Given
      const mockGet = jest.fn().mockResolvedValue({data: mockGaNotificationInfo});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const notificationResponse = await civilServiceClient.retrieveGaNotification(['123', '456'],'claimant', appReq);

      //Then
      expect(notificationResponse.get('123').items).toEqual(mockGa1NotificationInfoExpected);
      expect(notificationResponse.get('456').items).toEqual([]);
    });

    it('should get dashboard Task List', async () => {
      //Given
      const mockGet = jest.fn().mockResolvedValue({data: mockDashboardInfo});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      const taskListResponse = await civilServiceClient.retrieveDashboard('123','claimant' , appReq);

      //Then
      expect(taskListResponse.items).toEqual(mockExpectedDashboardInfo);
    });
    it('should update dashboard Task List', async () => {
      //Given
      const mockPut = jest.fn().mockResolvedValue({data:{}});
      mockedAxios.create.mockReturnValueOnce({put: mockPut} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);

      //When
      await civilServiceClient.updateTaskStatus('123', appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPut.mock.calls[0][0]).toEqual(CIVIL_SERVICE_UPDATE_TASK_STATUS_URL.replace(':taskItemId', '123'));
    });
  });

  describe('postScenario', () => {

    it('should call civil service api to start scenario for dashboard', async () => {
      //Given
      const mockPost = jest.fn().mockResolvedValue({data:{}});
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      await civilServiceClient.createDashboard(appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL
        .replace(':scenarioRef', 'Scenario.AAA6.ClaimIssue.ClaimSubmit.Required')
        .replace(':redisKey', '1'));
    });

    it('should throw error when there is an error calling civil service to start scenario for dashboard', async () => {
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.createDashboard(appReq)).rejects.toThrow('error');
    });
  });

  describe('putScenario', () => {

    it('should call dashboard-notifications endpoint for recording notification', async () => {
      //Given
      const mockPut = jest.fn().mockResolvedValue({data:{}});
      mockedAxios.create.mockReturnValueOnce({put: mockPut} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //When
      await civilServiceClient.recordClick('123', appReq);
      //Then
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: baseUrl,
      });
      expect(mockPut.mock.calls[0][0]).toEqual(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '123'));
    });

    it('should throw error when there is an error calling civil service to record click', async () => {
      const mockPut = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({put: mockPut} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.recordClick('123', appReq)).rejects.toThrow('error');
    });
  });

  describe('Throw errors', ()=> {
    it('should throw error isDefendantLinked ', async () => {
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.isDefendantLinked('123')).rejects.toThrow('error');
    });
    it('should throw error getFeeRanges ', async () => {
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.getFeeRanges(appReq)).rejects.toThrow('error');
    });
    it('should throw error getHearingAmount ', async () => {
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.getHearingAmount(123,appReq)).rejects.toThrow('error');
    });
    it('should throw error getClaimsForClaimant ', async () => {
      const mockGet = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.getClaimsForClaimant(appReq)).rejects.toThrow('error');
    });
    it('should throw error verifyOcmcPin ', async () => {
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.verifyOcmcPin('1','123')).rejects.toThrow('error');
    });
    it('should throw error retrieveByDefendantId ', async () => {
      const mockPost = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.retrieveByDefendantId(appReq)).rejects.toThrow('error');
    });
    it('should throw error retrieveByDefendantId ', async () => {
      const mockPut = jest.fn().mockImplementation(() => {
        throw new Error('error');
      });
      mockedAxios.create.mockReturnValueOnce({put: mockPut} as unknown as AxiosInstance);
      const civilServiceClient = new CivilServiceClient(baseUrl);
      //Then
      await expect(civilServiceClient.updateTaskStatus('123',appReq)).rejects.toThrow('error');
    });
  });
});

import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';
import {CivilClaimResponse} from '../../common/models/civilClaimResponse';
import {
  CIVIL_SERVICE_CALCULATE_DEADLINE,
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_SUBMIT_EVENT,
  // CIVIL_SERVICE_VALIDATE_PIN_URL,
} from './civilServiceUrls';
import {FeeRange, FeeRanges} from '../../common/models/feeRange';
import {plainToInstance} from 'class-transformer';
import {CaseDocument} from 'common/models/document/caseDocument';
import {CLAIM_DETAILS_NOT_AVAILBALE, DOCUMENT_NOT_AVAILABLE} from './errorMessageContants';
import {
  DashboardDefendantItem,
  DashboardClaimantItem,
} from '../../common/models/dashboard/dashboardItem';
import {EventDto} from '../../common/models/events/eventDto';
import {CaseEvent} from '../../common/models/events/caseEvent';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('civilServiceClient');

const convertCaseToClaimAndIncludeState = (caseDetails: CivilClaimResponse): Claim => {
  const claim = Object.assign(new Claim(), caseDetails.case_data);
  claim.ccdState = caseDetails.state;
  return claim;
};
export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string, isDocumentInstance? : boolean) {
    if (isDocumentInstance) {
      this.client = Axios.create({
        baseURL,
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
      });
    } else {
      this.client = Axios.create({
        baseURL,
      });
    }
  }

  getConfig(req: AppRequest) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session?.user?.accessToken}`,
      },
    };
  }

  async getClaimsForClaimant(req: AppRequest) : Promise<DashboardClaimantItem[]>{
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    try {
      const response = await this.client.get('/cases/claimant/' + submitterId, config);
      return plainToInstance(DashboardClaimantItem, response.data as object[]);
    } catch (err) {
      logger.log(err);
    }
  }

  async getClaimsForDefendant(req: AppRequest): Promise <DashboardDefendantItem[]>{
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    try{
      const response = await this.client.get('/cases/defendant/' + submitterId, config);
      console.log(response.data);
      return plainToInstance(DashboardDefendantItem, response.data as object[]);
    }catch(err){
      logger.log(err);
    }
  }

  async retrieveByDefendantId(req: AppRequest): Promise<CivilClaimResponse[]> {
    const config = this.getConfig(req);
    let claims: CivilClaimResponse[] = [];
    await this.client.post(CIVIL_SERVICE_CASES_URL, {match_all: {}}, config)
      .then(response => {
        claims = response.data.cases.map((claim: CivilClaimResponse) => {
          const caseData = Object.assign(new Claim(), claim.case_data);
          return new CivilClaimResponse(claim.id, caseData);
        });
      }).catch(error => {
        console.log(error.message);
      });
    return claims;
  }

  async retrieveClaimDetails(claimId: string, req: AppRequest): Promise<Claim> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(`/cases/${claimId}`, config);// nosonar
      if (!response.data) {
        throw new AssertionError({message: CLAIM_DETAILS_NOT_AVAILBALE});
      }
      const caseDetails: CivilClaimResponse = response.data;
      return convertCaseToClaimAndIncludeState(caseDetails);
    } catch (err: unknown) {
      logger.error(err);
    }
  }

  async getFeeRanges(req: AppRequest): Promise<FeeRanges> {
    const config = this.getConfig(req);
    try{
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_FEES_RANGES, config);
      return new FeeRanges(plainToInstance(FeeRange, response.data as object[]));
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async verifyPin(req: AppRequest, pin: string, caseReference: string): Promise<AxiosResponse> {
    try {
      // const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_VALIDATE_PIN_URL
      // .replace(':caseReference', caseReference), pin, config);
      // return response;

      // TODO: return real service once complete, this is a mock response
      const mockFullClaim = {'id':1662129391355637,'jurisdiction':'CIVIL','case_type_id':'CIVIL','created_date':'2022-09-02T14:36:31.305','last_modified':'2022-09-02T14:36:40.518','state':'AWAITING_RESPONDENT_ACKNOWLEDGEMENT','case_data':{'systemGeneratedCaseDocuments':[{'id':'1fb3e0aa-df2a-4c1a-96be-3d25897ca82d','value':{'documentType':'SEALED_CLAIM','createdBy':'Civil','documentLink':{'document_binary_url':'http://dm-store:8080/documents/9cc38bf8-6521-4e0d-ab3a-8868c45114c3/binary','document_filename':'sealed_claim_form_000MC058.pdf','document_url':'http://dm-store:8080/documents/9cc38bf8-6521-4e0d-ab3a-8868c45114c3'},'createdDatetime':'2022-09-02T16:36:36','documentName':'sealed_claim_form_000MC058.pdf','documentSize':43911}}],'claimNotificationDate':'2022-09-02T15:36:38.440611','addRespondent2':'No','legacyCaseReference':'000MC058','submittedDate':'2022-09-02T15:36:31.393061','paymentSuccessfulDate':'2022-09-02T15:36:35.319783','respondent1Represented':'No','applicantSolicitor1ClaimStatementOfTruth':{'role':'Worker','name':'Test'},'respondent1ResponseDeadline':'2022-09-16T16:00:00','businessProcess':{'camundaEvent':'CREATE_CLAIM_SPEC','status':'FINISHED'},'solicitorReferences':{'respondentSolicitor1Reference':'Test 2','applicantSolicitor1Reference':'Test'},'applicantSolicitor1UserDetails':{'email':'civilmoneyclaimsdemo@gmail.com'},'respondent1':{'partyEmail':'civilmoneyclaimsdemo@gmail.com','partyTypeDisplayValue':'Company','companyName':'Test Company 2','partyName':'Test Company 2','primaryAddress':{'AddressLine1':'Test Company 2 Address','PostCode':'BA12SS'},'type':'COMPANY'},'respondent1PinToPostLRspec':{'expiryDate':'2023-03-01','accessCode':'C7NM3PCDJXKW','respondentCaseRole':'[RESPONDENTSOLICITORONESPEC]'},'addApplicant2':'No','applicant1':{'partyTypeDisplayValue':'Company','companyName':'Test Company 1','partyName':'Test Company 1','primaryAddress':{'AddressLine1':'Test Company 1 Address','PostCode':'BA12SS'},'type':'COMPANY'},'timelineOfEvents':[{'id':'aa9c73df-b0c4-466d-be88-eb3ebfa2dcf2','value':{'timelineDate':'2021-11-11','timelineDescription':'test'}}],'applicant1OrganisationPolicy':{'OrgPolicyCaseAssignedRole':'[APPLICANTSOLICITORONESPEC]','Organisation':{'OrganisationID':'Q1KOKP2'}},'claimNotificationDeadline':'2023-01-02T23:59:59','issueDate':'2022-09-02','claimIssuedPaymentDetails':{'reference':'RC-1234-1234-1234-1234','customerReference':'Test','status':'SUCCESS'},'detailsOfClaim':'test','superClaimType':'SPEC_CLAIM'},'security_classification':'PUBLIC'};
      const mockResponse: AxiosResponse = {
        status: 401,
        data: mockFullClaim,
        statusText: null,
        headers: null,
        config: null,
      };
      if(caseReference === '000MC000' && pin === '0000'){
        mockResponse.status = 200;
      } else if(caseReference === '111MC111' && pin === '1111'){
        mockResponse.status = 400;
      } else if(caseReference === 'error' && pin === 'error'){
        mockResponse.status = 500;
      }
      return mockResponse;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async retrieveDocument(documentDetails : CaseDocument, req: AppRequest): Promise<Buffer> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL, documentDetails, config);
      if (!response.data) {
        throw new AssertionError({message: DOCUMENT_NOT_AVAILABLE});
      }
      return response.data as Buffer;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async submitDefendantResponseEvent(claimId: string, req: AppRequest): Promise<Claim> {
    return await this.submitEvent(CaseEvent.DEFENDANT_RESPONSE_SPEC, claimId, req);
  }

  async submitEvent(event: CaseEvent, claimId: string, req: AppRequest): Promise<Claim> {
    const config = this.getConfig(req);
    const userId = req.session?.user?.id;
    const data : EventDto = {
      event:event,
      caseDataUpdate: new Map<string, string>(),
    };
    try{
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_SUBMIT_EVENT // nosonar
        .replace(':submitterId', userId)
        .replace(':caseId', claimId), data, config);// nosonar
      console.log('submitted event ' + response.data);
      return  Object.assign(new Claim(), response.data);
    }catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async calculateExtendedResponseDeadline(extendedDeadline: Date, req: AppRequest): Promise<Date> {
    const config = this.getConfig(req);
    try{
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_CALCULATE_DEADLINE, extendedDeadline, config);
      return  response.data as Date;
    }catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }
}

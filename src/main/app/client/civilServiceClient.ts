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
      console.log(err);
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
      console.log(err);
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

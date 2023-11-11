import {Claim} from 'common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from 'common/models/AppRequest';
import {CivilClaimResponse, ClaimFeeData} from 'common/models/civilClaimResponse';
import {
  ASSIGN_CLAIM_TO_DEFENDANT,
  CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE,
  CIVIL_SERVICE_CALCULATE_DEADLINE,
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_CLAIM_AMOUNT_URL, CIVIL_SERVICE_COURT_DECISION,
  CIVIL_SERVICE_COURT_LOCATIONS, CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_HEARING_URL,
  CIVIL_SERVICE_SUBMIT_EVENT, CIVIL_SERVICE_UPLOAD_DOCUMENT_URL, CIVIL_SERVICE_USER_CASE_ROLE,
  CIVIL_SERVICE_VALIDATE_PIN_URL,
} from './civilServiceUrls';
import {FeeRange, FeeRanges} from 'common/models/feeRange';
import {plainToInstance} from 'class-transformer';
import {CaseDocument} from 'common/models/document/caseDocument';
import { DashboardClaimantItem, DashboardDefendantItem } from 'models/dashboard/dashboardItem';
import {ClaimUpdate, EventDto} from 'models/events/eventDto';
import {CaseEvent} from 'models/events/caseEvent';
import {CourtLocation} from 'models/courts/courtLocations';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {FileResponse} from 'common/models/FileResponse';
import {FileUpload} from 'models/caseProgression/fileUpload';
import {
  DashboardClaimantResponse,
  DashboardDefendantResponse,
} from 'common/models/dashboard/dashboarddefendantresponse';
import {CaseRole} from 'form/models/caseRoles';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {CCDClaimantProposedPlan} from 'models/claimantResponse/ClaimantProposedPlan';
import { ClaimantResponseRequestDefaultJudgementToCCD } from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('civilServiceClient');

const convertCaseToClaim = (caseDetails: CivilClaimResponse): Claim => {
  const claim: Claim = translateCCDCaseDataToCUIModel(caseDetails.case_data);
  claim.ccdState = caseDetails.state;
  claim.id = caseDetails.id;
  claim.lastModifiedDate = caseDetails.last_modified;
  return claim;
};

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string, isDocumentInstance?: boolean) {
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

  async getClaimsForClaimant(req: AppRequest): Promise<DashboardClaimantResponse> {
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    const currentPage = req.query?.claimantPage ?? 1;
    try {
      const response = await this.client.get('/cases/claimant/' + submitterId + '?page=' + currentPage, config);
      const dashboardClaimantItemList = plainToInstance(DashboardClaimantItem, response.data.claims as object[]);
      return { claims: dashboardClaimantItemList, totalPages: response.data.totalPages };
    } catch (err) {
      logger.error(err);
    }
  }

  async getClaimsForDefendant(req: AppRequest): Promise<DashboardDefendantResponse> {
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    const currentPage = req.query?.defendantPage ?? 1;
    try {
      const response = await this.client.get('/cases/defendant/' + submitterId + '?page=' + currentPage, config);
      const dashboardDefendantItemList = plainToInstance(DashboardDefendantItem, response.data.claims as object[]);
      return { claims: dashboardDefendantItemList, totalPages: response.data.totalPages };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async retrieveByDefendantId(req: AppRequest): Promise<CivilClaimResponse[]> {
    const config = this.getConfig(req);
    let claims: CivilClaimResponse[] = [];
    await this.client.post(CIVIL_SERVICE_CASES_URL, {match_all: {}}, config)
      .then(response => {
        claims = response.data.cases.map((claim: CivilClaimResponse) => {
          //TODO Maybe we need to convert also CCD to CUI
          const caseData = Object.assign(new Claim(), claim.case_data);
          return new CivilClaimResponse(claim.id, caseData);
        });
      }).catch(error => {
        logger.error(error.message);
      });
    return claims;
  }

  async retrieveClaimDetails(claimId: string, req: AppRequest): Promise<Claim> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(`/cases/${claimId}`, config);// nosonar
      if (!response.data) {
        throw new AssertionError({message: 'Claim details not available!'});
      }
      const caseDetails: CivilClaimResponse = response.data;
      logger.info('----ccd-caseDetails----', caseDetails);

      caseDetails.case_data.caseRole = await this.getUserCaseRoles(claimId, req);
      return convertCaseToClaim(caseDetails);
    } catch (err: unknown) {
      logger.error(err);
    }
  }

  async getFeeRanges(req: AppRequest): Promise<FeeRanges> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_FEES_RANGES, config);
      return new FeeRanges(plainToInstance(FeeRange, response.data as object[]));
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async getHearingAmount(amount: number, req: AppRequest): Promise<any> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(`${CIVIL_SERVICE_HEARING_URL}/${amount}`, config);
      return response.data;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async getClaimAmountFee(amount: number, req: AppRequest): Promise<number> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(`${CIVIL_SERVICE_CLAIM_AMOUNT_URL}/${amount}`, config);
      const claimFeeResponse: ClaimFeeData = response.data;
      return convertToPoundsFilter(claimFeeResponse?.calculatedAmountInPence.toString());
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async verifyPin(req: AppRequest, pin: string, caseReference: string): Promise<Claim> {
    try {
      const response = await this.client.post(CIVIL_SERVICE_VALIDATE_PIN_URL //nosonar
        .replace(':caseReference', caseReference), {pin:pin}, {headers: {'Content-Type': 'application/json'}});// nosonar
      if (!response.data) {
        return new Claim();
      }
      const caseDetails: CivilClaimResponse = response.data;
      return convertCaseToClaim(caseDetails);

    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async uploadDocument(req: AppRequest, file: FileUpload): Promise<CaseDocument> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([file.buffer]) , file.originalname);
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_UPLOAD_DOCUMENT_URL, formData,
        {headers: {'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${req.session?.user?.accessToken}`}});
      if (!response.data) {
        throw new AssertionError({message: 'Document upload unsuccessful.'});
      }
      if (response.data instanceof Uint8Array) {
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(response.data);
        return JSON.parse(decodedString) as CaseDocument;
      } else {
        return response.data as CaseDocument;
      }
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async retrieveDocument(req: AppRequest, documentId: string ) {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL
        .replace(':documentId', documentId), config);

      return new FileResponse(response.headers['content-type'],
        response.headers['original-file-name'],
        response.data as Buffer);

    } catch (err) {
      logger.error(`Error occurred: ${err.message}, http Code: ${err.code}`);
      throw err;
    }
  }

  async submitDefendantResponseEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFENDANT_RESPONSE_CUI, claimId, updatedClaim, req);
  }

  async submitClaimantResponseEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.CLAIMANT_RESPONSE_CUI, claimId, updatedClaim, req);
  }

  async submitAgreedResponseExtensionDateEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.INFORM_AGREED_EXTENSION_DATE_SPEC, claimId, updatedClaim, req);
  }

  async submitDraftClaim(updatedClaim: ClaimUpdate, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_LIP_CLAIM, 'draft', updatedClaim, req);
  }

  async submitClaimAfterPayment(claimId: string, claim: Claim, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_CLAIM_SPEC_AFTER_PAYMENT, claimId,
      {
        issueDate : claim.issueDate,
        respondent1ResponseDeadline: claim.respondent1ResponseDeadline,
      }
      , req);
  }

  async submitClaimantResponseDJEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFAULT_JUDGEMENT_SPEC, claimId, updatedClaim, req);
  }

  async submitClaimantResponseForRequestJudgementAdmission(claimId: string, updatedClaim: ClaimantResponseRequestDefaultJudgementToCCD, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.REQUEST_JUDGEMENT_ADMISSION_SPEC, claimId, updatedClaim, req);
  }

  async submitDefendantTrialArrangement(claimId: string, updatedClaim: ClaimUpdate, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFENDANT_TRIAL_ARRANGEMENTS, claimId, updatedClaim, req);
  }

  async submitClaimSettled(claimId: string, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.LIP_CLAIM_SETTLED,  claimId, {}, req);
  }

  async submitBreathingSpaceEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.ENTER_BREATHING_SPACE_LIP, claimId, updatedClaim, req);
  }

  async submitBreathingSpaceLiftedEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.LIFT_BREATHING_SPACE_LIP, claimId, updatedClaim, req);
  }

  async submitEvent(event: CaseEvent, claimId: string, updatedClaim?: ClaimUpdate, req?: AppRequest): Promise<Claim> {
    const config = this.getConfig(req);
    const userId = req.session?.user?.id;
    const data: EventDto = {
      event: event,
      caseDataUpdate: updatedClaim,
    };
    try {
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_SUBMIT_EVENT // nosonar
        .replace(':submitterId', userId)
        .replace(':caseId', claimId), data, config);// nosonar
      logger.info('submitted event ' + data.event + ' with update ' + data.caseDataUpdate);
      const claimResponse = response.data as CivilClaimResponse;
      return convertCaseToClaim(claimResponse);
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async calculateExtendedResponseDeadline(extendedDeadline: Date, plusDays: number, req: AppRequest): Promise<Date> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_CALCULATE_DEADLINE, {
        responseDate: extendedDeadline,
        plusDays: plusDays,
      }, config);
      return response.data as Date;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async getCourtLocations(req: AppRequest): Promise<CourtLocation[]> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_COURT_LOCATIONS, config);
      return plainToInstance(CourtLocation, response.data as object[]);
    } catch (error: unknown) {
      logger.error(error);
      throw error;
    }
  }

  async assignDefendantToClaim(claimId:string, req:AppRequest): Promise<void> {
    try{
      await this.client.post(ASSIGN_CLAIM_TO_DEFENDANT.replace(':claimId', claimId),{}, // nosonar
        {headers: {'Authorization': `Bearer ${req.session?.user?.accessToken}`}}); // nosonar
    } catch (error: unknown) {
      logger.error(error);
      throw error;
    }
  }

  async getAgreedDeadlineResponseDate(claimId: string, req: AppRequest): Promise<Date> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE.replace(':claimId', claimId), config);
      if(response.data)
        return new Date(response.data.toString());
    } catch (error: unknown) {
      logger.error(error);
      throw error;
    }
  }

  async getUserCaseRoles(claimId: string, req: AppRequest) {
    try {
      const userCaseRolesUrl = (new URL(`${this.client.defaults.baseURL}${CIVIL_SERVICE_USER_CASE_ROLE.replace(':claimId', claimId)}`));
      const response: AxiosResponse<object> = await this.client.get(userCaseRolesUrl.toString()
        , {headers: {'Authorization': `Bearer ${req.session?.user?.accessToken}`}});
      const responseRoles = response.data as string[];
      return responseRoles
        .map(role => Object.values(CaseRole).find(enumValue => enumValue === role))
        .at(0);

    } catch (err) {
      logger.error(`Error occurred: ${err.message}, http Code: ${err.code}`);
      throw err;
    }
  }

  async getCalculatedDecisionOnClaimantProposedRepaymentPlan(claimId: string, req: AppRequest, claimantProposedPlan: CCDClaimantProposedPlan) :Promise<RepaymentDecisionType> {
    const config = this.getConfig(req);
    try{
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_COURT_DECISION.replace(':claimId', claimId), claimantProposedPlan, config);
      return response.data as unknown as RepaymentDecisionType;
    } catch(err) {
      logger.error(`Error occurred: ${err.message}, http Code: ${err.code}`);
      throw err;
    }
  }
}

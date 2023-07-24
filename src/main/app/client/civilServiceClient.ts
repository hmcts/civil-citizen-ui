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
  CIVIL_SERVICE_CLAIM_AMOUNT_URL,
  CIVIL_SERVICE_COURT_LOCATIONS, CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_HEARING_URL,
  CIVIL_SERVICE_SUBMIT_EVENT, CIVIL_SERVICE_UPLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_VALIDATE_PIN_URL,
} from './civilServiceUrls';
import {FeeRange, FeeRanges} from 'common/models/feeRange';
import {plainToInstance} from 'class-transformer';
import {CaseDocument} from 'models/document/caseDocument';
import {DashboardClaimantItem, DashboardDefendantItem} from 'models/dashboard/dashboardItem';
import {ClaimUpdate, EventDto} from 'models/events/eventDto';
import {CaseEvent} from 'models/events/caseEvent';
import {CourtLocation} from 'models/courts/courtLocations';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {FileResponse} from 'models/FileResponse';
import {FileUpload} from 'models/caseProgression/fileUpload';
import {generateServiceToken} from "client/serviceAuthProviderClient";
import config from "config";

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

  async getConfig(req: AppRequest) {
    const civilServiceS2sSecret = config.get<string>('services.serviceAuthProvider.civilServiceS2sSecret');
    const s2sAuth = await generateServiceToken('civil_service', civilServiceS2sSecret);

    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session?.user?.accessToken}`,
        'ServiceAuthorization': s2sAuth,
      },
    };
  }

  async getClaimsForClaimant(req: AppRequest): Promise<DashboardClaimantItem[]> {
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    try {
      const response = await this.client.get('/cases/claimant/' + submitterId, await config);
      return plainToInstance(DashboardClaimantItem, response.data as object[]);
    } catch (err) {
      logger.error(err);
    }
  }

  async getClaimsForDefendant(req: AppRequest): Promise<DashboardDefendantItem[]> {
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    try {
      const response = await this.client.get('/cases/defendant/' + submitterId, await config);
      return plainToInstance(DashboardDefendantItem, response.data as object[]);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async retrieveByDefendantId(req: AppRequest): Promise<CivilClaimResponse[]> {
    const config = this.getConfig(req);
    let claims: CivilClaimResponse[] = [];
    await this.client.post(CIVIL_SERVICE_CASES_URL, {match_all: {}}, await config)
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
      const response = await this.client.get(`/cases/${claimId}`, await config);// nosonar
      if (!response.data) {
        throw new AssertionError({message: 'Claim details not available!'});
      }
      const caseDetails: CivilClaimResponse = response.data;
      return convertCaseToClaim(caseDetails);
    } catch (err: unknown) {
      logger.error(err);
    }
  }

  async getFeeRanges(req: AppRequest): Promise<FeeRanges> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_FEES_RANGES, await config);
      return new FeeRanges(plainToInstance(FeeRange, response.data as object[]));
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async getHearingAmount(amount: number, req: AppRequest): Promise<any> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(`${CIVIL_SERVICE_HEARING_URL}/${amount}`, await config);
      return response.data;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async getClaimAmountFee(amount: number, req: AppRequest): Promise<number> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(`${CIVIL_SERVICE_CLAIM_AMOUNT_URL}/${amount}`, await config);
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
      return response.data as CaseDocument;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async retrieveDocument(documentId: string) {
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL
        .replace(':documentId', documentId));

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

  async submitAgreedResponseExtensionDateEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.INFORM_AGREED_EXTENSION_DATE_SPEC, claimId, updatedClaim, req);
  }

  async submitDraftClaim(updatedClaim: ClaimUpdate, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_LIP_CLAIM, 'draft', updatedClaim, req);
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
        .replace(':caseId', claimId), data, await config);// nosonar
      logger.info('submitted event ' + data.event + ' with update ' + data.caseDataUpdate);
      const claimResponse = response.data as CivilClaimResponse;
      return translateCCDCaseDataToCUIModel(claimResponse.case_data);
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async calculateExtendedResponseDeadline(extendedDeadline: Date, req: AppRequest): Promise<Date> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_CALCULATE_DEADLINE, extendedDeadline, await config);
      return response.data as Date;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async getCourtLocations(req: AppRequest): Promise<CourtLocation[]> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_COURT_LOCATIONS, await config);
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
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE.replace(':claimId', claimId), await config);
      if(response.data)
        return new Date(response.data.toString());
    } catch (error: unknown) {
      logger.error(error);
      throw error;
    }
  }
}
